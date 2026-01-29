import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Store processed event IDs for idempotency (in production, use Redis or database)
const processedEvents = new Set<string>();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency check
  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  processedEvents.add(event.id);

  // Clean up old events (keep last 1000)
  if (processedEvents.size > 1000) {
    const toDelete = Array.from(processedEvents).slice(0, 500);
    toDelete.forEach(id => processedEvents.delete(id));
  }

  const serviceClient = createServiceRoleClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          await serviceClient
            .from('subscriptions')
            .update({
              stripe_subscription_id: subscriptionId,
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const status = subscription.status === 'active' ? 'active' :
                      subscription.status === 'past_due' ? 'past_due' :
                      subscription.status === 'canceled' ? 'canceled' : 'inactive';

        await serviceClient
          .from('subscriptions')
          .update({
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await serviceClient
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Update active period stats when payment is received
        const { data: activePeriod } = await serviceClient
          .from('reward_periods')
          .select('*')
          .eq('status', 'active')
          .single();

        if (activePeriod) {
          const amount = (invoice.amount_paid || 0) / 100; // Convert from centavos
          const creatorFee = amount * 0.2;
          const rewardPool = amount * 0.8;

          await serviceClient
            .from('reward_periods')
            .update({
              total_revenue_mxn: activePeriod.total_revenue_mxn + amount,
              creator_fee_mxn: activePeriod.creator_fee_mxn + creatorFee,
              reward_pool_mxn: activePeriod.reward_pool_mxn + rewardPool,
              total_subscribers: activePeriod.total_subscribers + 1,
            })
            .eq('id', activePeriod.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await serviceClient
          .from('subscriptions')
          .update({
            status: 'past_due',
          })
          .eq('stripe_customer_id', customerId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

'use client';

import Link from 'next/link';
import { useTranslations, useLanguage } from '@/lib/i18n';

export default function TermsPage() {
  const t = useTranslations();
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Términos y Condiciones',
      lastUpdated: 'Última actualización: Enero 2025',
      sections: [
        {
          title: '1. Aceptación de Términos',
          content: 'Al acceder y utilizar ProcX, aceptas estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no debes utilizar el servicio.',
        },
        {
          title: '2. Descripción del Servicio',
          content: 'ProcX es una aplicación de productividad que ayuda a los usuarios a combatir la procrastinación mediante retos diarios. Los usuarios pueden ganar puntos completando retos y los mejores clasificados del mes reciben premios del fondo acumulado.',
        },
        {
          title: '3. Suscripción y Pagos',
          content: 'El servicio requiere una suscripción mensual de $99 MXN. El pago se procesa automáticamente cada mes. Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta.',
        },
        {
          title: '4. Sistema de Puntos y Premios',
          content: 'Los puntos se otorgan por completar check-ins diarios en los retos activos. Los premios se distribuyen mensualmente basándose únicamente en el desempeño (puntos acumulados). Los empates se resuelven mediante un algoritmo determinístico. Esto NO es un juego de azar, lotería ni rifa.',
        },
        {
          title: '5. Distribución de Fondos',
          content: 'El 80% de todas las suscripciones se destina al fondo de premios. El 20% restante cubre costos operativos y comisiones de la plataforma.',
        },
        {
          title: '6. Verificación KYC',
          content: 'Los ganadores deben completar un proceso de verificación de identidad (KYC) antes de recibir sus premios. Esto incluye proporcionar identificación oficial, selfie y datos bancarios.',
        },
        {
          title: '7. Pagos a Ganadores',
          content: 'Los pagos se realizan manualmente dentro de los 5 días hábiles siguientes a la verificación KYC aprobada. Los pagos se realizan únicamente mediante transferencia bancaria a cuentas CLABE mexicanas.',
        },
        {
          title: '8. Conducta del Usuario',
          content: 'Los usuarios se comprometen a usar el servicio de manera honesta. Cualquier intento de manipular el sistema, crear múltiples cuentas o hacer trampa resultará en la suspensión permanente de la cuenta.',
        },
        {
          title: '9. Modificaciones',
          content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados a los usuarios.',
        },
        {
          title: '10. Contacto',
          content: 'Para cualquier pregunta sobre estos términos, contáctanos a través de los canales oficiales de la aplicación.',
        },
      ],
    },
    en: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last updated: January 2025',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By accessing and using ProcX, you accept these terms and conditions. If you disagree with any of these terms, you should not use the service.',
        },
        {
          title: '2. Service Description',
          content: 'ProcX is a productivity app that helps users fight procrastination through daily challenges. Users can earn points by completing challenges and top performers of the month receive prizes from the accumulated pool.',
        },
        {
          title: '3. Subscription and Payments',
          content: 'The service requires a monthly subscription of $99 MXN. Payment is processed automatically each month. You can cancel your subscription at any time from your account settings.',
        },
        {
          title: '4. Points and Rewards System',
          content: 'Points are awarded for completing daily check-ins on active challenges. Prizes are distributed monthly based solely on performance (accumulated points). Ties are resolved through a deterministic algorithm. This is NOT gambling, lottery, or a raffle.',
        },
        {
          title: '5. Fund Distribution',
          content: '80% of all subscriptions goes to the prize pool. The remaining 20% covers operational costs and platform fees.',
        },
        {
          title: '6. KYC Verification',
          content: 'Winners must complete an identity verification process (KYC) before receiving their prizes. This includes providing official ID, selfie, and banking information.',
        },
        {
          title: '7. Winner Payments',
          content: 'Payments are made manually within 5 business days following approved KYC verification. Payments are made only via bank transfer to Mexican CLABE accounts.',
        },
        {
          title: '8. User Conduct',
          content: 'Users agree to use the service honestly. Any attempt to manipulate the system, create multiple accounts, or cheat will result in permanent account suspension.',
        },
        {
          title: '9. Modifications',
          content: 'We reserve the right to modify these terms at any time. Significant changes will be notified to users.',
        },
        {
          title: '10. Contact',
          content: 'For any questions about these terms, contact us through the app\'s official channels.',
        },
      ],
    },
  };

  const c = content[language];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-primary-600 hover:underline mb-8 block">
          &larr; {t.common.back}
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{c.title}</h1>
          <p className="text-sm text-gray-500 mb-8">{c.lastUpdated}</p>

          <div className="space-y-6">
            {c.sections.map((section, index) => (
              <div key={index}>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

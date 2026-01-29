'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';

interface AppLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export default function AppLayout({ children, isAdmin = false }: AppLayoutProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = isAdmin
    ? [
        { href: '/admin', label: t.admin.dashboard },
        { href: '/admin/challenges', label: t.admin.manageChallenges },
        { href: '/admin/periods', label: t.admin.managePeriods },
      ]
    : [
        { href: '/app', label: t.nav.home },
        { href: '/app/challenges', label: t.nav.challenges },
        { href: '/app/leaderboard', label: t.nav.leaderboard },
        { href: '/app/rewards', label: t.nav.rewards },
        { href: '/app/settings', label: t.nav.settings },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href={isAdmin ? '/admin' : '/app'} className="text-xl font-bold text-primary-600">
              {t.common.appName} {isAdmin && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded ml-2">Admin</span>}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/app"
                  className="text-sm font-medium text-gray-600 hover:text-primary-600"
                >
                  {t.nav.home}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-red-600"
              >
                {t.nav.logout}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center px-3 py-2 text-xs ${
                pathname === item.href
                  ? 'text-primary-600'
                  : 'text-gray-600'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}

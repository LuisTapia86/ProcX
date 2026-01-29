'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-600">{t.common.appName}</h1>
        <nav className="flex gap-4">
          <Link href="/auth/login" className="btn-secondary">
            {t.nav.login}
          </Link>
          <Link href="/auth/signup" className="btn-primary">
            {t.nav.signup}
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {t.home.hero}
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          {t.home.heroSubtitle}
        </p>
        <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
          {t.home.getStarted}
        </Link>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t.home.howItWorks}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h4 className="text-xl font-semibold mb-2">{t.home.step1Title}</h4>
            <p className="text-gray-600">{t.home.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h4 className="text-xl font-semibold mb-2">{t.home.step2Title}</h4>
            <p className="text-gray-600">{t.home.step2Desc}</p>
          </div>

          {/* Step 3 */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h4 className="text-xl font-semibold mb-2">{t.home.step3Title}</h4>
            <p className="text-gray-600">{t.home.step3Desc}</p>
          </div>

          {/* Step 4 */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">4</span>
            </div>
            <h4 className="text-xl font-semibold mb-2">{t.home.step4Title}</h4>
            <p className="text-gray-600">{t.home.step4Desc}</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t.home.pricing}
        </h3>
        <div className="max-w-md mx-auto card text-center border-2 border-primary-500">
          <div className="text-4xl font-bold text-primary-600 mb-4">
            {t.home.priceAmount}
          </div>
          <p className="text-gray-600 mb-6">{t.home.priceDesc}</p>
          <Link href="/auth/signup" className="btn-primary w-full block text-center">
            {t.home.getStarted}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-10 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} {t.common.appName}
          </p>
          <nav className="flex gap-6">
            <Link href="/terms" className="text-gray-600 hover:text-primary-600">
              {t.auth.termsLink}
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-primary-600">
              {t.auth.privacyLink}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

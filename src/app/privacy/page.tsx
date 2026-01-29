'use client';

import Link from 'next/link';
import { useTranslations, useLanguage } from '@/lib/i18n';

export default function PrivacyPage() {
  const t = useTranslations();
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Política de Privacidad',
      lastUpdated: 'Última actualización: Enero 2025',
      sections: [
        {
          title: '1. Información que Recopilamos',
          content: 'Recopilamos información que nos proporcionas directamente: nombre, correo electrónico, y para ganadores: identificación oficial, selfie, CLABE bancaria, nombre del banco y número telefónico.',
        },
        {
          title: '2. Uso de la Información',
          content: 'Utilizamos tu información para: proporcionar y mantener el servicio, procesar pagos, comunicarnos contigo, verificar identidad de ganadores, y cumplir con obligaciones legales.',
        },
        {
          title: '3. Almacenamiento de Datos',
          content: 'Tus datos se almacenan de forma segura en servidores de Supabase con encriptación. Los documentos KYC se almacenan en storage privado con acceso restringido.',
        },
        {
          title: '4. Compartir Información',
          content: 'No vendemos ni compartimos tu información personal con terceros, excepto: procesadores de pago (Stripe), cuando la ley lo requiera, o con tu consentimiento explícito.',
        },
        {
          title: '5. Seguridad',
          content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos, incluyendo: encriptación en tránsito y reposo, autenticación segura, y acceso restringido a datos sensibles.',
        },
        {
          title: '6. Tus Derechos',
          content: 'Tienes derecho a: acceder a tus datos, rectificar información incorrecta, solicitar eliminación de tu cuenta, y exportar tus datos.',
        },
        {
          title: '7. Cookies',
          content: 'Utilizamos cookies esenciales para el funcionamiento del servicio, como mantener tu sesión activa y recordar tus preferencias de idioma.',
        },
        {
          title: '8. Retención de Datos',
          content: 'Mantenemos tus datos mientras tu cuenta esté activa. Los datos de ganadores y documentos KYC se conservan por 5 años por requerimientos legales.',
        },
        {
          title: '9. Cambios a esta Política',
          content: 'Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos por correo electrónico o mediante aviso en la aplicación.',
        },
        {
          title: '10. Contacto',
          content: 'Para cualquier pregunta sobre privacidad, contáctanos a través de los canales oficiales de la aplicación.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2025',
      sections: [
        {
          title: '1. Information We Collect',
          content: 'We collect information you provide directly: name, email, and for winners: official ID, selfie, bank CLABE, bank name, and phone number.',
        },
        {
          title: '2. Use of Information',
          content: 'We use your information to: provide and maintain the service, process payments, communicate with you, verify winner identity, and comply with legal obligations.',
        },
        {
          title: '3. Data Storage',
          content: 'Your data is stored securely on Supabase servers with encryption. KYC documents are stored in private storage with restricted access.',
        },
        {
          title: '4. Sharing Information',
          content: 'We do not sell or share your personal information with third parties, except: payment processors (Stripe), when required by law, or with your explicit consent.',
        },
        {
          title: '5. Security',
          content: 'We implement technical and organizational security measures to protect your data, including: encryption in transit and at rest, secure authentication, and restricted access to sensitive data.',
        },
        {
          title: '6. Your Rights',
          content: 'You have the right to: access your data, correct inaccurate information, request deletion of your account, and export your data.',
        },
        {
          title: '7. Cookies',
          content: 'We use essential cookies for service functionality, such as keeping your session active and remembering your language preferences.',
        },
        {
          title: '8. Data Retention',
          content: 'We keep your data while your account is active. Winner data and KYC documents are retained for 5 years due to legal requirements.',
        },
        {
          title: '9. Changes to this Policy',
          content: 'We may update this policy occasionally. We will notify you of significant changes by email or through a notice in the app.',
        },
        {
          title: '10. Contact',
          content: 'For any privacy questions, contact us through the app\'s official channels.',
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

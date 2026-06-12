import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { CookieConsent } from '@/components/CookieConsent'
import { ChatBot } from '@/components/ChatBot'
import { AdScript } from '@/components/ads/AdScript'
import { Toaster } from 'sonner'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  organizationSchema,
  websiteSchema,
  webApplicationSchema,
} from '@/lib/seo/json-ld'

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'ZedIdeaArena — Win by Sharing Your Ideas',
    template: '%s | ZedIdeaArena',
  },
  description: 'A fintech-style idea competition and crowdfunding platform. Pitch your ideas, compete with others, and win funding.',
  metadataBase: new URL('https://zedideaarena.com'),
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/logo-icon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ZedIdeaArena',
    title: 'ZedIdeaArena — Win by Sharing Your Ideas',
    description: 'A fintech-style idea competition and crowdfunding platform. Pitch your ideas, compete with others, and win funding.',
    images: [{ url: '/og', width: 1200, height: 630 }],
    url: 'https://zedideaarena.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZedIdeaArena — Win by Sharing Your Ideas',
    description: 'Pitch your ideas, compete with others, and win funding.',
    images: ['/og'],
  },
  other: {
    'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-zed-background">
      <head>
        <meta name="theme-color" content="#050505" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}`
        }} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ZedIdeaArena" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${jakarta.className} font-sans antialiased bg-zed-background text-zed-foreground`}>
        <JsonLd data={organizationSchema()} id="organization-schema" />
        <JsonLd data={websiteSchema()} id="website-schema" />
        <JsonLd data={webApplicationSchema()} id="webapplication-schema" />
        <AuthProvider>
          {children}
          <CookieConsent />
          <ChatBot />
        </AuthProvider>
        <AdScript />
        <Toaster position="bottom-center" toastOptions={{ style: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }, className: 'text-xs font-bold' }} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { CookieConsent } from '@/components/CookieConsent'
import { ChatBot } from '@/components/ChatBot'
import { AdScript } from '@/components/ads/AdScript'
import { Toaster } from 'sonner'

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'ZedIdeaArena — Win by Sharing Your Ideas',
    template: '%s | ZedIdeaArena',
  },
  description: 'A fintech-style idea competition and crowdfunding platform. Pitch your ideas, compete with others, and win funding.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo-icon.png',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ZedIdeaArena',
    title: 'ZedIdeaArena — Win by Sharing Your Ideas',
    description: 'A fintech-style idea competition and crowdfunding platform. Pitch your ideas, compete with others, and win funding.',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    url: 'https://zedideaarena.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZedIdeaArena — Win by Sharing Your Ideas',
    description: 'Pitch your ideas, compete with others, and win funding.',
    images: ['/og-default.png'],
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
      </head>
      <body className={`${jakarta.className} font-sans antialiased bg-zed-background text-zed-foreground`}>
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

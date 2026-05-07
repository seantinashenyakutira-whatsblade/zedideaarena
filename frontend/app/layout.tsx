import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ZedIdeaArena - Pitch. Compete. Win.',
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
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

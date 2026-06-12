import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/competitions', '/about', '/how-it-works', '/pricing', '/docs', '/og'],
        disallow: ['/admin', '/api', '/dashboard', '/auth', '/onboarding', '/vote', '/voter', '/contestant', '/pitch'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/competitions', '/about', '/how-it-works', '/pricing', '/docs', '/faq'],
        disallow: ['/admin', '/api', '/dashboard', '/auth', '/onboarding', '/vote', '/voter', '/contestant'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/competitions', '/about', '/how-it-works', '/pricing', '/docs'],
        disallow: ['/admin', '/api', '/dashboard', '/auth', '/onboarding', '/vote', '/voter', '/contestant'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/competitions', '/about', '/how-it-works', '/pricing', '/docs'],
        disallow: ['/admin', '/api', '/dashboard', '/auth', '/onboarding', '/vote', '/voter', '/contestant'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/competitions', '/about', '/how-it-works', '/pricing', '/docs'],
        disallow: ['/admin', '/api', '/dashboard', '/auth', '/onboarding', '/vote', '/voter', '/contestant'],
      },
    ],
    sitemap: 'https://zedideaarena.com/sitemap.xml',
  }
}

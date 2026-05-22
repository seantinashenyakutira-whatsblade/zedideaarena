import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/competitions'],
        disallow: ['/admin', '/api', '/voter', '/contestant'],
      },
    ],
    sitemap: 'https://zedideaarena.com/sitemap.xml',
  }
}

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZedIdeaArena — Win by Sharing Your Ideas',
    short_name: 'ZedIdeaArena',
    description:
      'A fintech-style idea competition and crowdfunding platform. Pitch your ideas, compete with others, and win funding.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['social', 'finance', 'business'],
    screenshots: [],
  }
}

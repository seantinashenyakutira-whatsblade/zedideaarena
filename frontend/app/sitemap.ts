import type { MetadataRoute } from 'next'

const BASE_URL = 'https://zedideaarena.com'

async function getActiveCompetitions(): Promise<{ id: string; updated_at: string }[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const res = await fetch(`${apiUrl}/competitions`, { next: { revalidate: 3600 } })
    const body = await res.json()
    const competitions = body?.data?.data || body?.data || []
    return competitions.filter((c: any) => c.calculatedStatus !== 'closed' && !c.is_deleted)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const competitions = await getActiveCompetitions()

  const competitionEntries: MetadataRoute.Sitemap = competitions.map((comp) => ({
    url: `${BASE_URL}/competitions/${comp.id}`,
    lastModified: new Date(comp.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/competitions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/docs/rules`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/docs/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/docs/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/docs/video-guidelines`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...competitionEntries,
  ]

  return entries
}

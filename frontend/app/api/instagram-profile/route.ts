import { NextResponse } from 'next/server'

const IG_CACHE = new Map<string, { url: string; expires: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

async function fetchInstagramProfilePic(username: string): Promise<string | null> {
  const cached = IG_CACHE.get(username)
  if (cached && cached.expires > Date.now()) {
    return cached.url
  }

  const urls = [
    `https://www.instagram.com/${username}/?__a=1&__d=1`,
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json, text/html',
        },
        next: { revalidate: 3600 },
      })

      if (!res.ok) continue

      const text = await res.text()
      let data: any

      try {
        data = JSON.parse(text)
      } catch {
        const match = text.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/)
        if (match) {
          try { data = JSON.parse(match[1]) } catch {}
        }
      }

      if (!data) continue

      const picUrl =
        data?.graphql?.user?.profile_pic_url_hd ||
        data?.data?.user?.profile_pic_url_hd ||
        data?.entry_data?.ProfilePage?.[0]?.graphql?.user?.profile_pic_url_hd

      if (picUrl) {
        IG_CACHE.set(username, { url: picUrl, expires: Date.now() + CACHE_TTL })
        return picUrl
      }
    } catch {
      continue
    }
  }

  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'username required' }, { status: 400 })
  }

  const picUrl = await fetchInstagramProfilePic(username)

  if (picUrl) {
    const res = await fetch(picUrl, { next: { revalidate: 3600 } })
    if (res.ok) {
      return new Response(res.body, {
        headers: {
          'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
  }

  // Fallback: redirect to placeholder
  return NextResponse.redirect(new URL('/placeholder-user.jpg', request.url))
}

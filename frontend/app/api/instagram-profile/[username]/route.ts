import { NextResponse } from 'next/server'

const IG_CACHE = new Map<string, { url: string; expires: number }>()
const CACHE_TTL = 1000 * 60 * 60

async function fetchInstagramProfilePic(username: string): Promise<string | null> {
  const cached = IG_CACHE.get(username)
  if (cached && cached.expires > Date.now()) {
    return cached.url
  }

  const urls = [
    `https://www.instagram.com/${username}/?__a=1&__d=1`,
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    `https://ig.ximhai.com/${username}`,
    `https://img.instagram.com/${username}.jpg`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json, text/html, image/*',
        },
      })

      if (!res.ok) continue

      const contentType = res.headers.get('Content-Type') || ''

      if (contentType.startsWith('image/')) {
        IG_CACHE.set(username, { url, expires: Date.now() + CACHE_TTL })
        return url
      }

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

      if (!data) {
        const imgMatch = text.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
        if (imgMatch && imgMatch[1].includes('instagram')) {
          IG_CACHE.set(username, { url: imgMatch[1], expires: Date.now() + CACHE_TTL })
          return imgMatch[1]
        }
        continue
      }

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const picUrl = await fetchInstagramProfilePic(username)

  if (picUrl) {
    return NextResponse.redirect(picUrl, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }

  return NextResponse.redirect(new URL('/placeholder-user.jpg', _request.url))
}

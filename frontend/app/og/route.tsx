import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0f0f2a 100%)',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <img
            src="https://zedideaarena.com/logo-icon.png"
            width="72"
            height="72"
            style={{ borderRadius: '16px' }}
            alt=""
          />
          <span
            style={{
              fontSize: '56px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            ZedIdeaArena
          </span>
        </div>
        <p
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Win by Sharing Your Ideas
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '12px',
          }}
        >
          <span
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              background: 'rgba(99,102,241,0.15)',
              color: '#6366F1',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Pitch Ideas
          </span>
          <span
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              background: 'rgba(34,211,238,0.15)',
              color: '#22D3EE',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Compete
          </span>
          <span
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              background: 'rgba(250,204,21,0.15)',
              color: '#facc15',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Win Funding
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
  )
}

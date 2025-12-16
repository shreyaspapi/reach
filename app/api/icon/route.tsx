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
          backgroundColor: '#F9F8F4',
          position: 'relative',
        }}
      >
        {/* Corner brackets */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            width: 80,
            height: 80,
            borderLeft: '6px solid #2B4C7E',
            borderTop: '6px solid #2B4C7E',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 60,
            width: 80,
            height: 80,
            borderRight: '6px solid #2B4C7E',
            borderTop: '6px solid #2B4C7E',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 60,
            width: 80,
            height: 80,
            borderLeft: '6px solid #2B4C7E',
            borderBottom: '6px solid #2B4C7E',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 60,
            width: 80,
            height: 80,
            borderRight: '6px solid #2B4C7E',
            borderBottom: '6px solid #2B4C7E',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 280,
              fontWeight: 900,
              color: '#2B4C7E',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Luno
          </div>
          <div
            style={{
              fontSize: 42,
              color: 'rgba(43, 76, 126, 0.7)',
              letterSpacing: '0.3em',
              marginTop: 40,
              fontFamily: 'monospace',
            }}
          >
            THE SOCIAL ECONOMY
          </div>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  )
}

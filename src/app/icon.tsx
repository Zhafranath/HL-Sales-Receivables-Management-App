import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #18181b, #3f3f46)',
          borderRadius: '7px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.3px',
            }}
          >
            HL
          </span>
          <div
            style={{
              width: '10px',
              height: '1.8px',
              borderRadius: '0.9px',
              background: '#fbbf24',
              marginTop: '2px',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}

const MEMBERS = ['오곤', '명란', '봄', '솔', '향', '현우', '윤구']

export default function WelcomeScreen({ onSelect }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100dvh',
      background: 'linear-gradient(160deg, #3d2b1f 0%, #5c3d2e 60%, #2d4a3e 100%)',
      padding: '24px',
    }}>
      {/* 로고 */}
      <img
        src="/logo.png"
        alt="logo"
        style={{ width: '220px', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      />

      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginBottom: '20px', letterSpacing: '1px' }}>
        누구로 입장할까요?
      </div>

      {/* 멤버 버튼 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        width: '100%',
        maxWidth: '320px',
      }}>
        {MEMBERS.map(name => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            style={{
              padding: '16px 8px',
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: '14px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            {name}
          </button>
        ))}
      </div>

      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '32px' }}>
        CANADA FAMILY TRIP 2026
      </div>
    </div>
  )
}

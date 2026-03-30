import { TAG } from '../data/scheduleData'

export default function ScheduleCard({ item, isLast }) {
  const tag = TAG[item.tag]

  return (
    <div style={{ display: 'flex', gap: '12px', paddingBottom: isLast ? 0 : '8px' }}>
      {/* Time */}
      <div style={{
        width: '48px',
        flexShrink: 0,
        paddingTop: '10px',
        textAlign: 'right',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>
          {item.time}
        </span>
      </div>

      {/* Timeline dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: tag.color,
          border: '2px solid white',
          boxShadow: `0 0 0 2px ${tag.color}40`,
          flexShrink: 0,
          marginTop: '10px',
          zIndex: 1,
        }} />
        {!isLast && (
          <div style={{
            width: '2px',
            flex: 1,
            background: '#e0e0e0',
            marginTop: '4px',
            minHeight: '24px',
          }} />
        )}
      </div>

      {/* Card content */}
      <div style={{
        flex: 1,
        background: tag.bg,
        border: `1px solid ${tag.color}30`,
        borderRadius: '12px',
        padding: '10px 14px',
        marginBottom: isLast ? 0 : '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.4, flex: 1 }}>
            {item.activity}
          </span>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {item.km && (
              <span style={{
                fontSize: '11px',
                background: '#FF8C0020',
                color: '#E65100',
                padding: '2px 7px',
                borderRadius: '6px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                🚗 {item.km}km
              </span>
            )}
          </div>
        </div>

        {item.desc && (
          <p style={{ fontSize: '12px', color: '#666', marginTop: '3px', lineHeight: 1.5 }}>
            {item.desc}
          </p>
        )}

        <div style={{ marginTop: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            background: tag.color,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 600,
          }}>
            {tag.icon} {tag.label}
          </span>
        </div>
      </div>
    </div>
  )
}

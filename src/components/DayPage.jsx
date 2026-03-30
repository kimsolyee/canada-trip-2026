import { ACCOM_TYPE } from '../data/scheduleData'
import ScheduleCard from './ScheduleCard'

function AccommodationBadge({ accommodation }) {
  if (!accommodation) return null
  const style = ACCOM_TYPE[accommodation.type]
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: style.bgColor,
      border: `1px solid ${style.color}50`,
      color: style.color,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
    }}>
      {style.badge} {accommodation.name}
    </div>
  )
}

function TagLegend() {
  const tags = [
    { color: '#FF8C00', label: '이동' },
    { color: '#2E7D32', label: '식사' },
    { color: '#6A1B9A', label: '관광' },
    { color: '#1565C0', label: '숙박' },
    { color: '#C62828', label: '온천' },
  ]
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
      {tags.map(t => (
        <span key={t.label} style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          fontSize: '11px', color: t.color, fontWeight: 600,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
          {t.label}
        </span>
      ))}
    </div>
  )
}

export default function DayPage({ day }) {
  return (
    <div style={{ padding: '16px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Day Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #D80027 0%, #8B0000 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: 'white',
        marginBottom: '20px',
        boxShadow: '0 4px 20px #D8002740',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.25)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              Day {day.day}
            </span>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>
              2026년 {day.date} ({day.weekday})
            </span>
          </div>
          <AccommodationBadge accommodation={day.accommodation} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{day.title}</h2>
        <p style={{ fontSize: '13px', opacity: 0.85 }}>{day.subtitle}</p>
      </div>

      <TagLegend />

      {/* Schedule Items */}
      <div>
        {day.items.map((item, i) => (
          <ScheduleCard
            key={i}
            item={item}
            isLast={i === day.items.length - 1}
          />
        ))}
      </div>

      {/* Accommodation info */}
      {day.accommodation && (
        <div style={{
          marginTop: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '14px 16px',
          borderLeft: '4px solid #1565C0',
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '3px' }}>오늘의 숙박지</div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{day.accommodation.name}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{day.accommodation.address}</div>
        </div>
      )}
    </div>
  )
}

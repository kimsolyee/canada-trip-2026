import { useState } from 'react'
import { schedule } from './data/scheduleData'
import DayPage from './components/DayPage'
import MapView from './components/MapView'
import PhotosTab from './components/PhotosTab'

const NAV_SCHEDULE = 'schedule'
const NAV_MAP = 'map'
const NAV_PHOTOS = 'photos'

function AppHeader() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #3d2b1f 0%, #5c3d2e 100%)',
      padding: '10px 20px',
      color: 'white',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="logo" style={{ height: '52px', borderRadius: '8px', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            CANADA FAMILY TRIP
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
            7월 13일 ~ 22일 · 10박 11일 · 7인 가족 · BC주 → 앨버타
          </div>
        </div>
      </div>
    </div>
  )
}

function DayTabs({ activeDay, onSelect }) {
  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #e8e8e8',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
    }}>
      <div style={{
        display: 'flex',
        padding: '6px 8px',
        gap: '4px',
        maxWidth: '720px',
        margin: '0 auto',
      }}>
        {schedule.map(day => {
          const isActive = activeDay === day.day
          return (
            <button
              key={day.day}
              onClick={() => onSelect(day.day)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: isActive ? '6px 12px' : '6px 8px',
                border: 'none',
                borderRadius: '20px',
                background: isActive ? '#4A8FA8' : 'transparent',
                cursor: 'pointer',
                color: isActive ? 'white' : '#888',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {isActive && (
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.85 }}>Day {day.day}</span>
              )}
              <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500 }}>
                {day.date}({day.weekday})
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BottomNav({ active, onSelect }) {
  const items = [
    { id: NAV_SCHEDULE, label: '일정', icon: '📅' },
    { id: NAV_MAP, label: '지도', icon: '🗺️' },
    { id: NAV_PHOTOS, label: '사진', icon: '📸' },
  ]
  return (
    <div style={{
      display: 'flex',
      background: 'white',
      borderTop: '1px solid #e8e8e8',
      flexShrink: 0,
    }}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: active === item.id ? '#4A8FA8' : '#888',
            fontWeight: active === item.id ? 700 : 400,
            fontSize: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [nav, setNav] = useState(NAV_SCHEDULE)
  const [activeDay, setActiveDay] = useState(1)

  const currentDay = schedule.find(d => d.day === activeDay)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      overflow: 'hidden',
    }}>
      <AppHeader />

      {nav === NAV_SCHEDULE && (
        <DayTabs activeDay={activeDay} onSelect={setActiveDay} />
      )}

      <div style={{ flex: 1, overflow: nav === NAV_SCHEDULE ? 'auto' : 'hidden' }}>
        {nav === NAV_SCHEDULE ? (
          <DayPage day={currentDay} />
        ) : nav === NAV_MAP ? (
          <div style={{ height: '100%' }}>
            <MapView onNavigate={(day) => { setActiveDay(day); setNav(NAV_SCHEDULE) }} />
          </div>
        ) : (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <PhotosTab />
          </div>
        )}
      </div>

      <BottomNav active={nav} onSelect={setNav} />
    </div>
  )
}

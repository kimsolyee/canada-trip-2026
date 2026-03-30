import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import { waypoints, schedule } from '../data/scheduleData'

const routePositions = waypoints.map(w => [w.lat, w.lng])
const center = [51.5, -116.5]

export default function MapView({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #eee' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>🗺️ 전체 이동 경로</h2>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
          경유지를 누르면 해당 날짜 일정으로 이동합니다
        </p>
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route polyline */}
          <Polyline
            positions={routePositions}
            color="#4A8FA8"
            weight={3}
            opacity={0.7}
            dashArray="8, 6"
          />

          {/* All waypoints */}
          {waypoints.map((w, i) => {
            const dayInfo = schedule.find(d => d.day === w.day)
            return (
              <CircleMarker
                key={i}
                center={[w.lat, w.lng]}
                radius={w.main ? 10 : 7}
                fillColor={w.main ? '#4A8FA8' : '#E8925A'}
                color="white"
                weight={2.5}
                fillOpacity={0.9}
                eventHandlers={{
                  click: () => onNavigate(w.day),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                    <span style={{
                      background: '#4A8FA8',
                      color: 'white',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginRight: '5px',
                    }}>
                      Day {w.day}
                    </span>
                    {dayInfo?.date} ({dayInfo?.weekday})<br />
                    <strong>{w.name}</strong>
                  </div>
                </Tooltip>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

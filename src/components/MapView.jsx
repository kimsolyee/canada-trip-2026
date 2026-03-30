import { useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { waypoints } from '../data/scheduleData'

// Fix default Leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const mainIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;
    background:#D80027;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
  ">
    <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const routePositions = waypoints.map(w => [w.lat, w.lng])
const center = [51.5, -116.5]

export default function MapView() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #eee' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>🗺️ 전체 이동 경로</h2>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
          BC주 (밴쿠버 → 켈로나) → 앨버타 (재스퍼 → 밴프) → 캘거리
        </p>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
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
            color="#D80027"
            weight={3}
            opacity={0.7}
            dashArray="8, 6"
          />

          {/* Minor waypoints */}
          {waypoints.filter(w => !w.main).map((w, i) => (
            <CircleMarker
              key={`minor-${i}`}
              center={[w.lat, w.lng]}
              radius={6}
              fillColor="#FF8C00"
              color="white"
              weight={2}
              fillOpacity={0.9}
              eventHandlers={{ click: () => setSelected(w) }}
            >
              <Popup>{w.name}</Popup>
            </CircleMarker>
          ))}

          {/* Main waypoints */}
          {waypoints.filter(w => w.main).map((w, i) => (
            <Marker
              key={`main-${i}`}
              position={[w.lat, w.lng]}
              icon={mainIcon}
              eventHandlers={{ click: () => setSelected(w) }}
            >
              <Popup>
                <strong>{w.name}</strong>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'white',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '11px',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '12px' }}>주요 경유지</div>
          {waypoints.filter(w => w.main).map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D80027', flexShrink: 0 }} />
              <span style={{ color: '#333' }}>{w.name}</span>
            </div>
          ))}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF8C00', flexShrink: 0 }} />
              <span style={{ color: '#555' }}>경유 포인트</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 20, height: 2, background: '#D80027', flexShrink: 0 }} />
              <span style={{ color: '#555' }}>이동 경로</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

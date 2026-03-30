import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { schedule } from '../data/scheduleData'

const MEMBERS = ['명란', '오곤', '봄', '솔', '향', '현우']
const LIMIT_BYTES = 4.99 * 1024 * 1024 * 1024 // 4.99 GB

function formatSize(bytes) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + ' GB'
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(0) + ' KB'
}

function UploadButton({ dayNum, member, totalUsed }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const blocked = totalUsed >= LIMIT_BYTES

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (totalUsed + file.size > LIMIT_BYTES) {
      alert(`저장 공간이 부족해요!\n현재 사용: ${formatSize(totalUsed)}\n이 파일: ${formatSize(file.size)}\n한도: 4.99 GB`)
      e.target.value = ''
      return
    }

    setUploading(true)
    setProgress(0)

    const storageRef = ref(storage, `photos/day${dayNum}/${Date.now()}_${file.name}`)
    const task = uploadBytesResumable(storageRef, file)

    task.on('state_changed',
      (snap) => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      (err) => { console.error(err); setUploading(false) },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        await addDoc(collection(db, 'photos'), {
          url,
          storagePath: storageRef.fullPath,
          day: dayNum,
          member,
          fileSize: file.size,
          createdAt: serverTimestamp(),
          fileName: file.name,
        })
        setUploading(false)
        setProgress(0)
        e.target.value = ''
      }
    )
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <button
        onClick={() => !blocked && !uploading && inputRef.current.click()}
        disabled={uploading || blocked}
        style={{
          padding: '8px 14px',
          background: blocked ? '#e57373' : uploading ? '#e0e0e0' : '#4A8FA8',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: (uploading || blocked) ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        {blocked ? '🚫 용량 초과' : uploading ? `업로드 중 ${progress}%` : '📷 사진 추가'}
      </button>
    </div>
  )
}

async function deletePhoto(photo) {
  await deleteDoc(doc(db, 'photos', photo.id))
  try {
    const storageRef = ref(storage, photo.storagePath)
    await deleteObject(storageRef)
  } catch {
    // storagePath 없는 구버전 사진은 무시
  }
}

function PhotoGrid({ photos }) {
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (e, photo) => {
    e.stopPropagation()
    if (!window.confirm(`"${photo.fileName}" 사진을 삭제할까요?`)) return
    setDeleting(photo.id)
    await deletePhoto(photo)
    if (selected?.id === photo.id) setSelected(null)
    setDeleting(null)
  }

  if (photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bbb', fontSize: '14px' }}>
        아직 사진이 없어요. 첫 번째 사진을 올려보세요! 📸
      </div>
    )
  }

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '3px',
      }}>
        {photos.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', background: '#f0f0f0', position: 'relative' }}
          >
            <img
              src={p.url}
              alt={p.fileName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: deleting === p.id ? 0.4 : 1 }}
            />
            <button
              onClick={(e) => handleDelete(e, p)}
              disabled={deleting === p.id}
              style={{
                position: 'absolute', top: 4, right: 4,
                width: 24, height: 24,
                background: 'rgba(0,0,0,0.55)',
                border: 'none', borderRadius: '50%',
                color: 'white', fontSize: 13, lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px',
          }}
        >
          <img
            src={selected.url}
            alt={selected.fileName}
            onClick={() => setSelected(null)}
            style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '8px', objectFit: 'contain', cursor: 'pointer' }}
          />
          <div style={{ color: 'white', marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>
            {selected.member} · {selected.fileName}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => setSelected(null)}
              style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '20px', color: 'white', fontSize: '13px', cursor: 'pointer' }}
            >
              닫기
            </button>
            <button
              onClick={(e) => handleDelete(e, selected)}
              style={{ padding: '8px 20px', background: '#e53935', border: 'none', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              🗑️ 삭제
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function PhotosTab() {
  const [activeDay, setActiveDay] = useState(1)
  const [member, setMember] = useState(MEMBERS[0])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const q = query(
      collection(db, 'photos'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const dayPhotos = photos.filter(p => p.day === activeDay)
  const currentDayInfo = schedule.find(d => d.day === activeDay)
  const totalUsed = photos.reduce((sum, p) => sum + (p.fileSize || 0), 0)
  const usedPct = Math.min((totalUsed / LIMIT_BYTES) * 100, 100)
  const isNearLimit = usedPct >= 90

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ padding: '14px 16px 10px', background: 'white', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>📸 가족 사진첩</h2>
          {/* 업로더 선택 */}
          <select
            value={member}
            onChange={e => setMember(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '16px',
              border: '1.5px solid #4A8FA8',
              fontSize: '13px',
              color: '#4A8FA8',
              fontWeight: 600,
              background: 'white',
              cursor: 'pointer',
            }}
          >
            {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* 저장 용량 바 */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: isNearLimit ? '#e53935' : '#888', marginBottom: '4px' }}>
            <span>{isNearLimit ? '⚠️ 용량 부족' : '저장 용량'}</span>
            <span>{formatSize(totalUsed)} / 4.99 GB</span>
          </div>
          <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${usedPct}%`,
              background: usedPct >= 100 ? '#e53935' : isNearLimit ? '#FF8C00' : '#4A8FA8',
              borderRadius: 3,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Day 탭 */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
          {schedule.map(d => {
            const isActive = activeDay === d.day
            const cnt = photos.filter(p => p.day === d.day).length
            return (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                style={{
                  flexShrink: 0,
                  padding: '5px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: isActive ? '#4A8FA8' : '#f0f0f0',
                  color: isActive ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                Day {d.day}
                {cnt > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#E8925A', color: 'white',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{cnt}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day 정보 + 업로드 버튼 */}
      <div style={{
        padding: '10px 16px',
        background: '#f8f9fa',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>
            Day {activeDay} · {currentDayInfo?.date} ({currentDayInfo?.weekday})
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>{currentDayInfo?.title}</div>
        </div>
        <UploadButton dayNum={activeDay} member={member} totalUsed={totalUsed} />
      </div>

      {/* 사진 그리드 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>불러오는 중...</div>
        ) : (
          <PhotoGrid photos={dayPhotos} />
        )}
      </div>
    </div>
  )
}

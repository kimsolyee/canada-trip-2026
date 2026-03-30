import { useState, useEffect } from 'react'
import { collection, doc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { schedule } from '../data/scheduleData'

function DiaryEditor({ day, member, existing, onSave }) {
  const [text, setText] = useState(existing?.content || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setText(existing?.content || '')
  }, [existing, day])

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    const id = `day${day}_${member}`
    await setDoc(doc(db, 'diaries', id), {
      day,
      member,
      content: text.trim(),
      updatedAt: new Date().toISOString(),
    })
    setSaving(false)
    onSave?.()
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="오늘 하루 어땠나요? 기억에 남는 순간을 기록해보세요 ✍️"
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '12px',
          border: '1.5px solid #e0e0e0',
          borderRadius: '12px',
          fontSize: '14px',
          lineHeight: 1.7,
          resize: 'vertical',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#4A8FA8'}
        onBlur={e => e.target.style.borderColor = '#e0e0e0'}
      />
      <button
        onClick={handleSave}
        disabled={saving || !text.trim()}
        style={{
          marginTop: '8px',
          padding: '9px 20px',
          background: saving || !text.trim() ? '#e0e0e0' : '#4A8FA8',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: saving || !text.trim() ? 'default' : 'pointer',
        }}
      >
        {saving ? '저장 중...' : existing ? '✏️ 수정' : '💾 저장'}
      </button>
    </div>
  )
}

function DiaryCard({ entry }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.content.length > 100

  return (
    <div style={{
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '14px 16px',
      marginBottom: '10px',
      borderLeft: '3px solid #4A8FA8',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#4A8FA8' }}>{entry.member}</span>
        <span style={{ fontSize: '11px', color: '#aaa' }}>
          {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
      </div>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#333', margin: 0, whiteSpace: 'pre-wrap' }}>
        {isLong && !expanded ? entry.content.slice(0, 100) + '...' : entry.content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#4A8FA8', fontSize: '12px', cursor: 'pointer', padding: '4px 0 0', fontWeight: 600 }}
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      )}
    </div>
  )
}

export default function DiaryTab({ member }) {
  const [activeDay, setActiveDay] = useState(1)
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'diaries'), orderBy('updatedAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setDiaries(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const dayDiaries = diaries.filter(d => d.day === activeDay)
  const myEntry = dayDiaries.find(d => d.member === member)
  const othersEntries = dayDiaries.filter(d => d.member !== member)
  const currentDayInfo = schedule.find(d => d.day === activeDay)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ padding: '14px 16px 10px', background: 'white', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>📝 여행 일기</h2>
          <span style={{
            padding: '5px 12px', borderRadius: '16px',
            background: '#EBF3FA', color: '#4A8FA8', fontSize: '13px', fontWeight: 700,
          }}>{member}</span>
        </div>

        {/* Day 탭 */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
          {schedule.map(d => {
            const isActive = activeDay === d.day
            const cnt = diaries.filter(di => di.day === d.day).length
            return (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                style={{
                  flexShrink: 0, padding: '5px 10px', borderRadius: '16px', border: 'none',
                  background: isActive ? '#4A8FA8' : '#f0f0f0',
                  color: isActive ? 'white' : '#666',
                  fontSize: '12px', fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer', position: 'relative',
                }}
              >
                Day {d.day}
                {cnt > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#9B7EC8', color: 'white',
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

      {/* 본문 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Day 정보 */}
        <div style={{
          background: 'linear-gradient(135deg, #6AAFCD 0%, #4A8FA8 100%)',
          borderRadius: '12px', padding: '14px 16px', color: 'white', marginBottom: '16px',
        }}>
          <div style={{ fontSize: '12px', opacity: 0.85 }}>Day {activeDay} · {currentDayInfo?.date} ({currentDayInfo?.weekday})</div>
          <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>{currentDayInfo?.title}</div>
        </div>

        {/* 내 일기 작성 */}
        <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: '#555' }}>
          ✏️ 내 일기
        </div>
        {loading ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>불러오는 중...</div>
        ) : (
          <DiaryEditor day={activeDay} member={member} existing={myEntry} />
        )}

        {/* 다른 멤버 일기 */}
        {othersEntries.length > 0 && (
          <>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#555', marginBottom: '10px' }}>
              👨‍👩‍👧‍👦 다른 가족 일기
            </div>
            {othersEntries.map(e => <DiaryCard key={e.id} entry={e} />)}
          </>
        )}

        {othersEntries.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#ccc', fontSize: '13px', paddingTop: '10px' }}>
            아직 다른 가족이 일기를 쓰지 않았어요
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

const MEMBERS = ['오곤', '명란', '봄', '솔', '향', '현우', '윤구']

const MEMBER_EMOJI = {
  '오곤': '👨',
  '명란': '👩',
  '봄': '🌸',
  '솔': '🌿',
  '향': '🌺',
  '현우': '🦁',
  '윤구': '⭐',
}

const BUBBLE_COLORS = {
  '오곤': '#D4EDFF',
  '명란': '#FFE4EC',
  '봄': '#FFF3D4',
  '솔': '#D4F5E4',
  '향': '#F5D4FF',
  '현우': '#FFE8D4',
  '윤구': '#D4F0FF',
}

function ChatSection({ member }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, 'chat'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    await addDoc(collection(db, 'chat'), {
      member,
      content,
      createdAt: new Date().toISOString(),
    })
    setSending(false)
    inputRef.current?.focus()
  }

  const formatTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* 채팅 헤더 */}
      <div style={{
        padding: '10px 16px',
        fontSize: '13px', fontWeight: 700, color: '#555',
        borderTop: '1px solid #e8e8e8',
        background: 'rgba(255,255,255,0.6)',
        flexShrink: 0,
      }}>
        💬 가족 채팅
      </div>

      {/* 메시지 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#ccc', fontSize: '13px', paddingTop: '20px' }}>
            첫 메시지를 남겨보세요 💬
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.member === member
          const bubbleColor = isMe ? '#DCF0FA' : (BUBBLE_COLORS[msg.member] || '#f0f0f0')
          const showName = i === 0 || messages[i - 1].member !== msg.member

          return (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: '6px',
            }}>
              {/* 아바타 (이름이 바뀔 때만) */}
              <div style={{ width: 32, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                {showName && (
                  <>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: isMe ? '#4A8FA8' : '#e0e0e0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      {MEMBER_EMOJI[msg.member] || '😊'}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: isMe ? '#4A8FA8' : '#888' }}>
                      {msg.member}
                    </div>
                  </>
                )}
              </div>

              {/* 말풍선 + 시간 */}
              <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '4px', maxWidth: '75%' }}>
                <div style={{
                  background: bubbleColor,
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  lineHeight: 1.55,
                  color: '#333',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '10px', color: '#bbb', whiteSpace: 'nowrap', paddingBottom: '2px' }}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{
        display: 'flex', gap: '8px',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.9)',
        borderTop: '1px solid #eee',
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
          placeholder="메시지 입력..."
          style={{
            flex: 1, padding: '9px 14px',
            border: '1.5px solid #ddd', borderRadius: '20px',
            fontSize: '13px', fontFamily: 'inherit', outline: 'none',
            background: 'white',
          }}
          onFocus={e => e.target.style.borderColor = '#4A8FA8'}
          onBlur={e => e.target.style.borderColor = '#ddd'}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: text.trim() ? '#4A8FA8' : '#e0e0e0',
            border: 'none', color: 'white',
            fontSize: '16px', cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >➤</button>
      </div>
    </div>
  )
}

export default function HomeTab({ member }) {
  const [greetings, setGreetings] = useState({})

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'greetings'), snap => {
      const g = {}
      snap.docs.forEach(d => { g[d.id] = d.data() })
      setGreetings(g)
    })
    return unsub
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, #6AAFCD 0%, #4A8FA8 100%)',
        padding: '20px 16px',
        color: 'white',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '4px' }}>
          CANADA FAMILY TRIP 2026
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800 }}>
          7월 13일 ~ 22일 🍁
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
          BC주 → 앨버타 · 10박 11일 · 7인 가족
        </div>
      </div>

      {/* 공지 */}
      <div style={{
        margin: '12px 16px 0',
        background: '#FFF8E1',
        border: '1.5px solid #FFD54F',
        borderRadius: '12px',
        padding: '12px 14px',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#E65100', marginBottom: '6px' }}>
          📢 공지
        </div>
        <div style={{ fontSize: '12px', color: '#5D4037', lineHeight: 1.7 }}>
          🛒 <strong>고기, 쌀 등 주요 식재료</strong>는 현지 <strong>코스트코</strong>에서 장 볼 예정이에요!<br />
          한국에서 미리 챙겨오지 않아도 됩니다 😊
        </div>
      </div>

      {/* 인사 리스트 */}
      <div style={{ flexShrink: 0, padding: '16px 16px 0' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#555', marginBottom: '14px' }}>
          👨‍👩‍👧‍👦 가족 소개 & 인사
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {MEMBERS.map((name, i) => {
            const g = greetings[name]
            const isMe = name === member
            const isRight = i % 2 === 1
            const bubbleColor = isMe ? '#DCF0FA' : (BUBBLE_COLORS[name] || '#f0f0f0')
            const tailLeft = !isRight

            return (
              <div key={name} style={{
                display: 'flex',
                flexDirection: isRight ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: isMe ? '#4A8FA8' : '#e0e0e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    boxShadow: isMe ? '0 2px 8px rgba(74,143,168,0.35)' : '0 1px 4px rgba(0,0,0,0.1)',
                  }}>
                    {MEMBER_EMOJI[name] || '😊'}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: isMe ? '#4A8FA8' : '#666' }}>
                    {name}
                  </div>
                </div>

                <div style={{ position: 'relative', maxWidth: '72%' }}>
                  <div style={{
                    position: 'absolute',
                    bottom: 10,
                    [tailLeft ? 'left' : 'right']: -7,
                    width: 0, height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    [tailLeft ? 'borderRight' : 'borderLeft']: `8px solid ${bubbleColor}`,
                  }} />
                  <div style={{
                    background: bubbleColor,
                    borderRadius: isRight ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    {isMe && (
                      <span style={{
                        display: 'inline-block',
                        fontSize: '10px', background: '#4A8FA8', color: 'white',
                        borderRadius: '6px', padding: '1px 6px', fontWeight: 700,
                        marginBottom: '5px',
                      }}>나</span>
                    )}
                    {g ? (
                      <p style={{ fontSize: '13px', color: '#333', lineHeight: 1.65, margin: 0 }}>
                        {g.content}
                      </p>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#aaa', margin: 0, fontStyle: 'italic' }}>
                        아직 인사를 남기지 않았어요 🤫
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 채팅 섹션 */}
      <ChatSection member={member} />
    </div>
  )
}

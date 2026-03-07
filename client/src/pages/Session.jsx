import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InsightPanel from '../components/InsightPanel'
import BreathingModal from '../components/BreathingModal'
import CrisisBanner from '../components/CrisisBanner'
import api from '../utils/api'

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self-harm', 'self harm',
  'hurt myself', 'want to die', 'wanna die', 'not worth living',
]

function detectCrisis(text) {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw))
}

export default function Session() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Session state
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // UI state
  const [showBreathing, setShowBreathing] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [insightOpen, setInsightOpen] = useState(true)
  const [sessions, setSessions] = useState([])

  // Current insight state
  const [currentDistortions, setCurrentDistortions] = useState([])
  const [currentConfidence, setCurrentConfidence] = useState({})
  const [currentReframe, setCurrentReframe] = useState('')

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load sessions history
  useEffect(() => {
    api.get('/sessions/history')
      .then((res) => setSessions(res.data))
      .catch(() => {})
  }, [])

  // Start new session
  const startSession = useCallback(async () => {
    try {
      const res = await api.post('/session/start')
      setSessionId(res.data.session_id)
      setMessages([])
      setCurrentDistortions([])
      setCurrentConfidence({})
      setCurrentReframe('')
    } catch (err) {
      console.error('Failed to start session:', err)
    }
  }, [])

  // Auto-start session if none active
  useEffect(() => {
    if (!sessionId) startSession()
  }, [sessionId, startSession])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || sending || !sessionId) return
    const userMsg = input.trim()
    setInput('')
    setSending(true)

    // Check for crisis keywords
    if (detectCrisis(userMsg)) {
      setShowCrisis(true)
    }

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMsg, timestamp: Date.now() }])

    try {
      const res = await api.post('/session/message', {
        session_id: sessionId,
        user_message: userMsg,
      })

      const data = res.data

      // Add AI message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
          mood_score: data.session_mood_score,
        },
      ])

      // Update insights
      if (data.detected_distortions?.length) {
        setCurrentDistortions(data.detected_distortions)
        setCurrentConfidence(data.confidence_scores || {})
        setCurrentReframe(data.reframe_suggestion || '')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please make sure the server is running.',
          timestamp: Date.now(),
          error: true,
        },
      ])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const endSession = async () => {
    if (!sessionId) return
    try {
      await api.post(`/session/${sessionId}/end`)
      navigate(`/session/${sessionId}/summary`)
    } catch (err) {
      console.error('Failed to end session:', err)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="relative h-screen flex overflow-hidden">
      {/* Background */}
      <div className="aether-bg">
        <div className="particle-field" />
      </div>

      {/* Crisis Banner */}
      <CrisisBanner isVisible={showCrisis} onDismiss={() => setShowCrisis(false)} />

      {/* Breathing Modal */}
      <BreathingModal isOpen={showBreathing} onClose={() => setShowBreathing(false)} />

      {/* ── Left Sidebar ──────────────────────────────────────── */}
      <aside
        className={`relative z-20 flex flex-col border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden opacity-0'
        }`}
        style={{ background: 'rgba(3,5,9,0.7)', backdropFilter: 'blur(30px) saturate(150%)' }}
      >
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-text tracking-wide">Sessions</h2>
            <button
              onClick={startSession}
              className="group p-2 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-all hover:border-primary/40 hover:shadow-[0_0_15px_rgba(167,139,250,0.15)]"
              aria-label="New Session"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          {user && (
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 flex items-center justify-center border border-white/10 shadow-inner">
                <span className="text-xs font-medium text-white/90">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-muted truncate">
                {user.name || user.email.split('@')[0]}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <span className="text-2xl mb-2">🍃</span>
              <p className="text-sm text-text font-light text-center">Your space is empty.<br/>Start a new session.</p>
            </div>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/session/${s.id}/summary`)}
                className={`group w-full text-left p-3.5 rounded-2xl transition-all duration-300 border ${
                  s.id === sessionId
                    ? 'bg-primary/10 border-primary/20 shadow-[0_4px_20px_rgba(167,139,250,0.1)]'
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text/90 truncate pr-2 group-hover:text-white transition-colors">{s.title || `Session ${s.id}`}</span>
                    {s.mood_score && (
                      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-xs font-mono text-muted/80">{s.mood_score}</span>
                    )}
                  </div>
                  <span className="text-xs font-light text-muted/60 tracking-wide">{new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/5 space-y-1.5">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </button>
        </div>
      </aside>

      {/* ── Center Chat Area ──────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 z-20" style={{ background: 'rgba(3,5,9,0.5)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="font-display text-3xl font-light tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-transparent bg-clip-text bg-gradient-to-r from-white to-primary/80">Aether</h1>
            <div className="flex items-center justify-center w-2 h-2 rounded-full bg-accent animate-[pulse-soft_3s_infinite] shadow-[0_0_15px_rgba(45,212,191,1)]" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setInsightOpen(!insightOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                insightOpen
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-[0_0_15px_rgba(129,140,248,0.15)]'
                  : 'bg-white/5 border border-white/10 text-muted hover:text-white hover:border-white/20'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Insights
            </button>
            <button
              onClick={endSession}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-muted hover:text-danger hover:border-danger/40 hover:bg-danger/10 transition-all group"
            >
              <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(251,113,133,0.5)] transition-all">End Session</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in pb-20">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(167,139,250,0.1)]">
                <span className="text-2xl">✧</span>
              </div>
              <p className="font-display text-3xl text-text mb-3 tracking-wide">Take a breath.</p>
              <p className="text-base text-muted/80 font-light max-w-sm">
                Share what's on your mind. This is a private space designed for reflection.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`animate-slide-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
            >
              <div
                className={`max-w-[75%] px-6 py-4 text-[15px] leading-[1.6] shadow-2xl relative overflow-hidden group/bubble ${
                  msg.role === 'user'
                    ? 'rounded-[28px] rounded-br-[8px]'
                    : 'rounded-[28px] rounded-bl-[8px]'
                } ${msg.error ? 'border-danger/30' : ''}`}
                style={{
                  background:
                    msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(196,181,253,0.15) 0%, rgba(45,212,191,0.05) 100%)'
                      : 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  border: `1px solid ${
                    msg.role === 'user'
                      ? 'rgba(196,181,253,0.4)'
                      : 'rgba(255,255,255,0.05)'
                  }`,
                  backdropFilter: 'blur(30px) saturate(140%)',
                  boxShadow: msg.role === 'user' 
                    ? '0 20px 40px -10px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2), 0 0 20px rgba(196,181,253,0.1)' 
                    : '0 20px 40px -10px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)',
                }}
              >
                <div className="text-text/90 whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start animate-fade-in pl-2">
              <div
                className="px-6 py-5 rounded-[24px] rounded-bl-sm flex items-center shadow-lg"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-[pulse-soft_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/60 animate-[pulse-soft_1s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-[pulse-soft_1s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Input Bar */}
        <div className="px-6 pb-8 pt-2 relative z-20 max-w-5xl mx-auto w-full">
          <div
            className="flex items-end gap-3 p-2.5 rounded-[32px] shadow-2xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(196,181,253,0.3)] focus-within:shadow-[0_20px_80px_-10px_rgba(196,181,253,0.4)] focus-within:border-primary/60 focus-within:-translate-y-1 group"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(40px) saturate(200%)',
            }}
          >
            <button
              onClick={() => setShowBreathing(true)}
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all hover:bg-white/10 hover:scale-105 ml-1 mb-0.5"
              title="Breathing guide"
              aria-label="Open breathing guide"
            >
              🫧
            </button>
            <textarea
              ref={inputRef}
              id="session-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              rows={1}
              className="flex-1 bg-transparent text-text placeholder-white/30 outline-none resize-none text-[15px] leading-relaxed py-3.5 mb-1 max-h-32 font-light"
              style={{ minHeight: '52px' }}
            />
            <button
              id="session-send"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 disabled:opacity-20 disabled:scale-95 mb-0.5 mr-1 hover:scale-105"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, rgba(196,181,253,0.9) 0%, rgba(45,212,191,0.8) 100%)' : 'rgba(255,255,255,0.03)',
                border: input.trim() ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
                boxShadow: input.trim() ? '0 0 30px rgba(196,181,253,0.6), inset 0 2px 4px rgba(255,255,255,0.5)' : 'none',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={input.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : "text-white/40"}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* ── Right Insight Panel ────────────────────────────────── */}
      <aside
        className={`relative z-10 border-l border-glass-border transition-all duration-300 ${
          insightOpen ? 'w-80' : 'w-0 overflow-hidden'
        }`}
        style={{ background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <InsightPanel
          distortions={currentDistortions}
          confidenceScores={currentConfidence}
          reframeSuggestion={currentReframe}
          isOpen={insightOpen}
        />
      </aside>
    </div>
  )
}

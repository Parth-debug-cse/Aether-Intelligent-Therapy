import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import api from '../utils/api'

const DISTORTION_EMOJIS = {
  'catastrophizing': '🌋',
  'all-or-nothing thinking': '⚖️',
  'overgeneralization': '🔄',
  'mind reading': '🔮',
  'personalization': '🎯',
  'should statements': '📏',
  'emotional reasoning': '💭',
  'labeling': '🏷️',
  'fortune telling': '🔮',
  'mental filter': '🕶️',
}

export default function SessionSummary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/session/${id}/summary`)
      .then((res) => setSummary(res.data))
      .catch(() => setError('Failed to load session summary.'))
      .finally(() => setLoading(false))
  }, [id])

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Aether — Session Summary', 20, 20)
    doc.setFontSize(12)

    let y = 35
    if (summary?.reflection) {
      doc.text('Reflection:', 20, y)
      y += 8
      const lines = doc.splitTextToSize(summary.reflection, 170)
      doc.text(lines, 20, y)
      y += lines.length * 7 + 10
    }

    if (summary?.distortions?.length) {
      doc.text('Detected Patterns:', 20, y)
      y += 8
      summary.distortions.forEach((d) => {
        doc.text(`• ${d.name} (${d.count}x)`, 25, y)
        y += 7
      })
      y += 5
    }

    if (summary?.exercise) {
      doc.text('Weekly Exercise:', 20, y)
      y += 8
      const lines = doc.splitTextToSize(summary.exercise, 170)
      doc.text(lines, 20, y)
    }

    doc.save(`aether-session-${id}.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="aether-bg"><div className="particle-field" /></div>
        <div className="relative z-10 text-muted animate-pulse-soft font-display text-xl">Loading summary...</div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="aether-bg"><div className="particle-field" /></div>
        <div className="relative z-10 text-center">
          <p className="text-muted mb-4">{error || 'No summary available.'}</p>
          <Link to="/session" className="text-primary hover:text-accent transition-colors text-sm">
            ← Start new session
          </Link>
        </div>
      </div>
    )
  }

  const moodData = summary.mood_arc || []

  return (
    <div className="relative min-h-screen">
      <div className="aether-bg"><div className="particle-field" /></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-slide-up">
          <div>
            <Link to="/session" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors mb-4 group">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to sessions
            </Link>
            <h1 className="font-display text-5xl md:text-6xl tracking-widest uppercase mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-primary/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Session Summary
            </h1>
            <p className="font-body text-primary/80 text-lg tracking-widest uppercase flex items-center gap-3 font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {summary.date ? new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
          <button
            onClick={exportPDF}
            className="group flex items-center gap-3 px-8 py-4 rounded-[20px] text-sm font-medium tracking-[0.2em] uppercase transition-all duration-500 hover:-translate-y-1 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(196,181,253,0.4)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span className="relative z-10 text-white flex items-center gap-3 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export PDF
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(196,181,253,0.2) 0%, rgba(45,212,191,0.1) 100%)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)'
              }}
            />
          </button>
        </div>

        {/* AI Reflection */}
        {summary.reflection && (
          <div
            className="glass-strong p-8 mb-8 animate-slide-up"
            style={{ borderRadius: '24px', animationDelay: '100ms' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(167,139,250,0.1)]">
                <span className="text-xl">✦</span>
              </div>
              <h3 className="font-display text-2xl text-text tracking-wide">Reflection</h3>
            </div>
            <p className="text-text/80 leading-relaxed font-light text-base md:text-lg">{summary.reflection}</p>
          </div>
        )}

        {/* Mood Arc */}
        {moodData.length > 0 && (
          <div
            className="glass-static p-8 mb-8 animate-slide-up"
            style={{ borderRadius: '24px', animationDelay: '200ms' }}
          >
            <h3 className="font-display text-2xl text-text mb-6 tracking-wide">Mood Journey</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.6} />
                      <stop offset="50%" stopColor="#c4b5fd" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="50%" stopColor="#c4b5fd" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <XAxis
                    dataKey="index"
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 300 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={[1, 10]}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 300 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(3,5,9,0.85)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(20px)',
                      color: '#fff',
                      padding: '12px 16px',
                      fontWeight: 500,
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="url(#lineColor)"
                    strokeWidth={4}
                    fill="url(#moodGradient)"
                    filter="url(#glow)"
                    dot={{ fill: '#010206', stroke: '#c4b5fd', strokeWidth: 3, r: 5 }}
                    activeDot={{ fill: '#fff', stroke: '#2dd4bf', strokeWidth: 4, r: 8, className: "shadow-[0_0_20px_rgba(45,212,191,1)]" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Grid: Distortions + Exercise */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Distortions */}
          {summary.distortions?.length > 0 && (
            <div
              className="glass-static p-8 animate-slide-up h-full"
              style={{ borderRadius: '24px', animationDelay: '300ms' }}
            >
              <h3 className="font-display text-2xl text-text mb-6 tracking-wide">Patterns Detected</h3>
              <div className="space-y-5">
                {summary.distortions.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-transform group-hover:scale-110">
                        {DISTORTION_EMOJIS[d.name.toLowerCase()] || '🧩'}
                      </div>
                      <span className="text-[15px] text-text font-light capitalize tracking-wide">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(d.count * 25, 100)}%`,
                            background: 'linear-gradient(90deg, #c4b5fd 0%, #2dd4bf 100%)',
                            boxShadow: '0 0 15px rgba(45,212,191,0.6)'
                          }}
                        />
                      </div>
                      <span className="text-base font-display font-medium text-accent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] w-8 text-right">{d.count}×</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Exercise */}
          {summary.exercise && (
            <div
              className="animate-slide-up p-8 h-full relative overflow-hidden group"
              style={{
                borderRadius: '24px',
                animationDelay: '400ms',
                background: 'linear-gradient(135deg, rgba(8,11,20,0.6) 0%, rgba(8,11,20,0.8) 100%)',
                border: '1px solid rgba(103,232,249,0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full group-hover:bg-accent/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-[0_0_15px_rgba(103,232,249,0.1)]">
                    <span className="text-xl">🎯</span>
                  </div>
                  <h3 className="font-display text-2xl text-text tracking-wide">Weekly Focus</h3>
                </div>
                <p className="text-[15px] text-text/80 leading-relaxed font-light">{summary.exercise}</p>
              </div>
            </div>
          )}
        </div>

        {/* Start new session CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/session')}
            className="px-8 py-3 rounded-full font-body text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(103,232,249,0.15) 100%)',
              border: '1px solid rgba(167,139,250,0.3)',
            }}
          >
            <span className="text-gradient">Start another session</span>
          </button>
        </div>
      </div>
    </div>
  )
}

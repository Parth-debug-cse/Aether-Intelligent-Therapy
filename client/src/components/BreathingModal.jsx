import React, { useState, useEffect, useRef, useCallback } from 'react'

const PHASES = [
  { label: 'Inhale', duration: 4000 },
  { label: 'Hold', duration: 4000 },
  { label: 'Exhale', duration: 4000 },
  { label: 'Hold', duration: 4000 },
]

const TOTAL_CYCLE = PHASES.reduce((sum, p) => sum + p.duration, 0)

export default function BreathingModal({ isOpen, onClose }) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [selectedSound, setSelectedSound] = useState('rain')
  const animRef = useRef(null)
  const startRef = useRef(null)
  const audioCtxRef = useRef(null)
  const noiseNodeRef = useRef(null)

  const startBreathing = useCallback(() => {
    setIsActive(true)
    startRef.current = performance.now()
  }, [])

  const stopBreathing = useCallback(() => {
    setIsActive(false)
    setPhase(0)
    setProgress(0)
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [])

  useEffect(() => {
    if (!isActive) return

    const animate = (now) => {
      const elapsed = (now - startRef.current) % TOTAL_CYCLE
      let accumulated = 0
      for (let i = 0; i < PHASES.length; i++) {
        if (elapsed < accumulated + PHASES[i].duration) {
          setPhase(i)
          setProgress((elapsed - accumulated) / PHASES[i].duration)
          break
        }
        accumulated += PHASES[i].duration
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isActive])

  // Simple ambient sound with Web Audio API
  const toggleSound = useCallback(() => {
    if (soundEnabled) {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop()
        noiseNodeRef.current = null
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      setSoundEnabled(false)
    } else {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        audioCtxRef.current = ctx
        const bufferSize = 2 * ctx.sampleRate
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)

        // Generate colored noise
        if (selectedSound === 'rain') {
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1
            b0 = 0.99886 * b0 + white * 0.0555179
            b1 = 0.99332 * b1 + white * 0.0750759
            b2 = 0.96900 * b2 + white * 0.1538520
            b3 = 0.86650 * b3 + white * 0.3104856
            b4 = 0.55000 * b4 + white * 0.5329522
            b5 = -0.7616 * b5 - white * 0.0168980
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04
            b6 = white * 0.115926
          }
        } else if (selectedSound === 'whitenoise') {
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.05
          }
        } else {
          // Bowl: simple sine wave tone
          const freq = 174
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.sin(2 * Math.PI * freq * i / ctx.sampleRate) * 0.03 *
              (1 + 0.3 * Math.sin(2 * Math.PI * 0.5 * i / ctx.sampleRate))
          }
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.loop = true

        const gain = ctx.createGain()
        gain.gain.value = 0.5
        source.connect(gain)
        gain.connect(ctx.destination)

        source.start()
        noiseNodeRef.current = source
        setSoundEnabled(true)
      } catch (e) {
        console.warn('Audio not supported', e)
      }
    }
  }, [soundEnabled, selectedSound])

  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) noiseNodeRef.current.stop()
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  // Calculate circle scale
  const getScale = () => {
    if (!isActive) return 0.6
    if (phase === 0) return 0.6 + 0.4 * progress       // inhale: grow
    if (phase === 1) return 1.0                           // hold: stay big
    if (phase === 2) return 1.0 - 0.4 * progress         // exhale: shrink
    return 0.6                                             // hold: stay small
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative glass-strong p-10 max-w-md w-full mx-4 animate-fade-in"
        style={{ borderRadius: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors text-xl"
          aria-label="Close breathing guide"
        >
          ✕
        </button>

        <h2 className="font-display text-3xl text-center mb-2 text-text">Breathe</h2>
        <p className="text-muted text-center text-sm mb-8">Box breathing — 4 seconds each phase</p>

        {/* Breathing Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer glow */}
            <div
              className="absolute w-48 h-48 rounded-full transition-transform duration-300"
              style={{
                transform: `scale(${getScale()})`,
                background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
              }}
            />
            {/* Main circle */}
            <div
              className="absolute rounded-full transition-transform duration-300"
              style={{
                width: '140px',
                height: '140px',
                transform: `scale(${getScale()})`,
                background: `radial-gradient(circle at 40% 40%, 
                  rgba(167,139,250,0.5) 0%, 
                  rgba(103,232,249,0.25) 60%, 
                  rgba(167,139,250,0.1) 100%)`,
                boxShadow: `0 0 ${30 * getScale()}px rgba(167,139,250,0.4), 
                            0 0 ${60 * getScale()}px rgba(103,232,249,0.2)`,
              }}
            />
            {/* Phase label */}
            <span className="relative z-10 font-display text-2xl text-text/90">
              {isActive ? PHASES[phase].label : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={isActive ? stopBreathing : startBreathing}
            className="px-8 py-3 rounded-full font-body text-sm font-medium transition-all duration-300"
            style={{
              background: isActive
                ? 'rgba(248, 113, 113, 0.2)'
                : 'linear-gradient(135deg, rgba(167,139,250,0.3) 0%, rgba(103,232,249,0.2) 100%)',
              border: `1px solid ${isActive ? 'rgba(248,113,113,0.3)' : 'rgba(167,139,250,0.3)'}`,
              color: isActive ? '#f87171' : 'var(--color-text)',
            }}
          >
            {isActive ? 'Stop' : 'Begin'}
          </button>

          {/* Sound controls */}
          <div className="flex items-center gap-3 mt-2">
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className="bg-transparent border border-glass-border rounded-lg px-3 py-1.5 text-sm text-muted focus:text-text focus:border-primary/50 outline-none"
            >
              <option value="rain">🌧 Rain</option>
              <option value="whitenoise">🌊 White Noise</option>
              <option value="bowl">🔔 Tibetan Bowl</option>
            </select>
            <button
              onClick={toggleSound}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-all duration-300 ${
                soundEnabled
                  ? 'border-accent/40 text-accent bg-accent/10'
                  : 'border-glass-border text-muted hover:text-text'
              }`}
            >
              {soundEnabled ? '🔊 On' : '🔇 Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

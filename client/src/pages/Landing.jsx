import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import BreathingOrb from '../components/BreathingOrb'

export default function Landing() {
  const navigate = useNavigate()
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  const handleBegin = () => {
    const seen = localStorage.getItem('aether_disclaimer_seen')
    if (!seen) {
      setShowDisclaimer(true)
    } else {
      navigate('/session')
    }
  }

  const acceptDisclaimer = () => {
    localStorage.setItem('aether_disclaimer_seen', 'true')
    setShowDisclaimer(false)
    navigate('/session')
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="aether-bg">
        <div className="particle-field" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-slide-up max-w-3xl mx-auto">
        {/* Breathing Orb */}
        <div className="mb-14 relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse-soft" />
          <BreathingOrb size="xl" />
        </div>

        {/* Tagline */}
        <h1 
          className="font-display text-7xl md:text-9xl font-light mb-6 tracking-[0.05em]"
          style={{
            background: 'linear-gradient(to bottom right, #ffffff 0%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(196,181,253,0.3))'
          }}
        >
          Aether
        </h1>
        <p className="font-body text-xl md:text-2xl text-muted font-light mb-16 max-w-xl mx-auto leading-relaxed tracking-wide">
          A private, ambient sanctuary for <br className="hidden md:block"/>
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] italic font-display tracking-normal">self-reflection.</span>
        </p>

        {/* CTA Area */}
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          <button
            id="begin-session-btn"
            onClick={handleBegin}
            className="group relative w-full px-10 py-5 rounded-3xl font-body text-[15px] font-medium tracking-[0.2em] uppercase transition-all duration-700 hover:-translate-y-2"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(196,181,253,0.3)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2), 0 0 20px rgba(196,181,253,0.1)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <span className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500">
              Begin Session
            </span>
            <div
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'linear-gradient(135deg, rgba(196,181,253,0.15) 0%, rgba(45,212,191,0.1) 100%)',
                boxShadow: '0 0 50px rgba(196,181,253,0.4), inset 0 0 20px rgba(255,255,255,0.1)'
              }}
            />
          </button>

          {/* Auth links */}
          <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
            <Link
              to="/login"
              className="text-muted hover:text-primary transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
            >
              Sign in
            </Link>
            <div className="w-1 h-1 rounded-full bg-text/20" />
            <Link
              to="/register"
              className="text-muted hover:text-accent transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
            onClick={() => setShowDisclaimer(false)} 
          />
          <div
            className="relative glass-strong p-10 max-w-lg w-full transform transition-all animate-slide-up"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h2 className="font-display text-3xl text-text tracking-tight">Before we begin</h2>
            </div>
            
            <p className="text-text/80 text-base leading-relaxed mb-6 font-light">
              Aether is an AI companion designed for self-reflection and mindfulness. 
              It uses techniques from Cognitive Behavioral Therapy (CBT) to help you 
              explore your thoughts in a safe space.
            </p>
            
            <div
              className="rounded-xl p-5 mb-8 text-sm"
              style={{
                background: 'linear-gradient(145deg, rgba(251,191,36,0.05) 0%, rgba(251,191,36,0.02) 100%)',
                border: '1px solid rgba(251,191,36,0.2)',
                boxShadow: 'inset 0 1px 1px rgba(251,191,36,0.1)'
              }}
            >
              <div className="flex items-center gap-2 text-amber-300/90 font-medium mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Important
              </div>
              <p className="text-text/70 leading-relaxed">
                Aether is <strong className="text-text/90">not</strong> a replacement for a licensed therapist or mental health professional. 
                If you're in crisis, please reach out to a professional or call 988.
              </p>
            </div>
            
            <button
              onClick={acceptDisclaimer}
              className="group relative w-full py-4 rounded-xl font-body text-sm font-medium transition-all duration-300 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(129,140,248,0.1) 100%)',
                border: '1px solid rgba(167,139,250,0.4)',
              }}
            >
              <span className="relative z-10 text-white drop-shadow-md">I understand — continue</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(167,139,250,0.4) 0%, rgba(129,140,248,0.2) 100%)',
                }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

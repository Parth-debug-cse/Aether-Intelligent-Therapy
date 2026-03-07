import React from 'react'

const CRISIS_RESOURCES = [
  { name: '988 Suicide & Crisis Lifeline', number: '988', url: 'https://988lifeline.org' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', url: 'https://www.crisistextline.org' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357', url: 'https://www.samhsa.gov/find-help/national-helpline' },
]

export default function CrisisBanner({ isVisible, onDismiss }) {
  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-up">
      <div
        className="mx-4 mt-4 p-5 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(248,113,113,0.15) 0%, rgba(167,139,250,0.1) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(248,113,113,0.25)',
          boxShadow: '0 0 30px rgba(248,113,113,0.15)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💛</span>
              <h3 className="font-display text-lg text-text">You're not alone</h3>
            </div>
            <p className="text-sm text-text/80 mb-3">
              It sounds like you may be going through something really difficult. 
              Please reach out to one of these resources — trained counselors are available 24/7.
            </p>
            <div className="flex flex-wrap gap-3">
              {CRISIS_RESOURCES.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-static px-4 py-2 rounded-xl text-sm text-accent hover:text-white transition-colors"
                  style={{ borderRadius: '12px' }}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted ml-2">{r.number}</span>
                </a>
              ))}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted hover:text-text transition-colors mt-1"
            aria-label="Dismiss crisis banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

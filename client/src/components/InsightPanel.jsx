import React from 'react'

const DISTORTION_COLORS = {
  'catastrophizing': { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', text: '#fca5a5' },
  'all-or-nothing thinking': { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fcd34d' },
  'overgeneralization': { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#c4b5fd' },
  'mind reading': { bg: 'rgba(103,232,249,0.15)', border: 'rgba(103,232,249,0.3)', text: '#a5f3fc' },
  'personalization': { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#6ee7b7' },
  'should statements': { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', text: '#fdba74' },
  'emotional reasoning': { bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.3)', text: '#f9a8d4' },
  'labeling': { bg: 'rgba(129,140,248,0.15)', border: 'rgba(129,140,248,0.3)', text: '#a5b4fc' },
  'fortune telling': { bg: 'rgba(45,212,191,0.15)', border: 'rgba(45,212,191,0.3)', text: '#5eead4' },
  'mental filter': { bg: 'rgba(253,186,116,0.15)', border: 'rgba(253,186,116,0.3)', text: '#fed7aa' },
}

const DEFAULT_STYLE = { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', text: '#c4b5fd' }

function getDistortionStyle(distortion) {
  return DISTORTION_COLORS[distortion.toLowerCase()] || DEFAULT_STYLE
}

export default function InsightPanel({ distortions = [], confidenceScores = {}, reframeSuggestion = '', isOpen = true }) {
  if (!isOpen) return null

  const hasInsights = distortions.length > 0

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-glass-border">
        <h3 className="font-display text-lg text-text/90 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
          Insights
        </h3>
        <p className="text-xs text-muted mt-1">CBT pattern detection</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasInsights ? (
          <div className="text-center text-muted text-sm py-8">
            <div className="text-2xl mb-2 opacity-50">🧠</div>
            <p>Patterns will appear here as you share your thoughts.</p>
          </div>
        ) : (
          <>
            {/* Distortion tags */}
            <div className="space-y-2">
              {distortions.map((distortion, idx) => {
                const style = getDistortionStyle(distortion)
                const confidence = confidenceScores[distortion]
                return (
                  <div
                    key={idx}
                    className="animate-fade-in rounded-xl p-3"
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      animationDelay: `${idx * 150}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize" style={{ color: style.text }}>
                        {distortion}
                      </span>
                      {confidence && (
                        <span className="text-xs text-muted font-mono">
                          {Math.round(confidence * 100)}%
                        </span>
                      )}
                    </div>
                    {confidence && (
                      <div className="w-full h-1 rounded-full bg-black/20 mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${confidence * 100}%`,
                            background: style.text,
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Reframe suggestion */}
            {reframeSuggestion && (
              <div className="mt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Reframe</span>
                </div>
                <div
                  className="rounded-xl p-3 text-sm text-text/80 leading-relaxed"
                  style={{
                    background: 'rgba(167,139,250,0.08)',
                    border: '1px solid rgba(167,139,250,0.15)',
                  }}
                >
                  {reframeSuggestion}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

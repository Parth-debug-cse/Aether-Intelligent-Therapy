import React from 'react'

export default function BreathingOrb({ size = 'lg', className = '' }) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56',
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow rings */}
      <div
        className={`absolute ${sizeClasses[size]} rounded-full animate-breathe`}
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
          transform: 'scale(2)',
        }}
      />
      <div
        className={`absolute ${sizeClasses[size]} rounded-full animate-breathe`}
        style={{
          background: 'radial-gradient(circle, rgba(103,232,249,0.1) 0%, transparent 70%)',
          transform: 'scale(1.6)',
          animationDelay: '0.5s',
        }}
      />
      {/* Core orb */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full animate-breathe`}
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(167,139,250,0.6) 0%, rgba(103,232,249,0.3) 50%, rgba(167,139,250,0.1) 100%)',
          boxShadow: '0 0 40px rgba(167,139,250,0.3), 0 0 80px rgba(103,232,249,0.15), inset 0 0 30px rgba(255,255,255,0.05)',
        }}
      />
    </div>
  )
}

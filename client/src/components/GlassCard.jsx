import React from 'react'

export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`${hover ? 'glass' : 'glass-static'} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

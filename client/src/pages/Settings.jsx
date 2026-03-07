import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(localStorage.getItem('aether_theme') || 'dark')
  const [ambientSound, setAmbientSound] = useState(localStorage.getItem('aether_ambient') || 'rain')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState('')

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('aether_theme', newTheme)
    // Theme application would go here for light mode support
  }

  const handleDeleteData = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      await api.delete('/auth/delete-account')
      logout()
      navigate('/')
    } catch (err) {
      console.error('Error deleting data', err)
      setMessage('Failed to delete data. Please try again.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="relative min-h-screen pb-20">
      <div className="aether-bg"><div className="particle-field" /></div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20 animate-slide-up">
        {/* Header */}
        <div className="mb-12">
          <Link to="/session" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors mb-4 group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to session
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-5xl md:text-6xl tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-primary/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Settings</h1>
            <div className="h-1 flex-1 bg-gradient-to-r from-primary/30 to-transparent rounded-full max-w-xs mt-2" />
          </div>
        </div>

        {message && (
          <div className="mb-8 p-4 rounded-xl text-sm text-accent animate-fade-in" style={{ background: 'rgba(103,232,249,0.1)', border: '1px solid rgba(103,232,249,0.2)' }}>
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {message}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile */}
          <div className="glass-static p-8" style={{ borderRadius: '24px' }}>
            <h3 className="font-display text-2xl text-text mb-6 flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Profile
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                <span className="text-sm font-medium text-muted uppercase tracking-wider">Name / Alias</span>
                <span className="text-[15px] text-text font-light">{user?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                <span className="text-sm font-medium text-muted uppercase tracking-wider">Private Email</span>
                <span className="text-[15px] text-text font-light">{user?.email || '—'}</span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-static p-8" style={{ borderRadius: '24px' }}>
            <h3 className="font-display text-2xl text-text mb-6 flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Preferences
            </h3>
            
            <div className="space-y-8">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-muted uppercase tracking-wider mb-4">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {['dark', 'light', 'auto'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl text-sm capitalize transition-all duration-300 ${
                        theme === t
                          ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(167,139,250,0.15)]'
                          : 'bg-white/5 border border-white/10 text-muted hover:text-white hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl mb-2">{t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '🔄'}</span>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient Sound */}
              <div className="pt-4 border-t border-white/5">
                <label className="block text-sm font-medium text-muted uppercase tracking-wider mb-4">Default Ambient Sound</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'rain', label: 'Rain', icon: '🌧' },
                    { id: 'whitenoise', label: 'Waves', icon: '🌊' },
                    { id: 'bowl', label: 'Bowl', icon: '🔔' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setAmbientSound(s.id)
                        localStorage.setItem('aether_ambient', s.id)
                      }}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl text-sm transition-all duration-300 ${
                        ambientSound === s.id
                          ? 'bg-accent/15 text-accent border border-accent/30 shadow-[0_0_15px_rgba(103,232,249,0.15)]'
                          : 'bg-white/5 border border-white/10 text-muted hover:text-white hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl mb-2">{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="glass-static p-8" style={{ border: '1px solid rgba(251,113,133,0.1)', borderRadius: '24px' }}>
            <h3 className="font-display text-2xl text-danger mb-6 flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Danger Zone
            </h3>
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-sm font-medium text-text bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                Sign out of Aether
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted group-hover:text-text group-hover:translate-x-1 transition-all"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
              <button
                onClick={handleDeleteData}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-sm font-medium transition-all ${
                  confirmDelete
                    ? 'text-danger border border-danger/40 bg-danger/10 shadow-[0_0_20px_rgba(251,113,133,0.2)]'
                    : 'text-danger/80 bg-white/5 border border-danger/20 hover:bg-danger/10 hover:border-danger/30 hover:text-danger'
                }`}
              >
                {confirmDelete ? 'Click confirm to permanently delete all data' : 'Delete all my data'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

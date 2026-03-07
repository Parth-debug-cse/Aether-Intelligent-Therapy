import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/GlassCard'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/session')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="aether-bg">
        <div className="particle-field" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo/Home Link */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block group">
            <h1 className="font-display text-4xl text-text tracking-tight group-hover:text-primary transition-colors duration-300">
              Aether
            </h1>
            <div className="h-px w-0 bg-primary/50 mx-auto mt-2 transition-all duration-500 group-hover:w-full" />
          </Link>
        </div>

        <GlassCard className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="font-body text-2xl font-light text-text mb-2 tracking-wide">Create your space</h2>
            <p className="text-muted text-sm font-light">Begin your journey of mindful reflection.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger/90 text-sm text-center font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted ml-1">Name / Alias</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-text focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-light placeholder:text-white/20"
                placeholder="How should I call you?"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-text focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-light placeholder:text-white/20"
                placeholder="Enter your private email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-text focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-light placeholder:text-white/20"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-xl font-body text-sm font-medium tracking-wide uppercase mt-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(129,140,248,0.1) 100%)',
                border: '1px solid rgba(167,139,250,0.3)',
              }}
            >
              <span className="relative z-10 text-white drop-shadow-md">
                {loading ? 'Creating...' : 'Create Account'}
              </span>
              {!loading && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.4) 0%, rgba(129,140,248,0.2) 100%)',
                  }}
                />
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-light">
            <span className="text-muted">Already have a space? </span>
            <Link to="/login" className="text-primary hover:text-accent transition-colors font-medium">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

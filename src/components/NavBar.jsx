import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadProfile } from '../utils/dataStore'

const NAV = [
  { path: '/dashboard',   label: 'Dashboard',   icon: '◎' },
  { path: '/trends',      label: 'Trends',       icon: '↗' },
  { path: '/competitors', label: 'Competitors',  icon: '◈' },
  { path: '/settings',    label: 'Settings',     icon: '⊙' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const profile = loadProfile()
  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      height: 64,
      background: scrolled
        ? 'rgba(10,8,5,0.85)'
        : 'rgba(10,8,5,0.6)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(234,88,12,0.2)' : 'rgba(255,255,255,0.05)'}`,
      boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5), 0 0 60px rgba(234,88,12,0.06)' : 'none',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
    }}>

      {/* Logo */}
      <div onClick={() => navigate('/dashboard')} style={{
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        userSelect: 'none',
      }}>
        {/* Logo mark */}
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 60%, #C2410C 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(249,115,22,0.45), 0 0 0 1px rgba(255,255,255,0.1)',
          position: 'relative',
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)',
          }} />
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="3" fill="white" />
            <circle cx="9" cy="9" r="6.5" stroke="white" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
            <circle cx="9" cy="9" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" strokeDasharray="2 3" />
          </svg>
        </div>

        {/* Brand name */}
        <div style={{ lineHeight: 1 }}>
          <span style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 20,
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
          }}>
            Signal<span style={{
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>IQ</span>
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {NAV.map(n => {
          const active = pathname.startsWith(n.path)
          return (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              style={{
                padding: '7px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                fontFamily: 'var(--font)',
                background: active
                  ? 'rgba(234,88,12,0.15)'
                  : 'transparent',
                color: active ? '#F97316' : 'var(--text-secondary)',
                border: active
                  ? '1px solid rgba(234,88,12,0.3)'
                  : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                position: 'relative',
                letterSpacing: active ? '0.2px' : '0',
                boxShadow: active ? '0 0 16px rgba(234,88,12,0.15)' : 'none',
                transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 400 }}>{n.icon}</span>
              {n.label}
              {active && (
                <span style={{
                  position: 'absolute',
                  bottom: -1, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20, height: 2,
                  background: 'linear-gradient(90deg, transparent, #F97316, transparent)',
                  borderRadius: 2,
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          background: 'rgba(20,184,166,0.08)',
          border: '1px solid rgba(20,184,166,0.2)',
          fontSize: 11, fontWeight: 600, color: '#2DD4BF',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#14B8A6',
            boxShadow: '0 0 8px rgba(20,184,166,0.7)',
            animation: 'pulse-dot 2s ease-in-out infinite',
            display: 'inline-block',
          }} />
          LIVE
        </div>

        {/* Industry tag */}
        {profile?.industry && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20,
            background: 'rgba(249,115,22,0.1)',
            color: 'var(--orange-300)',
            border: '1px solid rgba(249,115,22,0.2)',
          }}>{profile.industry}</span>
        )}

        {/* Avatar */}
        <div
          onClick={() => navigate('/settings')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5,
            boxShadow: '0 0 0 2px rgba(249,115,22,0.3), 0 4px 12px rgba(249,115,22,0.35)',
            cursor: 'pointer',
            transition: 'all 0.22s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.6), 0 4px 20px rgba(249,115,22,0.5), 0 0 30px rgba(249,115,22,0.25)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.3), 0 4px 12px rgba(249,115,22,0.35)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >{initials}</div>
      </div>
    </header>
  )
}

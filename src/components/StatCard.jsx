import React, { useEffect, useRef, useState } from 'react'

export default function StatCard({ value, label, delta, deltaPositive = true, color = 'orange', icon, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  const colors = {
    orange: {
      bg: 'linear-gradient(135deg, rgba(234,88,12,0.12) 0%, rgba(249,115,22,0.06) 100%)',
      border: 'rgba(234,88,12,0.25)',
      borderHover: 'rgba(234,88,12,0.5)',
      num: '#F97316',
      numGlow: '0 0 20px rgba(249,115,22,0.5)',
      icon: 'rgba(249,115,22,0.12)',
      iconBorder: 'rgba(249,115,22,0.2)',
      glow: '0 0 40px rgba(234,88,12,0.2), 0 8px 32px rgba(0,0,0,0.6)',
      accent: '#F97316',
    },
    teal: {
      bg: 'linear-gradient(135deg, rgba(20,184,166,0.10) 0%, rgba(45,212,191,0.05) 100%)',
      border: 'rgba(20,184,166,0.22)',
      borderHover: 'rgba(20,184,166,0.45)',
      num: '#2DD4BF',
      numGlow: '0 0 20px rgba(20,184,166,0.5)',
      icon: 'rgba(20,184,166,0.10)',
      iconBorder: 'rgba(20,184,166,0.2)',
      glow: '0 0 40px rgba(20,184,166,0.18), 0 8px 32px rgba(0,0,0,0.6)',
      accent: '#14B8A6',
    },
    rose: {
      bg: 'linear-gradient(135deg, rgba(244,63,94,0.10) 0%, rgba(251,113,133,0.05) 100%)',
      border: 'rgba(244,63,94,0.22)',
      borderHover: 'rgba(244,63,94,0.45)',
      num: '#FB7185',
      numGlow: '0 0 20px rgba(244,63,94,0.5)',
      icon: 'rgba(244,63,94,0.10)',
      iconBorder: 'rgba(244,63,94,0.2)',
      glow: '0 0 40px rgba(244,63,94,0.18), 0 8px 32px rgba(0,0,0,0.6)',
      accent: '#F43F5E',
    },
  }
  const c = colors[color] || colors.orange

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!visible) return
    const target = typeof value === 'number' ? value : 0
    if (target === 0) { setDisplay(0); return }
    let start = 0
    const step = Math.ceil(target / 20)
    const iv = setInterval(() => {
      start = Math.min(start + step, target)
      setDisplay(start)
      if (start >= target) clearInterval(iv)
    }, 35)
    return () => clearInterval(iv)
  }, [visible, value])

  return (
    <div
      className={`animate-fadeUp anim-d${Math.min(Math.ceil(delay / 50) + 1, 6)}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: c.bg,
        border: `1px solid ${hovered ? c.borderHover : c.border}`,
        borderRadius: 20,
        padding: '22px 24px',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? c.glow : '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background shimmer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }} />

      {/* Glowing top-left corner accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top left, ${c.accent}22, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          {/* Big number */}
          <div style={{
            fontSize: 38,
            fontWeight: 900,
            color: c.num,
            letterSpacing: '-2px',
            fontFamily: 'var(--display)',
            fontStyle: 'italic',
            lineHeight: 1,
            textShadow: hovered ? c.numGlow : 'none',
            animation: visible ? 'countUp 0.5s cubic-bezier(0.22,1,0.36,1)' : 'none',
            transition: 'text-shadow 0.3s',
          }}>
            {typeof value === 'number' ? display : value}
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginTop: 7,
            fontWeight: 500,
            letterSpacing: '0.2px',
          }}>{label}</div>
        </div>

        {/* Icon box */}
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: c.icon,
          border: `1px solid ${c.iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
          transition: 'transform 0.3s',
          transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
          boxShadow: hovered ? `0 0 16px ${c.accent}40` : 'none',
        }}>{icon}</div>
      </div>

      {/* Delta */}
      {delta && (
        <div style={{
          marginTop: 14,
          fontSize: 11.5,
          fontWeight: 700,
          color: deltaPositive ? '#2DD4BF' : '#FB7185',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          letterSpacing: '0.2px',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16, height: 16,
            borderRadius: '50%',
            background: deltaPositive ? 'rgba(20,184,166,0.15)' : 'rgba(244,63,94,0.15)',
            fontSize: 9,
          }}>
            {deltaPositive ? '▲' : '▼'}
          </span>
          {delta}
        </div>
      )}

      {/* Bottom glow line */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: '10%',
        width: '80%', height: 1,
        background: `linear-gradient(90deg, transparent, ${c.accent}60, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s',
        borderRadius: 1,
      }} />
    </div>
  )
}

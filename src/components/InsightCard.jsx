import React, { useState, useEffect, useRef } from 'react'
import { recordFeedback } from '../utils/dataStore'

const BADGE = {
  hot:    { cls: 'badge badge-hot',    icon: '🔥', label: 'Hot'    },
  rising: { cls: 'badge badge-rising', icon: '↑',  label: 'Rising' },
  watch:  { cls: 'badge badge-watch',  icon: '◉',  label: 'Watch'  },
}

const ACCENT = {
  hot:    { color: '#FB7185', glow: 'rgba(244,63,94,0.3)',  bar: 'linear-gradient(90deg,#F43F5E,#FB7185,#FF8FA3)' },
  rising: { color: '#2DD4BF', glow: 'rgba(20,184,166,0.3)', bar: 'linear-gradient(90deg,#14B8A6,#2DD4BF,#5EEAD4)' },
  watch:  { color: '#A78BFA', glow: 'rgba(139,92,246,0.3)', bar: 'linear-gradient(90deg,#8B5CF6,#A78BFA,#C4B5FD)' },
}

const SOURCE_TYPE_ICON = { news: '📰', community: '💬', default: '🔗' }

export default function InsightCard({ signal, onFeedback, animDelay = 0 }) {
  const [fb, setFb]           = useState(null)
  const [barWidth, setBarWidth] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const bodyRef = useRef(null)
  const [bodyHeight, setBodyHeight] = useState(0)

  const b   = BADGE[signal.badge]  || BADGE.watch
  const a   = ACCENT[signal.badge] || ACCENT.watch
  const pct = Math.min(100, signal.finalScore)

  // Animate bar in
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 400 + animDelay)
    return () => clearTimeout(t)
  }, [pct, animDelay])

  // Measure expanded body height for smooth CSS transition
  useEffect(() => {
    if (!bodyRef.current) return
    setBodyHeight(expanded ? bodyRef.current.scrollHeight : 0)
  }, [expanded])

  function handleFb(isUseful) {
    if (fb !== null) return
    setFb(isUseful)
    recordFeedback(signal.id, signal.keyword, isUseful)
    if (onFeedback) setTimeout(onFeedback, 400)
  }

  const accentRgb = signal.badge === 'hot' ? '244,63,94'
    : signal.badge === 'rising' ? '20,184,166'
    : '139,92,246'

  return (
    <div
      className="animate-fadeUp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${animDelay}ms`,
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(${accentRgb},0.04) 100%)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${expanded || hovered ? a.color + '40' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20,
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered || expanded
          ? `0 12px 40px rgba(0,0,0,0.6), 0 0 30px ${a.glow}`
          : '0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left glowing accent bar */}
      <div style={{
        position: 'absolute',
        left: 0, top: expanded ? '8%' : '15%', bottom: expanded ? '8%' : '15%',
        width: hovered || expanded ? 4 : 3,
        borderRadius: '0 4px 4px 0',
        background: a.bar,
        boxShadow: hovered || expanded ? `0 0 12px ${a.color}, 0 0 24px ${a.glow}` : 'none',
        transition: 'all 0.3s',
      }} />

      {/* Top-right radial glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${a.glow.replace('0.3', '0.06')} 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity: hovered || expanded ? 1 : 0,
        transition: 'opacity 0.3s',
      }} />

      {/* ── Collapsed / always-visible top section ── */}
      <div style={{ padding: '18px 20px 18px 26px' }}>

        {/* Header row — click title to expand */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12, marginBottom: 12,
        }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              flex: 1, textAlign: 'left', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
            }}
          >
            <p style={{
              fontWeight: 700, fontSize: 13.5, lineHeight: 1.55,
              color: hovered || expanded ? '#F5F0E8' : 'var(--text-primary)',
              letterSpacing: '-0.1px',
              transition: 'color 0.2s',
            }}>
              {signal.title}
            </p>
          </button>
          <span className={b.cls} style={{ flexShrink: 0 }}>{b.icon} {b.label}</span>
        </div>

        {/* Score bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Signal Score
            </span>
            <span style={{
              fontSize: 12, fontWeight: 800, color: a.color,
              fontFamily: 'var(--display)', fontStyle: 'italic',
              textShadow: hovered ? `0 0 10px ${a.color}` : 'none',
              transition: 'text-shadow 0.3s',
            }}>{pct}</span>
          </div>
          <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, width: `${barWidth}%`,
              background: a.bar,
              transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: hovered ? `0 0 8px ${a.color}` : 'none',
            }} />
          </div>
        </div>

        {/* Source chips row */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '3px 10px', borderRadius: 20,
          }}>
            {SOURCE_TYPE_ICON[signal.sourceType] || SOURCE_TYPE_ICON.default} {signal.source}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.2)',
            padding: '3px 10px', borderRadius: 20,
            color: 'var(--orange-300)',
          }}>
            🏷 {signal.keyword}
          </span>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700,
              color: expanded ? a.color : 'var(--text-muted)',
              background: expanded ? `${a.color}15` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${expanded ? a.color + '35' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20, padding: '3px 11px',
              cursor: 'pointer',
              transition: 'all 0.22s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = a.color
              e.currentTarget.style.borderColor = a.color + '50'
              e.currentTarget.style.background = `${a.color}12`
            }}
            onMouseLeave={e => {
              if (!expanded) {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }
            }}
          >
            <span style={{
              display: 'inline-block',
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
              fontSize: 10,
            }}>▼</span>
            {expanded ? 'Collapse' : 'Read more'}
          </button>
        </div>

        {/* Action tip — always visible */}
        <div style={{
          background: hovered || expanded ? 'rgba(20,184,166,0.08)' : 'rgba(20,184,166,0.05)',
          border: '1px solid rgba(20,184,166,0.15)',
          borderRadius: 12,
          padding: '11px 14px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
          transition: 'all 0.3s',
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 12.5, color: '#5EEAD4', lineHeight: 1.6, fontWeight: 500 }}>
            {signal.action}
          </p>
        </div>
      </div>

      {/* ── Expandable detail body ── */}
      <div
        ref={bodyRef}
        style={{
          height: bodyHeight,
          overflow: 'hidden',
          transition: 'height 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{
          padding: '0 20px 20px 26px',
          borderTop: `1px solid ${a.color}20`,
          marginTop: 0,
        }}>
          {/* Full summary */}
          <div style={{ paddingTop: 16, marginBottom: 16 }}>
            <p style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8,
            }}>Full Summary</p>
            <p style={{
              fontSize: 13.5, lineHeight: 1.8, color: 'rgba(245,240,232,0.85)',
              fontFamily: 'var(--display)', fontStyle: 'italic', fontWeight: 700,
            }}>
              {signal.summary}
            </p>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 10, marginBottom: 16,
          }}>
            {[
              { label: 'Recency',   value: `${signal.recency}h`,   icon: '⏱' },
              { label: 'Velocity',  value: `+${signal.velocity}`,   icon: '↗' },
              { label: 'Source',    value: signal.sourceType === 'news' ? 'News' : 'Community', icon: signal.sourceType === 'news' ? '📰' : '💬' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '10px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{
                  fontSize: 14, fontWeight: 900, color: a.color,
                  fontFamily: 'var(--display)', fontStyle: 'italic',
                  marginBottom: 2,
                }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Read original link */}
          <a
            href={signal.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700, color: a.color,
              border: `1px solid ${a.color}35`,
              background: `${a.color}10`,
              padding: '7px 16px', borderRadius: 20,
              transition: 'all 0.22s',
              textDecoration: 'none',
              marginBottom: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${a.color}22`; e.currentTarget.style.boxShadow = `0 0 12px ${a.glow}` }}
            onMouseLeave={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.boxShadow = 'none' }}
          >
            Read original story ↗
          </a>

          {/* Feedback */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => handleFb(true)}
              style={{
                padding: '6px 16px', borderRadius: 20,
                fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${fb === true ? 'rgba(20,184,166,0.6)' : 'rgba(255,255,255,0.1)'}`,
                background: fb === true ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.03)',
                color: fb === true ? '#2DD4BF' : 'var(--text-muted)',
                transition: 'all 0.22s',
              }}
              onMouseEnter={e => { if (fb === null) { e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)'; e.currentTarget.style.color = '#2DD4BF' } }}
              onMouseLeave={e => { if (fb !== true) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            >✓ Useful</button>

            <button
              onClick={() => handleFb(false)}
              style={{
                padding: '6px 16px', borderRadius: 20,
                fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${fb === false ? 'rgba(244,63,94,0.6)' : 'rgba(255,255,255,0.1)'}`,
                background: fb === false ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.03)',
                color: fb === false ? '#FB7185' : 'var(--text-muted)',
                transition: 'all 0.22s',
              }}
              onMouseEnter={e => { if (fb === null) { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)'; e.currentTarget.style.color = '#FB7185' } }}
              onMouseLeave={e => { if (fb !== false) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            >✗ Skip</button>

            {fb !== null && (
              <span className="animate-fadeIn" style={{
                fontSize: 11, marginLeft: 4,
                color: fb ? '#2DD4BF' : '#FB7185', fontWeight: 600,
              }}>
                {fb ? '✓ Feed adjusted.' : 'Got it — hidden next time.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

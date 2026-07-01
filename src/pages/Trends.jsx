import React, { useState, useEffect, useRef } from 'react'
import { loadSignals } from '../utils/dataStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'

const LINE_COLORS = ['#F97316', '#14B8A6', '#8B5CF6', '#F43F5E', '#EAB308']

function buildChartData(signals, keywords) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today']
  return days.map((day, di) => {
    const row = { day }
    keywords.forEach(kw => {
      const base = signals.find(s => s.keyword === kw)?.finalScore || 60
      row[kw] = Math.max(30, Math.min(100, base - (6 - di) * 4 + Math.floor(Math.random() * 10)))
    })
    return row
  })
}

const SOURCE_ICONS = { news: '📰', community: '💬', default: '🔗' }

const BADGE_STYLE = {
  hot:    { background: 'rgba(244,63,94,0.15)',  color: '#FB7185', border: '1px solid rgba(244,63,94,0.3)'  },
  rising: { background: 'rgba(20,184,166,0.12)', color: '#2DD4BF', border: '1px solid rgba(20,184,166,0.25)' },
  watch:  { background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' },
}
const BADGE_LABEL = { hot: '🔥 Hot', rising: '↑ Rising', watch: '◉ Watch' }
const ACCENT_COLOR = { hot: '#FB7185', rising: '#2DD4BF', watch: '#A78BFA' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(22,18,16,0.96)',
      border: '1px solid rgba(249,115,22,0.25)',
      borderRadius: 12, padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(234,88,12,0.1)',
      backdropFilter: 'blur(10px)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{p.dataKey}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: p.color, fontFamily: 'var(--display)', fontStyle: 'italic' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Expandable signal card for the Trends grid ──
function TrendCard({ s, i, accentColor }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered]   = useState(false)
  const bodyRef = useRef(null)
  const [bodyH, setBodyH] = useState(0)
  const bs = BADGE_STYLE[s.badge] || BADGE_STYLE.watch

  useEffect(() => {
    if (!bodyRef.current) return
    setBodyH(expanded ? bodyRef.current.scrollHeight : 0)
  }, [expanded])

  return (
    <div
      className="animate-fadeUp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${i * 40}ms`,
        background: hovered || expanded
          ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.1) 100%)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${expanded || hovered ? accentColor + '40' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered || expanded
          ? `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${accentColor}20`
          : '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left accent */}
      <div style={{
        position: 'absolute', left: 0,
        top: expanded ? '5%' : '15%', bottom: expanded ? '5%' : '15%',
        width: 3, borderRadius: '0 3px 3px 0',
        background: accentColor,
        boxShadow: hovered || expanded ? `0 0 8px ${accentColor}` : 'none',
        transition: 'all 0.3s',
      }} />

      {/* Collapsed top */}
      <div style={{ padding: '15px 16px 15px 20px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 10, marginBottom: 10,
        }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: hovered || expanded ? '#F5F0E8' : 'var(--text-primary)',
              lineHeight: 1.5, transition: 'color 0.2s',
            }}>{s.title}</p>
          </button>
          <span style={{
            ...bs, fontSize: 10, fontWeight: 700,
            padding: '3px 9px', borderRadius: 20, flexShrink: 0,
            whiteSpace: 'nowrap', letterSpacing: '0.3px',
          }}>{BADGE_LABEL[s.badge] || '◉ Watch'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {SOURCE_ICONS[s.sourceType] || SOURCE_ICONS.default} {s.source}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)',
            color: '#F97316', padding: '2px 8px', borderRadius: 20,
          }}>🏷 {s.keyword}</span>

          {/* Score + toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 13, fontWeight: 900, color: accentColor,
              fontFamily: 'var(--display)', fontStyle: 'italic',
            }}>{s.finalScore}</span>
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                fontSize: 10, fontWeight: 700,
                color: expanded ? accentColor : 'var(--text-muted)',
                background: expanded ? `${accentColor}15` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${expanded ? accentColor + '35' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 20, padding: '3px 10px',
                cursor: 'pointer', transition: 'all 0.22s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', fontSize: 8 }}>▼</span>
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable body */}
      <div
        ref={bodyRef}
        style={{ height: bodyH, overflow: 'hidden', transition: 'height 0.4s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div style={{
          padding: '0 16px 16px 20px',
          borderTop: `1px solid ${accentColor}20`,
        }}>
          {/* Summary */}
          <p style={{
            fontSize: 13.5, lineHeight: 1.8,
            color: 'rgba(245,240,232,0.85)',
            fontFamily: 'var(--display)', fontStyle: 'italic', fontWeight: 700,
            paddingTop: 14, marginBottom: 14,
          }}>{s.summary}</p>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Recency',  value: `${s.recency}h`,  icon: '⏱' },
              { label: 'Velocity', value: `+${s.velocity}`, icon: '↗' },
              { label: 'Score',    value: s.finalScore,      icon: '📊' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>{stat.icon}</div>
                <div style={{
                  fontSize: 14, fontWeight: 900, color: accentColor,
                  fontFamily: 'var(--display)', fontStyle: 'italic', marginBottom: 2,
                }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Action tip */}
          {s.action && (
            <div style={{
              background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.14)',
              borderRadius: 10, padding: '10px 13px',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: 12.5, color: '#5EEAD4', lineHeight: 1.6, fontWeight: 500 }}>{s.action}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, children, activeColor = '#F97316' }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 16px', borderRadius: 20,
        fontSize: 12, fontWeight: active ? 700 : 400,
        background: active ? `${activeColor}20` : 'rgba(255,255,255,0.03)',
        color: active ? activeColor : 'var(--text-muted)',
        border: `1px solid ${active ? `${activeColor}50` : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.22s',
        boxShadow: active ? `0 0 12px ${activeColor}30` : 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
    >{children}</button>
  )
}

export default function Trends() {
  const [signals, setSignals]     = useState([])
  const [filter, setFilter]       = useState('all')
  const [kwFilter, setKwFilter]   = useState('all')
  const [sort, setSort]           = useState('score')
  const [chartData, setChartData] = useState([])
  const [keywords, setKeywords]   = useState([])

  useEffect(() => {
    const s = loadSignals()
    setSignals(s)
    const kws = [...new Set(s.map(x => x.keyword))].slice(0, 5)
    setKeywords(kws)
    setChartData(buildChartData(s, kws))
  }, [])

  const filtered = signals
    .filter(s => filter === 'all' || s.sourceType === filter)
    .filter(s => kwFilter === 'all' || s.keyword === kwFilter)
    .sort((a, b) => sort === 'score' ? b.finalScore - a.finalScore : b.recency - a.recency)

  return (
    <div>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '1.5px', color: '#F97316', marginBottom: 6,
        }}>↗ Trends Explorer</p>
        <h1 style={{
          fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
          fontSize: 34, letterSpacing: '-1px', lineHeight: 1.1,
          background: 'linear-gradient(135deg, #F5F0E8 40%, #F97316 80%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>Signal Velocity</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Momentum of tracked topics over the past 7 days · <strong style={{ color: 'rgba(245,240,232,0.6)', fontWeight: 500 }}>Click any card to expand full detail</strong>
        </p>
      </div>

      {/* Chart */}
      <div className="animate-fadeUp anim-d1" style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 22, padding: '24px 26px', marginBottom: 22,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontWeight: 900, fontSize: 17, color: 'var(--text-primary)', marginBottom: 22 }}>
          📡 Signal Velocity — Last 7 Days
        </div>
        {keywords.length === 0 ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No data yet — complete setup first
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis domain={[20, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16, color: 'var(--text-secondary)' }} />
              {keywords.map((kw, i) => (
                <Line
                  key={kw} type="monotone" dataKey={kw}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2.5} dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: LINE_COLORS[i % LINE_COLORS.length], style: { filter: `drop-shadow(0 0 6px ${LINE_COLORS[i % LINE_COLORS.length]})` } }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Filters */}
      <div className="animate-fadeUp anim-d2" style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '14px 18px', marginBottom: 18,
        display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Source</span>
          {['all', 'news', 'community'].map(f => (
            <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'news' ? '📰 News' : '💬 Community'}
            </FilterPill>
          ))}
        </div>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sort</span>
          {[{ v: 'score', l: '⬆ Top Score' }, { v: 'recent', l: '🕐 Newest' }].map(s => (
            <FilterPill key={s.v} active={sort === s.v} onClick={() => setSort(s.v)} activeColor="#14B8A6">{s.l}</FilterPill>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          <span style={{ color: '#F97316', fontFamily: 'var(--display)', fontStyle: 'italic', fontWeight: 900 }}>{filtered.length}</span> signals
        </div>
      </div>

      {/* Signal grid — now expandable cards */}
      <div className="animate-fadeUp anim-d3" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 14,
      }}>
        {filtered.map((s, i) => (
          <TrendCard
            key={s.id}
            s={s}
            i={i}
            accentColor={ACCENT_COLOR[s.badge] || '#A78BFA'}
          />
        ))}
      </div>
    </div>
  )
}

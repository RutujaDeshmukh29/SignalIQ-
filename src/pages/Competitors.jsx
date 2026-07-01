import React, { useState, useEffect, useRef } from 'react'
import { loadCompFeed, loadProfile, timeAgo } from '../utils/dataStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

const COMP_COLORS = ['#F97316', '#14B8A6', '#8B5CF6', '#F43F5E', '#EAB308']

const SENTIMENT_STYLE = {
  Threat:      { bg: 'rgba(244,63,94,0.12)',  color: '#FB7185', border: 'rgba(244,63,94,0.3)',  icon: '⚠️' },
  Opportunity: { bg: 'rgba(20,184,166,0.10)', color: '#2DD4BF', border: 'rgba(20,184,166,0.25)', icon: '🎯' },
  Neutral:     { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)', icon: '◈' },
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(22,18,16,0.96)', border: '1px solid rgba(249,115,22,0.25)',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{
        fontSize: 16, fontWeight: 900,
        color: payload[0]?.payload?.color || '#F97316',
        fontFamily: 'var(--display)', fontStyle: 'italic',
      }}>{payload[0]?.value} <span style={{ fontSize: 11, fontWeight: 500 }}>mentions</span></p>
    </div>
  )
}

// ── Expandable competitor timeline card ──
function CompCard({ item, i, color, totalLen }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered]   = useState(false)
  const bodyRef = useRef(null)
  const [bodyH, setBodyH] = useState(0)
  const isRecent = item.hoursAgo < 24
  const sent = SENTIMENT_STYLE[item.sentiment] || SENTIMENT_STYLE.Neutral

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
        animationDelay: `${i * 30}ms`,
        background: hovered || expanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered || expanded ? color + '35' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered || expanded ? `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${color}20` : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top: always visible */}
      <div style={{ padding: '15px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Timeline connector */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 3 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: color,
            boxShadow: hovered || expanded ? `0 0 10px ${color}` : 'none',
            transition: 'box-shadow 0.25s',
          }} />
          <div style={{
            width: 1, flex: 1, minHeight: 16,
            background: i < totalLen - 1 ? `linear-gradient(to bottom, ${color}60, transparent)` : 'transparent',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Headline row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <p style={{
                fontSize: 13.5, fontWeight: 700,
                color: hovered || expanded ? '#F5F0E8' : 'var(--text-primary)',
                lineHeight: 1.5, transition: 'color 0.2s',
              }}>{item.headline}</p>
            </button>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
              {isRecent && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
                  background: 'rgba(244,63,94,0.15)', color: '#FB7185',
                  border: '1px solid rgba(244,63,94,0.3)',
                  letterSpacing: '0.5px', boxShadow: '0 0 10px rgba(244,63,94,0.2)',
                }}>NEW</span>
              )}
              {/* Sentiment badge */}
              {item.sentiment && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                  background: sent.bg, color: sent.color,
                  border: `1px solid ${sent.border}`,
                  letterSpacing: '0.3px',
                }}>{sent.icon} {item.sentiment}</span>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: `${color}18`, color, border: `1px solid ${color}35`,
            }}>{item.competitorName}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📰 {item.source}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🏷 {item.topic}</span>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                {timeAgo(item.hoursAgo)}
              </span>
              <button
                onClick={() => setExpanded(v => !v)}
                style={{
                  fontSize: 10, fontWeight: 700,
                  color: expanded ? color : 'var(--text-muted)',
                  background: expanded ? `${color}15` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${expanded ? color + '35' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 20, padding: '3px 10px',
                  cursor: 'pointer', transition: 'all 0.22s',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <span style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', fontSize: 8 }}>▼</span>
                {expanded ? 'Less' : 'Analysis'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable body */}
      <div
        ref={bodyRef}
        style={{ height: bodyH, overflow: 'hidden', transition: 'height 0.4s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <div style={{
          padding: '0 18px 18px 42px',
          borderTop: `1px solid ${color}20`,
        }}>
          {/* Intelligence analysis */}
          <div style={{ paddingTop: 14, marginBottom: 14 }}>
            <p style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8,
            }}>Intelligence Analysis</p>
            <p style={{
              fontSize: 13.5, lineHeight: 1.8,
              color: 'rgba(245,240,232,0.85)',
              fontFamily: 'var(--display)', fontStyle: 'italic', fontWeight: 700,
            }}>
              {item.detail || 'No additional detail available for this item.'}
            </p>
          </div>

          {/* Detail meta cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Age',      value: timeAgo(item.hoursAgo), icon: '⏱' },
              { label: 'Source',   value: item.source,             icon: '📰' },
              { label: 'Signal',   value: item.sentiment || '—',   icon: sent.icon },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>{stat.icon}</div>
                <div style={{
                  fontSize: 12, fontWeight: 800, color,
                  fontFamily: 'var(--display)', fontStyle: 'italic', marginBottom: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* What this means for you */}
          <div style={{
            background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.12)',
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🧠</span>
            <p style={{ fontSize: 12.5, color: 'var(--orange-300)', lineHeight: 1.6, fontWeight: 500 }}>
              <strong style={{ fontWeight: 700 }}>What this means for you:</strong> Track how{' '}
              <strong style={{ color }}>{ item.competitorName}</strong>'s {item.topic} move affects
              demand signals in your segment. Use this as a trigger to review your positioning in the next 7 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Competitors() {
  const [feed, setFeed]     = useState([])
  const [filter, setFilter] = useState('all')
  const profile = loadProfile()

  useEffect(() => { setFeed(loadCompFeed()) }, [])

  const competitors = [...new Set(feed.map(c => c.competitorName))]
  const barData = competitors.map((name, i) => ({
    name, count: feed.filter(c => c.competitorName === name).length,
    color: COMP_COLORS[i % COMP_COLORS.length],
  })).sort((a, b) => b.count - a.count)

  const filtered = filter === 'all' ? feed : feed.filter(c => c.competitorName === filter)
  const topComp  = barData[0]

  return (
    <div>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '1.5px', color: '#F97316', marginBottom: 6,
        }}>◈ Competitor Intelligence</p>
        <h1 style={{
          fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
          fontSize: 34, letterSpacing: '-1px', lineHeight: 1.1,
          background: 'linear-gradient(135deg, #F5F0E8 40%, #F97316 80%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>Competitor Radar</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Public intelligence on your tracked rivals · <strong style={{ color: 'rgba(245,240,232,0.6)', fontWeight: 500 }}>Click any item to see full analysis</strong>
        </p>
      </div>

      {competitors.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '90px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 22,
        }}>
          <div style={{ fontSize: 56, marginBottom: 18, animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🎯</div>
          <p style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontWeight: 900, fontSize: 20, color: 'var(--text-secondary)', marginBottom: 8 }}>
            No competitors tracked yet
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Go to Settings → edit your profile to add competitor names
          </p>
        </div>
      ) : (
        <>
          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
            {/* Most active */}
            <div className="animate-fadeUp anim-d1" style={{
              background: 'linear-gradient(135deg, rgba(234,88,12,0.12) 0%, rgba(249,115,22,0.06) 100%)',
              border: '1px solid rgba(234,88,12,0.25)', borderRadius: 22, padding: '24px 26px',
              position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(234,88,12,0.5)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(234,88,12,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(234,88,12,0.25)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', pointerEvents: 'none',
              }} />
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#F97316', marginBottom: 12 }}>
                🏆 Most Active Competitor
              </div>
              {topComp ? (
                <>
                  <div style={{
                    fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
                    fontSize: 28, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.5px',
                  }}>{topComp.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <strong style={{ color: '#F97316', fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 18 }}>{topComp.count}</strong>
                    {' '}mentions in the last 30 days
                  </div>
                </>
              ) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data</div>}
            </div>

            {/* Bar chart */}
            <div className="animate-fadeUp anim-d2" style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 22, padding: '20px 22px', transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(234,88,12,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontWeight: 900, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>
                Weekly Mentions
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filter pills */}
          <div className="animate-fadeUp anim-d3" style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')} style={{
              padding: '6px 18px', borderRadius: 20, fontSize: 12,
              fontWeight: filter === 'all' ? 700 : 400,
              background: filter === 'all' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
              color: filter === 'all' ? '#F97316' : 'var(--text-muted)',
              border: filter === 'all' ? '1px solid rgba(249,115,22,0.35)' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.22s',
              boxShadow: filter === 'all' ? '0 0 12px rgba(249,115,22,0.2)' : 'none',
            }}>All competitors</button>

            {competitors.map((c, i) => {
              const color   = COMP_COLORS[i % COMP_COLORS.length]
              const isActive = filter === c
              return (
                <button key={c} onClick={() => setFilter(c)} style={{
                  padding: '6px 18px', borderRadius: 20, fontSize: 12,
                  fontWeight: isActive ? 700 : 400,
                  background: isActive ? `${color}22` : 'rgba(255,255,255,0.03)',
                  color: isActive ? color : 'var(--text-muted)',
                  border: `1px solid ${isActive ? `${color}55` : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.22s',
                  boxShadow: isActive ? `0 0 12px ${color}30` : 'none',
                }}>{c}</button>
              )
            })}
          </div>

          {/* Expandable timeline feed */}
          <div className="animate-fadeUp anim-d4" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {filtered.map((item, i) => {
              const ci    = competitors.indexOf(item.competitorName)
              const color = COMP_COLORS[ci % COMP_COLORS.length]
              return (
                <CompCard
                  key={item.id}
                  item={item}
                  i={i}
                  color={color}
                  totalLen={filtered.length}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

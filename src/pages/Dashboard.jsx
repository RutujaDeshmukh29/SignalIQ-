import React, { useState, useEffect, useCallback } from 'react'
import { loadProfile, loadSignals, loadDigest, loadWeights, loadCompFeed, weightToLabel, timeAgo, refreshSignals } from '../utils/dataStore'
import InsightCard from '../components/InsightCard'
import StatCard    from '../components/StatCard'
import DigestBox   from '../components/DigestBox'

function PulseDot({ active }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <span style={{
        width: 10, height: 10, borderRadius: '50%', display: 'block',
        background: active ? '#14B8A6' : 'rgba(255,255,255,0.15)',
        boxShadow: active ? '0 0 8px rgba(20,184,166,0.7)' : 'none',
      }} />
      {active && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: '#14B8A6', opacity: 0.35,
          animation: 'pulse-dot 1.8s ease-in-out infinite',
        }} />
      )}
    </span>
  )
}

function SectionHeader({ title, count, countColor = 'orange', subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--display)',
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: 18,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
        }}>{title}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: '3px 10px', borderRadius: 20,
            background: countColor === 'orange' ? 'rgba(249,115,22,0.15)' : 'rgba(244,63,94,0.15)',
            color: countColor === 'orange' ? '#F97316' : '#FB7185',
            border: countColor === 'orange' ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(244,63,94,0.25)',
            letterSpacing: '0.3px',
          }}>{count}</span>
        )}
      </div>
      {subtitle && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{subtitle}</span>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [signals, setSignals]     = useState([])
  const [digest, setDigest]       = useState(null)
  const [weights, setWeights]     = useState({})
  const [compFeed, setCompFeed]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const profile = loadProfile()

  const reload = useCallback(() => {
    setSignals(loadSignals())
    setDigest(loadDigest())
    setWeights(loadWeights())
    setCompFeed(loadCompFeed())
  }, [])

  useEffect(() => { reload() }, [reload, refreshKey])

  function handleRefresh() {
    setLoading(true)
    setTimeout(() => {
      refreshSignals()   // re-seed with fresh scores, actions, timestamps
      reload()
      setLoading(false)
    }, 1400)
  }

  const hotCount    = signals.filter(s => s.badge === 'hot').length
  const avgScore    = signals.length ? Math.round(signals.reduce((a, s) => a + s.finalScore, 0) / signals.length) : 0
  const activeComps = [...new Set(compFeed.filter(c => c.hoursAgo < 48).map(c => c.competitorName))].length

  const compLatest = {}
  compFeed.forEach(c => {
    if (!compLatest[c.competitorName] || c.hoursAgo < compLatest[c.competitorName].hoursAgo)
      compLatest[c.competitorName] = c
  })
  const compItems = Object.values(compLatest).sort((a, b) => a.hoursAgo - b.hoursAgo)

  const weightRows = Object.entries(weights).map(([kw, w]) => ({
    kw, w, label: weightToLabel(w),
    color: w >= 1.5 ? '#2DD4BF' : w >= 0.8 ? '#F97316' : 'rgba(255,255,255,0.25)',
  })).sort((a, b) => b.w - a.w)

  const firstName = profile?.name?.split(' ')[0] || ''

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="animate-fadeUp" style={{
        marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '1.5px',
            color: '#F97316', marginBottom: 6,
          }}>
            ◎ Intelligence Dashboard
          </p>
          <h1 style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 34,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            marginBottom: 8,
            background: 'linear-gradient(135deg, #F5F0E8 40%, #F97316 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {firstName ? `Welcome back, ${firstName}` : 'Market Intelligence'} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400, lineHeight: 1.5 }}>
            Here's what's moving in{' '}
            <strong style={{
              color: '#F97316',
              fontWeight: 700,
              fontFamily: 'var(--display)',
              fontStyle: 'italic',
            }}>{profile?.industry || 'your market'}</strong>
            {' '}right now
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="btn-primary"
          disabled={loading}
          style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
        >
          <span style={{
            display: 'inline-block',
            animation: loading ? 'spin 0.8s linear infinite' : 'none',
            fontSize: 15,
          }}>⟳</span>
          {loading ? 'Syncing signals…' : 'Refresh signals'}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="animate-fadeUp anim-d1" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <StatCard value={signals.length} label="Total signals tracked"  delta="3 new since yesterday" icon="📡" color="orange" delay={50}  />
        <StatCard value={avgScore}       label="Average trend score"    delta="8 pts this week"       icon="📊" color="teal"   delay={100} />
        <StatCard value={activeComps}    label="Competitors active"     delta={`${hotCount} hot signals`} icon="🎯" color="rose" delay={150} />
      </div>

      {/* ── AI Digest ── */}
      <div style={{ marginBottom: 24 }}>
        <DigestBox digest={digest} onRefresh={handleRefresh} loading={loading} />
      </div>

      {/* ── Two column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22 }}>

        {/* Left: Intelligence Feed */}
        <div>
          <SectionHeader
            title="Intelligence Feed"
            count={`${signals.length} signals`}
            subtitle="Ranked by score · updated daily"
          />

          {signals.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '70px 20px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <div style={{
                fontSize: 52, marginBottom: 16,
                animation: 'float 3s ease-in-out infinite',
                display: 'inline-block',
              }}>📡</div>
              <p style={{
                fontFamily: 'var(--display)', fontStyle: 'italic',
                fontWeight: 900, fontSize: 18,
                color: 'var(--text-secondary)', marginBottom: 8,
              }}>No signals yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Hit Refresh to pull your first intelligence feed
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {signals.map((s, i) => (
                <InsightCard
                  key={`${s.id}-${refreshKey}`}
                  signal={s}
                  animDelay={i * 55}
                  onFeedback={() => setRefreshKey(k => k + 1)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Competitor Radar */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '18px 20px',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(234,88,12,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
            }}>
              <span style={{
                fontFamily: 'var(--display)', fontStyle: 'italic',
                fontWeight: 900, fontSize: 15, color: 'var(--text-primary)',
              }}>🎯 Competitor Radar</span>
              {activeComps > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(244,63,94,0.15)',
                  color: '#FB7185',
                  border: '1px solid rgba(244,63,94,0.25)',
                }}>{activeComps} active</span>
              )}
            </div>

            {compItems.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                No competitors tracked — add them in Settings
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {compItems.map((c, i) => {
                  const active = c.hoursAgo < 48
                  return (
                    <div key={i} className="animate-fadeUp" style={{
                      animationDelay: `${i * 60}ms`,
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 12,
                      background: active
                        ? 'rgba(20,184,166,0.07)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.22s',
                    }}>
                      <PulseDot active={active} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: 12,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{c.competitorName}</div>
                        <div style={{
                          fontSize: 11, color: 'var(--text-muted)', marginTop: 2,
                        }}>{timeAgo(c.hoursAgo)} · {c.topic}</div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 20, flexShrink: 0,
                        background: active ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.06)',
                        color: active ? '#2DD4BF' : 'var(--text-muted)',
                        border: active ? '1px solid rgba(20,184,166,0.25)' : '1px solid rgba(255,255,255,0.08)',
                      }}>{active ? 'Active' : 'Quiet'}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Signal Tuning */}
          {weightRows.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              padding: '18px 20px',
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(234,88,12,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div style={{
                fontFamily: 'var(--display)', fontStyle: 'italic',
                fontWeight: 900, fontSize: 15,
                color: 'var(--text-primary)', marginBottom: 16,
              }}>🧠 Signal Tuning</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {weightRows.map(({ kw, w, label, color }) => (
                  <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, color: 'var(--text-primary)', fontWeight: 600,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        marginBottom: 4,
                      }}>{kw}</div>
                      <div style={{
                        height: 4, background: 'rgba(255,255,255,0.06)',
                        borderRadius: 3, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${color}, ${color}99)`,
                          borderRadius: 3,
                          width: `${(w / 2) * 100}%`,
                          transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                          boxShadow: `0 0 6px ${color}60`,
                        }} />
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color, flexShrink: 0,
                      letterSpacing: '0.3px',
                    }}>{label}</span>
                  </div>
                ))}
              </div>
              <p style={{
                fontSize: 11, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6,
                borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12,
              }}>
                Tap <strong style={{ color: '#2DD4BF' }}>Useful</strong> on cards to train your feed
              </p>
            </div>
          )}

          {/* Profile chip */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234,88,12,0.1) 0%, rgba(249,115,22,0.06) 100%)',
            border: '1px solid rgba(234,88,12,0.2)',
            borderRadius: 20,
            padding: '16px 18px',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(234,88,12,0.4)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(234,88,12,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(234,88,12,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{
              fontFamily: 'var(--display)', fontStyle: 'italic',
              fontWeight: 900, fontSize: 14,
              color: '#F97316', marginBottom: 12,
            }}>📋 Your Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Industry', val: profile?.industry },
                { label: 'Goal',     val: profile?.goal?.replace(/([A-Z])/g, ' $1').trim() },
                { label: 'Keywords', val: profile?.keywords?.join(', ') },
              ].map(r => r.val && (
                <div key={r.label}>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    color: 'var(--orange-400)', textTransform: 'uppercase',
                    letterSpacing: '1px', display: 'block', marginBottom: 2,
                  }}>{r.label}</span>
                  <p style={{
                    fontSize: 12, color: 'var(--text-secondary)',
                    lineHeight: 1.5, fontWeight: 500,
                  }}>{r.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

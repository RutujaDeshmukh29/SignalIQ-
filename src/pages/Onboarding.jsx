import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveProfile } from '../utils/dataStore'

const INDUSTRIES = ['AI/ML Services', 'D2C Brand', 'Manufacturing', 'Content Creator', 'Finance', 'Other']
const GOALS = [
  { id: 'updated',       label: 'Stay Updated',       desc: 'Daily pulse on what\'s moving in your market', icon: '📡' },
  { id: 'opportunities', label: 'Spot Opportunities',  desc: 'Find gaps before your competitors fill them',  icon: '🎯' },
  { id: 'competitors',   label: 'Track Competitors',   desc: 'Know exactly what rival brands are doing',     icon: '🔍' },
  { id: 'content',       label: 'Content Ideas',       desc: 'Turn trending signals into posts and pitches', icon: '✍️' },
]

const STEP_INFO = [
  { label: 'Profile',     icon: '👤', desc: 'Who are you?' },
  { label: 'Keywords',    icon: '🏷', desc: 'What to track?' },
  { label: 'Competitors', icon: '◈',  desc: 'Who to watch?' },
  { label: 'Goal',        icon: '🚀', desc: 'What\'s your aim?' },
]

// Animated floating particle
function Particle({ style }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', ...style }} />
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(1)
  const [form, setForm]           = useState({ name: '', industry: '', keywords: [], competitors: [], goal: '' })
  const [kwInput, setKwInput]     = useState('')
  const [compInput, setCompInput] = useState('')
  const [leaving, setLeaving]     = useState(false)
  const [time, setTime]           = useState(0)

  // Animate particles
  useEffect(() => {
    const iv = setInterval(() => setTime(t => t + 1), 50)
    return () => clearInterval(iv)
  }, [])

  function addTag(field, val, setter) {
    const v = val.trim()
    if (!v || form[field].includes(v) || form[field].length >= 5) return
    setForm(f => ({ ...f, [field]: [...f[field], v] }))
    setter('')
  }
  function removeTag(field, idx) {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }))
  }

  function next() {
    if (step < 4) { setLeaving(true); setTimeout(() => { setStep(s => s + 1); setLeaving(false) }, 220) }
    else finish()
  }
  function back() { setLeaving(true); setTimeout(() => { setStep(s => s - 1); setLeaving(false) }, 220) }

  function finish() {
    saveProfile({ ...form, createdAt: new Date().toISOString() })
    navigate('/dashboard')
  }

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.industry
    if (step === 2) return form.keywords.length >= 1
    if (step === 3) return true
    if (step === 4) return !!form.goal
    return true
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0A0805',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Global ambient particles */}
      {[
        { width: 300, height: 300, top: '10%', left: '30%', background: 'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)', animation: 'orb-float 10s ease-in-out infinite' },
        { width: 200, height: 200, bottom: '20%', right: '20%', background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)', animation: 'orb-float 14s ease-in-out infinite reverse' },
        { width: 150, height: 150, top: '60%', left: '20%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', animation: 'orb-float 8s ease-in-out infinite 2s' },
      ].map((p, i) => <Particle key={i} style={p} />)}

      {/* ══ LEFT PANEL ══ */}
      <div style={{
        width: 360,
        flexShrink: 0,
        background: 'linear-gradient(170deg, rgba(234,88,12,0.18) 0%, rgba(196,64,9,0.12) 40%, rgba(10,8,5,0.95) 100%)',
        borderRight: '1px solid rgba(234,88,12,0.15)',
        padding: '48px 36px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background radial */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top content */}
        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(249,115,22,0.5)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
              }} />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" fill="white" />
                <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="1.2" fill="none" strokeDasharray="3.5 2.5" />
                <circle cx="10" cy="10" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" strokeDasharray="2 3" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--display)',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 22,
              color: '#F5F0E8',
              letterSpacing: '-0.5px',
            }}>SignalIQ</span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 32,
            lineHeight: 1.2,
            marginBottom: 14,
            color: '#F5F0E8',
            letterSpacing: '-0.5px',
          }}>
            Know what's moving<br />
            <span style={{
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>before your<br />competition does.</span>
          </h2>
          <p style={{
            color: 'rgba(245,240,232,0.55)',
            fontSize: 13.5, lineHeight: 1.7, fontWeight: 400,
          }}>
            Set up your intelligence radar in under 2 minutes. No code. No complexity.
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
          <p style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '1.5px',
            textTransform: 'uppercase', color: 'rgba(249,115,22,0.6)',
            marginBottom: 4,
          }}>Setup Progress</p>

          {STEP_INFO.map((s, i) => {
            const done    = step > i + 1
            const current = step === i + 1
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: done || current ? 1 : 0.35,
                transition: 'opacity 0.35s, transform 0.35s',
                transform: current ? 'translateX(4px)' : 'none',
              }}>
                {/* Circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: done
                    ? 'rgba(20,184,166,0.2)'
                    : current
                    ? 'linear-gradient(135deg, #F97316, #EA580C)'
                    : 'rgba(255,255,255,0.07)',
                  border: done
                    ? '1px solid rgba(20,184,166,0.4)'
                    : current
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: done ? 14 : 15,
                  color: done ? '#2DD4BF' : '#fff',
                  boxShadow: current ? '0 4px 16px rgba(249,115,22,0.45)' : 'none',
                  transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
                }}>
                  {done ? '✓' : s.icon}
                </div>
                <div>
                  <div style={{
                    color: current ? '#F5F0E8' : done ? '#2DD4BF' : 'rgba(245,240,232,0.6)',
                    fontSize: 13.5, fontWeight: current ? 800 : 500,
                    fontFamily: current ? 'var(--display)' : 'var(--font)',
                    fontStyle: current ? 'italic' : 'normal',
                    transition: 'all 0.35s',
                  }}>
                    Step {i + 1} — {s.label}
                  </div>
                  {current && (
                    <div style={{
                      color: 'rgba(249,115,22,0.7)', fontSize: 11,
                      marginTop: 2, fontWeight: 500,
                    }}>{s.desc}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══ RIGHT: Form panel ══ */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 56px',
        position: 'relative',
      }}>
        {/* Form card */}
        <div style={{
          width: '100%', maxWidth: 480,
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateX(20px)' : 'none',
          transition: 'opacity 0.22s, transform 0.22s',
        }}>
          {/* Progress bar */}
          <div style={{
            height: 3, background: 'rgba(255,255,255,0.06)',
            borderRadius: 3, marginBottom: 40, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #F97316, #EA580C)',
              borderRadius: 3,
              width: `${(step / 4) * 100}%`,
              transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: '0 0 12px rgba(249,115,22,0.6)',
            }} />
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div>
              <p style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '1.5px', color: '#F97316', marginBottom: 8,
              }}>Step 1 of 4</p>
              <h2 style={{
                fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
                fontSize: 30, letterSpacing: '-0.5px', marginBottom: 6,
                color: '#F5F0E8',
              }}>Tell us about yourself</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 30, lineHeight: 1.6 }}>
                This lets SignalIQ tailor signals to your exact market.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
                  display: 'block', marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                }}>Your Name</label>
                <input
                  placeholder="e.g. Rutuja Deshmukh"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && canNext() && next()}
                  autoFocus
                />
              </div>

              <div>
                <label style={{
                  fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
                  display: 'block', marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                }}>Industry / Niche</label>
                <div style={{ position: 'relative' }}>
                  <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                    <option value="">Choose your industry</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                  <span style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 12,
                  }}>▼</span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div>
              <p style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '1.5px', color: '#F97316', marginBottom: 8,
              }}>Step 2 of 4</p>
              <h2 style={{
                fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
                fontSize: 30, letterSpacing: '-0.5px', marginBottom: 6, color: '#F5F0E8',
              }}>What should we track?</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 30, lineHeight: 1.6 }}>
                Add up to 5 keywords. Press <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 6px', borderRadius: 4, fontSize: 11, color: 'var(--text-secondary)' }}>Enter</kbd> after each.
              </p>

              <div style={{
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                minHeight: 100,
                display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start',
                transition: 'border-color 0.22s',
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                {form.keywords.map((kw, i) => (
                  <span key={i} style={{
                    background: 'rgba(249,115,22,0.15)',
                    color: '#F97316',
                    border: '1px solid rgba(249,115,22,0.3)',
                    borderRadius: 20, padding: '6px 14px',
                    fontSize: 12.5, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 0 8px rgba(249,115,22,0.15)',
                  }}>
                    🏷 {kw}
                    <button onClick={() => removeTag('keywords', i)} style={{
                      color: '#F97316', opacity: 0.6, fontSize: 15, lineHeight: 1,
                    }}>×</button>
                  </span>
                ))}
                {form.keywords.length < 5 && (
                  <input
                    value={kwInput}
                    onChange={e => setKwInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag('keywords', kwInput, setKwInput) } }}
                    placeholder={form.keywords.length === 0 ? 'Type a keyword and press Enter…' : 'Add more…'}
                    style={{
                      border: 'none', background: 'transparent', outline: 'none',
                      fontSize: 13, flex: 1, minWidth: 160, padding: '6px 2px',
                      color: 'var(--text-primary)',
                    }}
                  />
                )}
              </div>

              <p style={{
                fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6,
                background: 'rgba(249,115,22,0.05)',
                border: '1px solid rgba(249,115,22,0.12)',
                borderRadius: 10, padding: '8px 12px',
              }}>
                💡 Try: <span style={{ color: '#F97316' }}>"AI agents"</span>, <span style={{ color: '#F97316' }}>"RAG pipelines"</span>, <span style={{ color: '#F97316' }}>"n8n"</span>, <span style={{ color: '#F97316' }}>"LangChain"</span>
              </p>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <p style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '1.5px', color: '#F97316', marginBottom: 8,
              }}>Step 3 of 4</p>
              <h2 style={{
                fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
                fontSize: 30, letterSpacing: '-0.5px', marginBottom: 6, color: '#F5F0E8',
              }}>Who are your rivals?</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 30, lineHeight: 1.6 }}>
                Add up to 5 competitor names. You can skip this and add them later in Settings.
              </p>

              <div style={{
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                minHeight: 100,
                display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start',
                transition: 'border-color 0.22s',
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                {form.competitors.map((c, i) => (
                  <span key={i} style={{
                    background: 'rgba(139,92,246,0.15)',
                    color: '#A78BFA',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 20, padding: '6px 14px',
                    fontSize: 12.5, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 0 8px rgba(139,92,246,0.15)',
                  }}>
                    ◈ {c}
                    <button onClick={() => removeTag('competitors', i)} style={{
                      color: '#A78BFA', opacity: 0.6, fontSize: 15, lineHeight: 1,
                    }}>×</button>
                  </span>
                ))}
                {form.competitors.length < 5 && (
                  <input
                    value={compInput}
                    onChange={e => setCompInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag('competitors', compInput, setCompInput) } }}
                    placeholder={form.competitors.length === 0 ? 'Type a competitor name and press Enter…' : 'Add more…'}
                    style={{
                      border: 'none', background: 'transparent', outline: 'none',
                      fontSize: 13, flex: 1, minWidth: 160, padding: '6px 2px',
                      color: 'var(--text-primary)',
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div>
              <p style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '1.5px', color: '#F97316', marginBottom: 8,
              }}>Step 4 of 4</p>
              <h2 style={{
                fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
                fontSize: 30, letterSpacing: '-0.5px', marginBottom: 6, color: '#F5F0E8',
              }}>What's your main goal?</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 26, lineHeight: 1.6 }}>
                This shapes the action suggestions on every insight card.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOALS.map(g => {
                  const selected = form.goal === g.id
                  return (
                    <div key={g.id} onClick={() => setForm(f => ({ ...f, goal: g.id }))} style={{
                      padding: '16px 18px',
                      borderRadius: 16,
                      cursor: 'pointer',
                      border: `1.5px solid ${selected ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      background: selected
                        ? 'rgba(249,115,22,0.1)'
                        : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                      transform: selected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: selected ? '0 4px 20px rgba(249,115,22,0.15), 0 0 0 1px rgba(249,115,22,0.1)' : 'none',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: selected ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                        border: selected ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, transition: 'all 0.25s',
                        boxShadow: selected ? '0 0 12px rgba(249,115,22,0.3)' : 'none',
                        flexShrink: 0,
                      }}>{g.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 800, fontSize: 14,
                          color: selected ? '#F5F0E8' : 'var(--text-secondary)',
                          fontFamily: selected ? 'var(--display)' : 'var(--font)',
                          fontStyle: selected ? 'italic' : 'normal',
                          transition: 'all 0.25s',
                          marginBottom: 2,
                        }}>{g.label}</div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
                        }}>{g.desc}</div>
                      </div>
                      {selected && (
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #F97316, #EA580C)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 11, fontWeight: 900, flexShrink: 0,
                          boxShadow: '0 0 10px rgba(249,115,22,0.5)',
                          animation: 'countUp 0.3s ease both',
                        }}>✓</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36,
          }}>
            {step > 1 ? (
              <button onClick={back} className="btn-ghost" style={{ padding: '10px 22px' }}>
                ← Back
              </button>
            ) : <div />}

            <button
              onClick={next}
              disabled={!canNext()}
              className="btn-primary"
              style={{
                opacity: canNext() ? 1 : 0.4,
                cursor: canNext() ? 'pointer' : 'not-allowed',
                padding: '12px 32px',
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.2px',
              }}
            >
              {step === 4 ? '🚀 Launch my radar' : 'Continue →'}
            </button>
          </div>

          {step === 3 && (
            <p style={{
              textAlign: 'center', marginTop: 16,
              fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              Don't have competitors yet?{' '}
              <span style={{ color: '#F97316', cursor: 'pointer', fontWeight: 600 }} onClick={next}>
                Skip for now →
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

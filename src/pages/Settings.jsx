import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfile, saveProfile, clearAll } from '../utils/dataStore'

const INDUSTRIES = ['AI/ML Services', 'D2C Brand', 'Manufacturing', 'Content Creator', 'Finance', 'Other']
const GOALS = ['updated', 'opportunities', 'competitors', 'content']
const GOAL_LABELS = {
  updated:       'Stay updated',
  opportunities: 'Spot opportunities',
  competitors:   'Track competitors',
  content:       'Content ideas',
}

// ── TagInput — standalone component outside Settings so hooks are stable ──
function TagInput({ form, field, inputVal, setInputVal, color = 'orange', placeholder, addTag, removeTag }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const tagColor    = color === 'orange' ? '#F97316'               : '#A78BFA'
  const tagBg       = color === 'orange' ? 'rgba(249,115,22,0.15)' : 'rgba(139,92,246,0.15)'
  const tagBorder   = color === 'orange' ? 'rgba(249,115,22,0.3)'  : 'rgba(139,92,246,0.3)'
  const focusBorder = color === 'orange' ? 'rgba(234,88,12,0.55)'  : 'rgba(139,92,246,0.55)'
  const glowColor   = color === 'orange'
    ? '0 0 0 3px rgba(234,88,12,0.12), 0 0 16px rgba(234,88,12,0.1)'
    : '0 0 0 3px rgba(139,92,246,0.12), 0 0 16px rgba(139,92,246,0.1)'

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        border: `1.5px solid ${focused ? focusBorder : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 14,
        padding: '12px 14px',
        background: focused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        minHeight: 80,
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start',
        cursor: 'text',
        transition: 'border-color 0.22s, background 0.22s, box-shadow 0.22s',
        boxShadow: focused ? glowColor : 'none',
      }}
    >
      {/* Existing tags */}
      {form[field].map((tag, i) => (
        <span key={i} style={{
          background: tagBg,
          color: tagColor,
          border: `1px solid ${tagBorder}`,
          borderRadius: 20,
          padding: '5px 13px',
          fontSize: 12.5, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
          userSelect: 'none',
          boxShadow: `0 0 8px ${tagColor}20`,
        }}>
          {tag}
          <button
            onMouseDown={e => {
              // Use mousedown so we prevent the wrapper's onClick re-focus
              // from interfering with removal
              e.preventDefault()
              e.stopPropagation()
              removeTag(field, i)
            }}
            style={{
              color: tagColor, opacity: 0.6,
              fontSize: 16, lineHeight: 1, fontWeight: 700,
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '0 2px',
              transition: 'opacity 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          >×</button>
        </span>
      ))}

      {/* Actual text input */}
      {form[field].length < 5 ? (
        <input
          ref={inputRef}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addTag(field, inputVal, setInputVal)
            }
            // Backspace on empty input removes last tag
            if (e.key === 'Backspace' && inputVal === '' && form[field].length > 0) {
              removeTag(field, form[field].length - 1)
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={form[field].length === 0 ? placeholder : 'Add another…'}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 13,
            flex: '1 1 140px',
            minWidth: 140,
            padding: '5px 2px',
            color: 'var(--text-primary)',
            caretColor: tagColor,
          }}
        />
      ) : (
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          alignSelf: 'center', paddingLeft: 4,
          fontStyle: 'italic', opacity: 0.7,
        }}>
          Max 5 reached — remove one to add more
        </span>
      )}
    </div>
  )
}

// ── Main Settings page ──
export default function Settings() {
  const navigate = useNavigate()
  const [form, setForm]               = useState({ name: '', industry: '', keywords: [], competitors: [], goal: '' })
  const [kwInput, setKwInput]         = useState('')
  const [coInput, setCoInput]         = useState('')
  const [saved, setSaved]             = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)

  useEffect(() => {
    const p = loadProfile()
    if (p) setForm({
      name:        p.name        || '',
      industry:    p.industry    || '',
      keywords:    p.keywords    || [],
      competitors: p.competitors || [],
      goal:        p.goal        || '',
    })
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

  async function handleSave() {
    await saveProfile({ ...form, updatedAt: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return }
    clearAll()
    navigate('/setup')
  }

  const sections = [
    {
      id: 'profile', icon: '👤', title: 'Your Profile',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              display: 'block', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div>
            <label style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              display: 'block', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>Industry</label>
            <div style={{ position: 'relative' }}>
              <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
              <span style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 12,
              }}>▼</span>
            </div>
          </div>
          <div>
            <label style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              display: 'block', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>Tracking Goal</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {GOALS.map(g => (
                <button key={g} onClick={() => setForm(f => ({ ...f, goal: g }))} style={{
                  padding: '8px 18px', borderRadius: 10, fontSize: 12.5,
                  fontWeight: form.goal === g ? 700 : 400,
                  border: `1.5px solid ${form.goal === g ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  background: form.goal === g ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)',
                  color: form.goal === g ? '#F97316' : 'var(--text-secondary)',
                  transition: 'all 0.22s',
                  boxShadow: form.goal === g ? '0 0 12px rgba(249,115,22,0.2)' : 'none',
                }}>{GOAL_LABELS[g]}</button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'keywords', icon: '🏷', title: 'Tracked Keywords',
      content: (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
            Up to 5 keywords. Press{' '}
            <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 7px', borderRadius: 5, fontSize: 11, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>Enter</kbd>
            {' '}or{' '}
            <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 7px', borderRadius: 5, fontSize: 11, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>,</kbd>
            {' '}to add. Backspace removes the last tag.
          </p>
          <TagInput
            form={form}
            field="keywords"
            inputVal={kwInput}
            setInputVal={setKwInput}
            color="orange"
            placeholder="Type a keyword and press Enter…"
            addTag={addTag}
            removeTag={removeTag}
          />
        </div>
      ),
    },
    {
      id: 'competitors', icon: '🎯', title: 'Competitors to Watch',
      content: (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
            Up to 5 competitor names. Press{' '}
            <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 7px', borderRadius: 5, fontSize: 11, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>Enter</kbd>
            {' '}or{' '}
            <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 7px', borderRadius: 5, fontSize: 11, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>,</kbd>
            {' '}to add.
          </p>
          <TagInput
            form={form}
            field="competitors"
            inputVal={coInput}
            setInputVal={setCoInput}
            color="violet"
            placeholder="Type a competitor name and press Enter…"
            addTag={addTag}
            removeTag={removeTag}
          />
        </div>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 30 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '1.5px', color: '#F97316', marginBottom: 6,
        }}>⊙ Configuration</p>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 900, fontStyle: 'italic',
          fontSize: 34, letterSpacing: '-1px', lineHeight: 1.1,
          background: 'linear-gradient(135deg, #F5F0E8 40%, #F97316 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
        }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Update your profile — changes retune your signal feed
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, i) => (
        <div key={section.id} className="animate-fadeUp" style={{
          animationDelay: `${i * 70}ms`,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: '22px 24px',
          marginBottom: 14,
          transition: 'border-color 0.3s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(234,88,12,0.25)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>{section.icon}</div>
            <span style={{
              fontFamily: 'var(--display)', fontStyle: 'italic',
              fontWeight: 900, fontSize: 17, color: 'var(--text-primary)',
              letterSpacing: '-0.2px',
            }}>{section.title}</span>
          </div>
          {section.content}
        </div>
      ))}

      {/* Save button */}
      <div className="animate-fadeUp anim-d4" style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32,
      }}>
        <button onClick={handleSave} className="btn-primary" style={{
          padding: '12px 32px', fontSize: 14, fontWeight: 700,
        }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
        {saved && (
          <span className="animate-fadeIn" style={{
            fontSize: 13, color: '#2DD4BF', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(20,184,166,0.15)',
              border: '1px solid rgba(20,184,166,0.3)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
            }}>✓</span>
            Signal feed updated
          </span>
        )}
      </div>

      {/* Danger zone */}
      <div className="animate-fadeUp anim-d5" style={{
        border: '1px solid rgba(244,63,94,0.2)',
        borderRadius: 20,
        padding: '20px 22px',
        background: 'rgba(244,63,94,0.04)',
        transition: 'border-color 0.3s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>⚠️</div>
          <span style={{
            fontFamily: 'var(--display)', fontStyle: 'italic',
            fontWeight: 900, fontSize: 16, color: '#FB7185',
          }}>Reset Account</span>
        </div>
        <p style={{
          fontSize: 12.5, color: 'rgba(251,113,133,0.75)',
          marginBottom: 16, lineHeight: 1.6,
        }}>
          This clears all your data, preferences, and feedback history. You'll restart the setup flow.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleReset} style={{
            padding: '8px 22px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
            border: '1.5px solid rgba(244,63,94,0.4)',
            background: resetConfirm ? 'rgba(244,63,94,0.25)' : 'transparent',
            color: '#FB7185',
            transition: 'all 0.22s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.12)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(244,63,94,0.2)' }}
            onMouseLeave={e => { if (!resetConfirm) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {resetConfirm ? '⚠️ Click again to confirm reset' : 'Reset all data'}
          </button>
          {resetConfirm && (
            <button onClick={() => setResetConfirm(false)} style={{
              fontSize: 12, color: 'var(--text-muted)', fontWeight: 500,
              transition: 'color 0.18s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >Cancel</button>
          )}
        </div>
      </div>
    </div>
  )
}

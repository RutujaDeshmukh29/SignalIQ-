import React, { useState } from 'react'

export default function DigestBox({ digest, onRefresh, loading }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="animate-fadeUp anim-d2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(234,88,12,0.12) 0%, rgba(249,115,22,0.07) 50%, rgba(196,64,9,0.10) 100%)'
          : 'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, rgba(249,115,22,0.04) 50%, rgba(10,8,5,0.8) 100%)',
        border: `1px solid ${hovered ? 'rgba(249,115,22,0.4)' : 'rgba(249,115,22,0.2)'}`,
        borderRadius: 22,
        padding: '24px 28px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: hovered
          ? '0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(234,88,12,0.15)'
          : '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Decorative glowing orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        transition: 'opacity 0.35s',
        opacity: hovered ? 1 : 0.5,
      }} />

      {/* Bottom-left subtle orb */}
      <div style={{
        position: 'absolute', bottom: -30, left: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Shimmer top edge */}
      <div style={{
        position: 'absolute', top: 0, left: '10%',
        width: '80%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)',
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.35s',
      }} />

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            boxShadow: '0 4px 14px rgba(249,115,22,0.45)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}>✨</div>

          <div>
            <span style={{
              fontFamily: 'var(--display)',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 17,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
              display: 'block',
              lineHeight: 1,
            }}>
              AI Weekly Digest
            </span>
            <span style={{
              fontSize: 10, color: 'var(--text-muted)',
              letterSpacing: '0.3px', fontWeight: 500,
            }}>
              Personalized market intelligence
            </span>
          </div>

          {/* LIVE badge */}
          <span style={{
            fontSize: 10, fontWeight: 800,
            padding: '4px 10px', borderRadius: 20,
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            color: '#fff',
            letterSpacing: '1px',
            boxShadow: '0 2px 10px rgba(249,115,22,0.45)',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}>LIVE</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-ghost"
          style={{ fontSize: 12, padding: '7px 16px' }}
        >
          {loading ? (
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block', fontSize: 13 }}>⟳</span>
              Refreshing…
            </span>
          ) : '↺ Refresh'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {[80, 60, 40].map((w, i) => (
            <div key={i} style={{
              height: 14,
              marginBottom: 8,
              width: `${w}%`,
              borderRadius: 8,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(249,115,22,0.08) 50%, rgba(255,255,255,0.04) 100%)',
              backgroundSize: '600px 100%',
              animation: `shimmer 1.6s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      ) : (
        <p style={{
          fontSize: 14.5,
          color: 'rgba(245,240,232,0.85)',
          lineHeight: 1.8,
          fontStyle: 'italic',
          fontFamily: 'var(--display)',
          fontWeight: 700,
          position: 'relative',
          letterSpacing: '-0.1px',
        }}>
          <span style={{ fontSize: 24, color: 'var(--orange-400)', lineHeight: 0.5, verticalAlign: 'middle', marginRight: 4 }}>"</span>
          {digest?.text || 'Your personalized digest will appear here after first data sync.'}
          <span style={{ fontSize: 24, color: 'var(--orange-400)', lineHeight: 0.5, verticalAlign: 'middle', marginLeft: 4 }}>"</span>
        </p>
      )}

      {digest?.generatedAt && (
        <p style={{
          fontSize: 11, color: 'var(--text-muted)',
          marginTop: 14, opacity: 0.7,
          fontWeight: 500,
        }}>
          ⏱ Generated {new Date(digest.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

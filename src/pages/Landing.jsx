import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProfile } from '../utils/dataStore'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled]   = useState(false)
  const [mousePos, setMousePos]   = useState({ x: 0, y: 0 })

  useEffect(() => {
    // If user already has a profile, we don't necessarily force them away from landing, 
    // but the Get Started button will route to dashboard instead of setup.
    const handleScroll = () => setScrolled(window.scrollY > 50)
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  function handleGetStarted() {
    if (loadProfile()) navigate('/dashboard')
    else navigate('/setup')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0805',
      overflowX: 'hidden',
      position: 'relative',
      fontFamily: 'var(--font)',
      color: '#F5F0E8',
    }}>
      {/* Dynamic Mesh Gradient Background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'fixed', top: '20%', left: '10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 60%)',
        pointerEvents: 'none', filter: 'blur(80px)', zIndex: 0,
        transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        transition: 'transform 0.2s ease-out',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '10%', width: '30vw', height: '30vw',
        background: 'radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 60%)',
        pointerEvents: 'none', filter: 'blur(80px)', zIndex: 0,
        transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`,
        transition: 'transform 0.2s ease-out',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: scrolled ? 'rgba(10,8,5,0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3.5" fill="white" />
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="1.2" fill="none" strokeDasharray="3.5 2.5" />
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
            fontSize: 22, color: '#F5F0E8', letterSpacing: '-0.5px',
          }}>SignalIQ</span>
        </div>
        <button
          onClick={handleGetStarted}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#F5F0E8', padding: '10px 28px', borderRadius: 24,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.15)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
        >
          {loadProfile() ? 'Go to Dashboard' : 'Get Started'}
        </button>
      </nav>

      {/* Hero Section */}
      <main style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1200, margin: '0 auto',
        padding: '160px 24px 80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div className="animate-fadeUp" style={{ animationDelay: '0ms' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.25)',
            padding: '8px 20px', borderRadius: 30,
            marginBottom: 32,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316', boxShadow: '0 0 10px #F97316', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#F97316' }}>
              Intelligence V2 is Live
            </span>
          </div>
        </div>
        
        <h1 className="animate-fadeUp" style={{
          animationDelay: '100ms',
          fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
          fontSize: 'clamp(48px, 6vw, 84px)', letterSpacing: '-2.5px', lineHeight: 1.05,
          color: '#F5F0E8', marginBottom: 28, maxWidth: 900,
        }}>
          Know what's moving before <br />
          <span style={{
            background: 'linear-gradient(135deg, #F97316 20%, #EA580C 60%, #FB923C 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>your competition does.</span>
        </h1>
        
        <p className="animate-fadeUp" style={{
          animationDelay: '200ms',
          fontSize: 20, color: 'var(--text-secondary)', lineHeight: 1.6,
          maxWidth: 680, margin: '0 auto 48px', fontWeight: 400,
        }}>
          SignalIQ scans thousands of news outlets, community forums, and competitor blogs to distill market noise into <strong style={{ color: '#F5F0E8' }}>concrete, strategic actions</strong> for your business.
        </p>
        
        <div className="animate-fadeUp" style={{ animationDelay: '300ms', display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={handleGetStarted}
            className="btn-primary"
            style={{
              padding: '18px 48px', fontSize: 16, fontWeight: 800, borderRadius: 30,
              boxShadow: '0 12px 32px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Start Analyzing Free
          </button>
          <a href="#how-it-works" style={{
            padding: '18px 32px', fontSize: 16, fontWeight: 700, borderRadius: 30,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#F5F0E8', textDecoration: 'none', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            See how it works ↓
          </a>
        </div>
      </main>

      {/* Floating Mockup Preview */}
      <div className="animate-fadeUp" style={{
        animationDelay: '400ms',
        position: 'relative', zIndex: 10,
        maxWidth: 900, margin: '0 auto 140px',
        padding: '0 24px',
        perspective: '1000px',
      }}>
        <div style={{
          background: 'rgba(22,18,16,0.8)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(249,115,22,0.1)',
          backdropFilter: 'blur(20px)',
          transform: `rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)`,
          transition: 'transform 0.1s ease-out',
        }}>
          {/* Fake Window Controls */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EAB308' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
          </div>
          
          {/* Fake Insight Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 20, bottom: 20, width: 4, background: '#F97316', borderRadius: '0 4px 4px 0', boxShadow: '0 0 12px #F97316' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#F5F0E8', fontFamily: 'var(--display)', fontStyle: 'italic' }}>
                Competitor ACME just launched AI automated workflows
              </p>
              <span style={{ background: 'rgba(244,63,94,0.15)', color: '#FB7185', border: '1px solid rgba(244,63,94,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>🔥 HOT SIGNAL</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📰 TechCrunch</span>
              <span style={{ fontSize: 12, color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '2px 10px', borderRadius: 12 }}>🏷 AI workflows</span>
            </div>
            <div style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', padding: '16px', borderRadius: 12, display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🧠</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Action Recommended</p>
                <p style={{ fontSize: 14, color: '#5EEAD4', lineHeight: 1.5, fontWeight: 500 }}>Audit your current feature roadmap. ACME's launch threatens your mid-market segment. Expedite the beta release of your own automation engine.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" style={{
        padding: '120px 24px', background: 'rgba(0,0,0,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic', fontSize: 42, marginBottom: 16 }}>How SignalIQ Works</h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>From raw noise to strategic execution in three automated steps.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { num: '01', title: 'We Track the Web', desc: 'You tell us your industry, keywords, and competitors. Our engine constantly monitors news, Reddit, HackerNews, and PR wires.' },
              { num: '02', title: 'AI Scores Momentum', desc: 'We don\'t just list articles. Our proprietary algorithm scores signals based on recency, velocity, and relevance to your specific niche.' },
              { num: '03', title: 'You Get Action Plans', desc: 'Instead of spending hours reading, you get an executive digest summarizing the market and offering concrete "What to do next" tips.' }
            ].map((step, i) => (
              <div key={i} style={{
                position: 'relative', padding: '40px 32px',
                background: 'rgba(255,255,255,0.02)', borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  position: 'absolute', top: -20, left: 32,
                  fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic',
                  fontSize: 64, color: 'rgba(255,255,255,0.05)', lineHeight: 1,
                }}>{step.num}</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#F97316', position: 'relative', zIndex: 2 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature deep dive */}
      <section style={{ padding: '140px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 60, marginBottom: 120 }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic', fontSize: 36, marginBottom: 20 }}>Track Competitor Moves Instantly</h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              The moment a rival changes pricing, launches a feature, or starts a hiring spree, SignalIQ catches it. We instantly classify the sentiment as a <strong>Threat</strong> or <strong>Opportunity</strong>.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><span style={{ color: '#F97316' }}>✓</span> Automated PR & News monitoring</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><span style={{ color: '#F97316' }}>✓</span> Hiring & expansion detection</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}><span style={{ color: '#F97316' }}>✓</span> Feature launch sentiment analysis</li>
            </ul>
          </div>
          <div style={{ flex: '1 1 400px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 24, padding: 40, position: 'relative' }}>
             <div style={{ position: 'absolute', top: -10, right: -10, width: 100, height: 100, background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}/>
             <div style={{ background: 'rgba(22,18,16,0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: 20, borderRadius: 16, marginBottom: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                 <strong style={{ fontSize: 15 }}>Stripe — New Pricing</strong>
                 <span style={{ fontSize: 11, background: 'rgba(244,63,94,0.15)', color: '#FB7185', padding: '2px 8px', borderRadius: 12 }}>⚠️ Threat</span>
               </div>
               <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'var(--display)' }}>Stripe announced a revised pricing structure introducing a usage-based tier...</p>
             </div>
             <div style={{ background: 'rgba(22,18,16,0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: 20, borderRadius: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                 <strong style={{ fontSize: 15 }}>Paddle — Hiring Spree</strong>
                 <span style={{ fontSize: 11, background: 'rgba(20,184,166,0.15)', color: '#2DD4BF', padding: '2px 8px', borderRadius: 12 }}>🎯 Opportunity</span>
               </div>
               <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'var(--display)' }}>Paddle posted 23 new job openings in the past 30 days...</p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '120px 24px', background: 'linear-gradient(180deg, transparent 0%, rgba(249,115,22,0.05) 100%)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 900, fontStyle: 'italic', fontSize: 48, marginBottom: 24 }}>Ready to outsmart the market?</h2>
        <p style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Join thousands of founders and strategists using SignalIQ to stay ahead.
        </p>
        <button
          onClick={handleGetStarted}
          className="btn-primary"
          style={{
            padding: '20px 56px', fontSize: 18, fontWeight: 800, borderRadius: 40,
            boxShadow: '0 16px 48px rgba(249,115,22,0.4)',
          }}
        >
          {loadProfile() ? 'Go to Dashboard' : 'Create Free Account'}
        </button>
      </section>
    </div>
  )
}

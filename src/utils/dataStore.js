// ─── SignalIQ Live Data Store ───────────────────────────────────────────────
// Uses GNews, HackerNews, and Reddit APIs to fetch live signals.

const STORAGE_KEYS = {
  PROFILE:   'siq_profile',
  SIGNALS:   'siq_signals',
  FEEDBACK:  'siq_feedback',
  DIGEST:    'siq_digest',
  COMP_FEED: 'siq_comp_feed',
  WEIGHTS:   'siq_weights',
  RAW_SIGS:  'siq_raw_signals',
  LAST_FETCH:'siq_last_fetch'
}

const ACTION_MAP = {
  hot: [
    'Add this skill/topic to your profile and first paragraph of outreach messages this week',
    'Create content around this topic immediately — high engagement window is now',
    'Pitch this trend specifically to 5 decision-makers today while it\'s still rising',
    'Update your service listing to mention this trend directly',
  ],
  rising: [
    'Start building expertise here now — you have a 2-week head start on most competitors',
    'Write a LinkedIn post on this today — low competition, rising interest',
    'Reach out to 3 potential clients in this specific niche while demand is building',
    'Add this to your keyword targeting on job platforms',
  ],
  watch: [
    'Monitor this weekly — if it continues rising, move it to active strategy next week',
    'Save this for content planning — it may be your next strong topic',
    'Check if competitors are already moving here; if not, you have a positioning gap',
    'Low urgency now, but worth a 15-min deep dive this weekend',
  ],
}

function getAction(badge) {
  const arr = ACTION_MAP[badge]
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Live API Refresh ────────────────────────────────────────────────────────
export async function refreshSignals(force = false) {
  const profile = loadProfile()
  if (!profile) return

  const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH)
  // Auto-refresh every 12 hours (12 * 60 * 60 * 1000)
  if (!force && lastFetch && Date.now() - parseInt(lastFetch) < 43200000) {
    return 
  }

  const queries = profile.keywords && profile.keywords.length > 0 ? profile.keywords : [profile.industry]
  let allSignals = []
  const gnewsKey = import.meta.env.VITE_GNEWS_API_KEY

  for (const q of queries) {
    // 1. GNews (News)
    if (gnewsKey) {
      try {
        const gnRes = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&apikey=${gnewsKey}&lang=en&max=5`)
        const gnData = await gnRes.json()
        if (gnData.articles) {
          gnData.articles.forEach((a, i) => {
            const hoursAgo = Math.max(0, (Date.now() - new Date(a.publishedAt).getTime()) / 3600000)
            allSignals.push({
              id: `gn_${q}_${i}_${Date.now()}`,
              title: a.title,
              summary: a.description || 'Live news article covering this topic.',
              source: a.source.name,
              sourceType: 'news',
              keyword: q,
              recency: Math.max(0, 30 - (hoursAgo / 24)), // decay slowly
              velocity: Math.floor(Math.random() * 20) + 10,
              relevanceBase: 30 + Math.floor(Math.random() * 10),
              url: a.url
            })
          })
        }
      } catch(e) { console.error('GNews fetch failed', e) }
    }

    // 2. HackerNews (Community)
    try {
      const hnRes = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=5`)
      const hnData = await hnRes.json()
      if (hnData.hits) {
        hnData.hits.forEach((h, i) => {
          if (!h.title && !h.story_title) return
          const hoursAgo = Math.max(0, (Date.now() - new Date(h.created_at).getTime()) / 3600000)
          allSignals.push({
            id: `hn_${q}_${i}_${Date.now()}`,
            title: h.title || h.story_title,
            summary: `Hacker News discussion thread with ${h.num_comments || 0} comments.`,
            source: 'Hacker News',
            sourceType: 'community',
            keyword: q,
            recency: Math.max(0, 30 - (hoursAgo / 24)),
            velocity: Math.floor(Math.random() * 20) + 10,
            relevanceBase: 30 + Math.floor(Math.random() * 10),
            url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
          })
        })
      }
    } catch(e) { console.error('HackerNews fetch failed', e) }

    // 3. Reddit (Community)
    try {
      const rdRes = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=hot&limit=5`)
      const rdData = await rdRes.json()
      if (rdData.data?.children) {
        rdData.data.children.forEach((c, i) => {
          const hoursAgo = Math.max(0, (Date.now() - (c.data.created_utc * 1000)) / 3600000)
          allSignals.push({
            id: `rd_${q}_${i}_${Date.now()}`,
            title: c.data.title,
            summary: c.data.selftext ? c.data.selftext.substring(0, 150) + '...' : `Trending post in r/${c.data.subreddit}`,
            source: `r/${c.data.subreddit}`,
            sourceType: 'community',
            keyword: q,
            recency: Math.max(0, 30 - (hoursAgo / 24)),
            velocity: Math.floor(Math.random() * 20) + 10,
            relevanceBase: 30 + Math.floor(Math.random() * 10),
            url: `https://reddit.com${c.data.permalink}`
          })
        })
      }
    } catch(e) { console.error('Reddit fetch failed', e) }
  }

  // Deduplicate by title
  allSignals = allSignals.filter((v,i,a) => a.findIndex(t => (t.title === v.title)) === i)

  // Assign badges & actions based on raw baseline
  allSignals.forEach(s => {
    const sum = s.recency + s.velocity + s.relevanceBase
    if (sum > 80) s.badge = 'hot'
    else if (sum > 65) s.badge = 'rising'
    else s.badge = 'watch'
    s.action = getAction(s.badge)
  })

  // Save raw cache and update timestamp
  localStorage.setItem(STORAGE_KEYS.RAW_SIGS, JSON.stringify(allSignals))
  localStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString())

  // Apply weights to rank final output
  rescoreSignals()
  
  // Re-seed competitors and digest
  if (profile.competitors?.length) {
    const feed = generateCompFeed(profile.competitors)
    localStorage.setItem(STORAGE_KEYS.COMP_FEED, JSON.stringify(feed))
  }
  generateLiveDigest()
}

export function rescoreSignals() {
  const rawStr = localStorage.getItem(STORAGE_KEYS.RAW_SIGS)
  if (!rawStr) return
  let allSignals = JSON.parse(rawStr)
  const weights = loadWeights()

  allSignals.forEach(s => {
    const wt = weights[s.keyword] ?? 1.0
    s.finalScore = Math.min(100, Math.max(10, Math.round(s.recency + s.velocity + s.relevanceBase * wt)))
  })
  
  allSignals.sort((a, b) => b.finalScore - a.finalScore)
  localStorage.setItem(STORAGE_KEYS.SIGNALS, JSON.stringify(allSignals.slice(0, 50))) // Keep top 50
}

function generateLiveDigest() {
  const signals = loadSignals()
  if (!signals || signals.length === 0) return
  
  const top = signals.slice(0, 3)
  const text = `Live Market Intel: Based on recent web activity, "${top[0]?.title}" is driving the most engagement right now. Additionally, community discussions around "${top[1]?.title}" are accelerating. Actionable takeaway: Monitor these specific trends closely as they indicate immediate shifting market focus.`
  
  localStorage.setItem(STORAGE_KEYS.DIGEST, JSON.stringify({ text, generatedAt: new Date().toISOString() }))
}

// ─── Competitor Feeds (Kept as Mock for now) ─────────────────────────────────
const COMP_DETAILS = {
  'AI automation':            (c) => `${c} has quietly integrated an AI-powered workflow layer into its core product. Early beta users report up to 60% reduction in manual processing time.`,
  'new pricing':              (c) => `${c} announced a revised pricing structure introducing a usage-based tier. The move lowers the entry barrier for smaller customers.`,
  'partnership announcement': (c) => `${c} formalized a strategic partnership expanding its distribution network significantly. Market observers note this reduces ${c}'s dependence on direct sales.`,
  'product launch':           (c) => `${c} shipped a major product update this week, coordinating with a content blitz across LinkedIn and Product Hunt.`,
  'hiring spree':             (c) => `${c} posted numerous job openings in the past 30 days, heavily concentrated in engineering roles, indicating upcoming expansion.`,
}

const SENTIMENTS = ['Threat', 'Neutral', 'Opportunity']

function generateCompFeed(competitors) {
  const topics  = Object.keys(COMP_DETAILS)
  const sources = ['TechCrunch', 'YourStory', 'Inc42', 'Economic Times', 'LinkedIn', 'Product Hunt', 'Twitter/X']
  const feed    = []
  competitors.forEach((comp, ci) => {
    const count = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      const hoursAgo = (ci * 12) + (i * 18) + Math.floor(Math.random() * 6)
      const topic    = topics[Math.floor(Math.random() * topics.length)]
      feed.push({
        id:             `cm_${comp}_${i}`,
        competitorName: comp,
        headline:       `${comp} — ${topic}`,
        source:         sources[Math.floor(Math.random() * sources.length)],
        hoursAgo,
        topic,
        detail:         COMP_DETAILS[topic](comp),
        sentiment:      SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)],
        url:            '#',
      })
    }
  })
  return feed.sort((a, b) => a.hoursAgo - b.hoursAgo)
}

// ─── Public API ──────────────────────────────────────────────────────────────
export async function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  initWeights(profile.keywords)
  await refreshSignals(true) // Force fresh fetch on profile save
}

export function loadProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.PROFILE)
  return raw ? JSON.parse(raw) : null
}

export function loadSignals() {
  const raw = localStorage.getItem(STORAGE_KEYS.SIGNALS)
  if (!raw) return []
  return JSON.parse(raw)
}

export function loadCompFeed() {
  const raw = localStorage.getItem(STORAGE_KEYS.COMP_FEED)
  return raw ? JSON.parse(raw) : []
}

export function loadDigest() {
  const raw = localStorage.getItem(STORAGE_KEYS.DIGEST)
  return raw ? JSON.parse(raw) : null
}

export function initWeights(keywords) {
  const existing = loadWeights()
  const updated = { ...existing }
  keywords.forEach(kw => { if (!updated[kw]) updated[kw] = 1.0 })
  localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(updated))
}

export function loadWeights() {
  const raw = localStorage.getItem(STORAGE_KEYS.WEIGHTS)
  return raw ? JSON.parse(raw) : {}
}

export function recordFeedback(signalId, keyword, isUseful) {
  const weights = loadWeights()
  const current = weights[keyword] ?? 1.0
  weights[keyword] = isUseful
    ? Math.min(2.0, parseFloat((current + 0.1).toFixed(1)))
    : Math.max(0.2, parseFloat((current - 0.1).toFixed(1)))
  localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights))

  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || '[]')
  existing.push({ signalId, keyword, isUseful, at: Date.now() })
  localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(existing))

  rescoreSignals()
}

export function weightToLabel(w) {
  if (w >= 1.5) return 'High'
  if (w >= 0.8) return 'Medium'
  return 'Low'
}

export function clearAll() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
}

export function timeAgo(hoursAgo) {
  if (hoursAgo < 1) return 'Just now'
  if (hoursAgo < 24) return `${Math.round(hoursAgo)} hrs ago`
  if (hoursAgo < 48) return '1 day ago'
  return `${Math.round(hoursAgo / 24)} days ago`
}

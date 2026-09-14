import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const GRAD_COLORS = ['#5B4CF5', '#E040A0', '#0D9488', '#D97706', '#8B5CF6', '#10B981']
const LIGHT_COLORS = ['#EDE9FE', '#FCE7F3', '#CCFBF1', '#FEF3C7', '#EDE9FE', '#D1FAE5']

const getSentimentLabel = (sentiments) => {
  if (!sentiments || sentiments.length === 0) return 'Neutral'
  const counts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 }
  sentiments.forEach(s => counts[s]++)
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  if (dominant === 'POSITIVE') return 'Confident · Assertive'
  if (dominant === 'NEGATIVE') return 'Hesitant · Withdrawn'
  return 'Neutral · Balanced'
}

const getSentimentColor = (sentiments) => {
  if (!sentiments || sentiments.length === 0) return '#9CA3AF'
  const counts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 }
  sentiments.forEach(s => counts[s]++)
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  if (dominant === 'POSITIVE') return '#5B4CF5'
  if (dominant === 'NEGATIVE') return '#E040A0'
  return '#0D9488'
}

const getPersonality = (speaker) => {
  const d = speaker.percentage
  const sentiments = speaker.sentiment || []
  const counts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 }
  sentiments.forEach(s => counts[s]++)
  const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'NEUTRAL'
  if (d >= 55) return { emoji: '🎙️', label: 'The Monopolizer', desc: 'Dominated the conversation', color: '#E040A0' }
  if (d <= 15) return { emoji: '🤫', label: 'The Ghost', desc: 'Mostly silent — rarely spoke', color: '#9CA3AF' }
  if (dom === 'NEGATIVE' && sentiments.length > 2) return { emoji: '😟', label: 'The Withdrawn', desc: 'Hesitant and disengaged', color: '#8B5CF6' }
  if (dom === 'POSITIVE' && d >= 30) return { emoji: '💡', label: 'The Driver', desc: 'Confident and assertive', color: '#5B4CF5' }
  if (dom === 'NEUTRAL') return { emoji: '🕊️', label: 'The Balancer', desc: 'Calm and measured', color: '#0D9488' }
  return { emoji: '🙋', label: 'The Contributor', desc: 'Active but respectful', color: '#D97706' }
}

function Report({ data, setStage }) {
  const [speakerNames, setSpeakerNames] = useState({})
  const [editing, setEditing] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const [roast, setRoast] = useState('')
  const [roasting, setRoasting] = useState(false)

  if (!data || !data.speakers) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--muted)' }}>No report data available.</p>
          <button onClick={() => setStage('upload')} className="underline" style={{ color: '#5B4CF5' }}>Go back</button>
        </div>
      </div>
    )
  }

  const { speakers, interruptions } = data
  const totalDuration = Object.values(speakers).reduce((sum, s) => sum + s.duration, 0)

  const speakerList = Object.entries(speakers).map(([name, s], i) => ({
    name: `Speaker ${name}`,
    duration: s.duration,
    words: s.words,
    sentiment: s.sentiment,
    firstUtterance: s.firstUtterance || null,
    percentage: totalDuration > 0 ? Math.round((s.duration / totalDuration) * 100) : 0,
    color: GRAD_COLORS[i % GRAD_COLORS.length],
    lightColor: LIGHT_COLORS[i % LIGHT_COLORS.length],
  })).sort((a, b) => b.percentage - a.percentage)

  const dominant = speakerList[0]
  const least = speakerList[speakerList.length - 1]
  const pieData = speakerList.map(s => ({ name: speakerNames[s.name] || s.name, value: s.percentage }))
  const getDisplayName = (name) => speakerNames[name] || name

  const speakReport = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const text = `Meeting Equity Report. ${speakerList.length} speakers detected. ${getDisplayName(dominant.name)} dominated with ${dominant.percentage} percent. ${interruptions} interruptions detected. ${dominant.percentage > 50 ? 'Significant power imbalance detected.' : 'Relatively balanced participation.'}`
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const generateRoast = () => {
    setRoasting(true)
    setRoast('')
    setTimeout(() => {
      const d = dominant?.percentage
      const name = getDisplayName(dominant?.name)
      const leastName = getDisplayName(least?.name)
      let options = []
      if (d >= 80) {
        options = [
          `${name} didn't attend a meeting today — they performed a monologue with an audience. ${leastName} was technically present, but so is furniture.`,
          `${name} spoke ${d}% of the time. The other speakers were basically potted plants with LinkedIn profiles.`,
          `Scientists discovered a new black hole — it's called ${name}'s airtime. Nothing, not even other opinions, can escape it.`,
          `${name} came prepared. Prepared to talk. Only to talk. Exclusively to talk. ${leastName} came prepared to survive.`,
        ]
      } else if (d >= 60) {
        options = [
          `${name} clearly read "How to Win Friends" but skipped the part about letting others speak. With ${interruptions} interruptions, this was less a meeting and more a TED talk nobody signed up for.`,
          `${name} treated this meeting like a personal podcast. The others were the live studio audience — present, silent, slightly confused.`,
          `With ${d}% of talk time, ${name} wasn't in a meeting — they were giving a presentation to very polite hostages.`,
          `${name} dominates meetings the way WiFi dominates a coffee shop — available to everyone, but really just serving one person.`,
        ]
      } else if (d >= 40) {
        options = [
          `Not bad — ${name} only dominated ${d}% of the time, which in meeting culture is practically a meditation retreat. Still, ${leastName} spoke so little we're legally required to confirm they have a pulse.`,
          `${name} showed restraint today. Only ${d}% talk time. ${leastName} at ${least?.percentage}% is roughly the same contribution as a houseplant.`,
          `This meeting was almost balanced. Almost. ${name} still edged ahead, probably because they controlled the mute button.`,
        ]
      } else {
        options = [
          `Wow — an actually balanced meeting? ${name} only took ${d}% of talk time. Either everyone respects each other, or nobody wanted to be there. Either way, ${interruptions} interruptions suggest someone had feelings.`,
          `A balanced meeting with ${speakerList.length} speakers? Rare. Beautiful. Suspicious. ${name} kept it at ${d}%.`,
          `${name} at ${d}% — this is what democracy looks like. Chaotic, interrupted ${interruptions} times, but democratic.`,
        ]
      }
      const roastText = options[Math.floor(Math.random() * options.length)]
      setRoast(roastText)
      setRoasting(false)
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(roastText)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      window.speechSynthesis.speak(utterance)
    }, 1500)
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-6xl mx-auto" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold font-serif">
            <span style={{ background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              SilentMeeting
            </span>
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>Meeting Equity Report · Generated</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={speakReport}
            disabled={speaking}
            className="px-6 py-2 rounded-full text-sm flex items-center gap-2 border transition-all"
            style={{ borderColor: '#E040A0', color: '#E040A0', opacity: speaking ? 0.7 : 1 }}
          >
            {speaking ? '🔊 Speaking...' : '🔊 Hear Report'}
          </button>
          <button
            onClick={() => setStage('upload')}
            className="px-6 py-2 rounded-full text-sm border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            ← Analyze Another
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { val: speakerList.length, label: 'Speakers Detected', grad: 'var(--grad-primary)' },
          { val: interruptions, label: 'Interruptions Detected', grad: 'var(--grad-pink)' },
          { val: `${dominant?.percentage}%`, label: 'Talk Dominance', grad: 'var(--grad-teal)' },
        ].map((st, i) => (
          <div key={i} className="rounded-2xl p-6 text-center border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-5xl font-bold mb-2" style={{ background: st.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {st.val}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{st.label}</p>
          </div>
        ))}
      </div>

      {/* Speaker bars + Pie chart */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs tracking-widest mb-2" style={{ color: 'var(--muted)' }}>TALK TIME DISTRIBUTION</p>
          <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>Click a name to rename</p>
          <div className="flex flex-col gap-5">
            {speakerList.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  {editing === s.name ? (
                    <input
                      autoFocus
                      className="text-sm px-2 py-0.5 rounded border outline-none w-36"
                      style={{ borderColor: '#5B4CF5', color: '#1F2937' }}
                      value={speakerNames[s.name] || s.name}
                      onChange={(e) => setSpeakerNames(prev => ({ ...prev, [s.name]: e.target.value }))}
                      onBlur={() => setEditing(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
                    />
                  ) : (
                    <span className="text-sm cursor-pointer" style={{ color: '#374151' }} onClick={() => setEditing(s.name)}>
                      {getDisplayName(s.name)} <span style={{ color: 'var(--muted)', fontSize: '11px' }}>✎</span>
                    </span>
                  )}
                  <span className="text-sm font-bold" style={{ color: s.color }}>{s.percentage}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F0F0FF' }}>
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${s.percentage}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.words} words spoken</p>
                {s.firstUtterance && (
                  <p className="text-xs mt-1 italic" style={{ color: '#6B7280' }}>💬 "{s.firstUtterance}"</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs tracking-widest mb-4" style={{ color: 'var(--muted)' }}>VISUAL BREAKDOWN</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={GRAD_COLORS[i % GRAD_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                formatter={(value) => [`${value}%`, 'Talk time']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {speakerList.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{getDisplayName(s.name)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personality Types */}
      <div className="rounded-2xl p-6 mb-10 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--muted)' }}>MEETING PERSONALITIES</p>
        <div className="grid grid-cols-3 gap-4">
          {speakerList.map((s, i) => {
            const personality = getPersonality(s)
            return (
              <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: '#FAFAFA', borderColor: 'var(--border)' }}>
                <div className="text-4xl mb-3">{personality.emoji}</div>
                <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{getDisplayName(s.name)}</p>
                <p className="font-bold text-base mb-1" style={{ color: personality.color }}>{personality.label}</p>
                <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{personality.desc}</p>
                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: s.lightColor, color: getSentimentColor(s.sentiment) }}>
                  {getSentimentLabel(s.sentiment)}
                </span>
                <div className="mt-3 w-full rounded-full h-1.5" style={{ backgroundColor: '#F0F0FF' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${s.percentage}%`, background: `linear-gradient(90deg, ${personality.color}, ${personality.color}88)` }} />
                </div>
                <p className="text-xs mt-1 font-semibold" style={{ color: personality.color }}>{s.percentage}% talk time</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roast section */}
      <div className="rounded-2xl p-6 mb-10 border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs tracking-widest" style={{ color: '#D97706' }}>MEETING ROAST</p>
          <button
            onClick={generateRoast}
            disabled={roasting}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: roasting ? '#FEF3C7' : 'var(--grad-amber)', color: roasting ? '#D97706' : 'white' }}
          >
            {roasting ? 'Roasting...' : 'Roast This Meeting'}
          </button>
        </div>
        {roast && <p className="text-sm italic leading-relaxed" style={{ color: '#92400E' }}>"{roast}"</p>}
        {!roast && !roasting && <p className="text-sm" style={{ color: 'var(--muted)' }}>Click to get an AI-powered roast of your meeting dynamics.</p>}
      </div>

      {/* Quote */}
      <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, #5B4CF5 0%, #8B5CF6 50%, #E040A0 100%)' }}>
        <p className="text-2xl font-serif text-white italic mb-2">"Your meeting felt equal.</p>
        <p className="text-2xl font-serif italic" style={{ color: '#EDE9FE' }}>The data disagrees."</p>
        <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Powered by AssemblyAI Speaker Diarization & Sentiment Analysis</p>
      </div>

    </div>
  )
}

export default Report
import { useEffect, useState } from 'react'

function Processing({ setStage, setReportData }) {
  const [status, setStatus] = useState('Uploading your meeting audio...')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const analyze = async () => {
      try {
        const file = window._smFile
        if (!file) {
          setStatus('No file found. Please go back and upload again.')
          return
        }
        setStatus('Uploading your meeting audio...')
        setProgress(20)
        const formData = new FormData()
        formData.append('audio', file)
        setStatus('Transcribing speakers...')
        setProgress(45)
        const response = await fetch('http://localhost:3001/analyze', {
          method: 'POST',
          body: formData,
        })
        setStatus('Analyzing power dynamics...')
        setProgress(75)
        const data = await response.json()
        if (data.error) {
          setStatus(`Error: ${data.error}`)
          return
        }
        setStatus('Generating equity report...')
        setProgress(95)
        setProgress(100)
        setReportData({ speakers: data.speakers, interruptions: data.interruptions, utterances: data.utterances })
        setTimeout(() => setStage('report'), 800)
      } catch (err) {
        console.error(err)
        setStatus('Something went wrong. Please try again.')
      }
    }
    analyze()
  }, [])

  const steps = [
    'Uploading your meeting audio...',
    'Transcribing speakers...',
    'Analyzing power dynamics...',
    'Generating equity report...',
  ]

  const currentIndex = steps.indexOf(status)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>

      <h1 className="text-4xl font-bold mb-2 font-serif">
        <span style={{ background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          SilentMeeting
        </span>
      </h1>
      <p className="mb-16" style={{ color: 'var(--muted)' }}>Analyzing your meeting...</p>

      {/* Progress ring */}
      <div className="relative w-48 h-48 mb-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E0E0F0" strokeWidth="8"/>
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="url(#ringGrad)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5B4CF5"/>
              <stop offset="100%" stopColor="#E040A0"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold" style={{ background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {steps.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300`}
            style={{ color: status === step ? '#1F2937' : currentIndex > i ? 'var(--muted)' : '#D1D5DB' }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
              style={{
                background: status === step
                  ? 'var(--grad-primary)'
                  : currentIndex > i
                  ? '#D1D5DB'
                  : '#E5E7EB'
              }}/>
            {step}
          </div>
        ))}
      </div>

      {status.startsWith('Error') && (
        <div className="mt-8 text-sm text-center max-w-sm" style={{ color: '#E040A0' }}>
          {status}
          <br/>
          <button onClick={() => setStage('upload')} className="mt-4 underline" style={{ color: '#5B4CF5' }}>
            Go back and try again
          </button>
        </div>
      )}
    </div>
  )
}

export default Processing
import { useState } from 'react'
import LiveRecorder from './LiveRecorder'

function Upload({ setStage, setReportData }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('upload')

  const handleFile = (f) => {
    if (!f) return
    if (!f.type.startsWith('audio/') && !f.type.startsWith('video/')) {
      setError('Please upload an audio or video file.')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleAnalyze = () => {
    if (!file) return
    window._smFile = file
    setReportData({ file })
    setStage('processing')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1 mb-6 border" style={{ backgroundColor: '#EDE9FE', borderColor: '#8B5CF6' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8B5CF6' }}/>
          <span className="text-sm font-semibold tracking-widest" style={{ color: '#5B4CF5' }}>LIVE ANALYSIS</span>
        </div>
        <h1 className="text-6xl font-bold mb-2 font-serif">
          <span style={{ background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            SilentMeeting
          </span>
        </h1>
        <p className="text-lg mt-3" style={{ color: 'var(--body)' }}>Who spoke. Who was cut off. Whose ideas survived.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 rounded-full mb-8 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => setMode('upload')}
          className="px-6 py-2 rounded-full text-sm font-medium transition-all"
          style={mode === 'upload' ? { background: 'var(--grad-primary)', color: 'white' } : { color: 'var(--muted)' }}
        >
          Upload Audio
        </button>
        <button
          onClick={() => setMode('record')}
          className="px-6 py-2 rounded-full text-sm font-medium transition-all"
          style={mode === 'record' ? { background: 'var(--grad-pink)', color: 'white' } : { color: 'var(--muted)' }}
        >
          🔴 Live Record
        </button>
      </div>

      {/* Upload mode */}
      {mode === 'upload' && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="w-full max-w-2xl border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer"
            style={{
              borderColor: dragging ? '#5B4CF5' : 'var(--border)',
              backgroundColor: dragging ? '#EDE9FE' : 'var(--card)',
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div className="text-5xl mb-4">🎙️</div>
            {file ? (
              <div>
                <p className="font-semibold text-lg" style={{ color: '#0D9488' }}>✓ {file.name}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium" style={{ color: 'var(--body)' }}>Drop your meeting audio here</p>
                <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>or click to browse — MP3, MP4, WAV, M4A supported</p>
              </div>
            )}
            <input id="fileInput" type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {error && <p className="mt-4 text-sm" style={{ color: '#E040A0' }}>{error}</p>}

          <button
            onClick={handleAnalyze}
            disabled={!file}
            className="mt-8 px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 text-white"
            style={file
              ? { background: 'var(--grad-primary)', boxShadow: '0 8px 32px rgba(91,76,245,0.3)' }
              : { backgroundColor: '#E5E5F0', color: 'var(--muted)', cursor: 'not-allowed' }}
          >
            Analyze Meeting →
          </button>
        </>
      )}

      {mode === 'record' && (
        <LiveRecorder setStage={setStage} setReportData={setReportData} />
      )}

      <button
        onClick={() => {
          setReportData({
            speakers: {
              A: { words: 847, duration: 180000, sentiment: ['POSITIVE', 'POSITIVE', 'NEUTRAL'], firstUtterance: "I think we should go with option A, it has more value." },
              B: { words: 312, duration: 66000, sentiment: ['NEGATIVE', 'NEUTRAL', 'NEGATIVE'], firstUtterance: "Actually I disagree, option B makes more sense here." },
              C: { words: 156, duration: 34000, sentiment: ['NEUTRAL', 'NEUTRAL'], firstUtterance: "Can I just add something quickly before we move on?" },
            },
            interruptions: 4,
            utterances: []
          })
          setStage('report')
        }}
        className="mt-6 text-sm underline transition-all"
        style={{ color: 'var(--muted)' }}
      >
        Try Demo Mode →
      </button>

      <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>Powered by AssemblyAI Speaker Diarization</p>
    </div>
  )
}

export default Upload
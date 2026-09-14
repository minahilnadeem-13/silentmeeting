import { useState, useRef } from 'react'

function LiveRecorder({ setStage, setReportData }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [done, setDone] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], 'live-meeting.webm', { type: 'audio/webm' })
        window._smFile = file
        setDone(true)
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setRecording(true)

      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)

    } catch (err) {
      alert('Microphone access denied. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    clearInterval(timerRef.current)
  }

  const handleAnalyze = () => {
    setStage('processing')
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">

      {/* Timer */}
      <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center mb-8 transition-all duration-300
        ${recording ? 'border-pink-500 shadow-lg shadow-pink-500/30' : done ? 'border-green-500' : 'border-slate-700'}`}>
        {recording && (
          <span className="absolute w-40 h-40 rounded-full border-4 border-pink-500 animate-ping opacity-20"/>
        )}
        <div className="text-center">
          <p className={`text-3xl font-bold ${recording ? 'text-pink-400' : done ? 'text-green-400' : 'text-slate-500'}`}>
            {formatTime(seconds)}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {recording ? 'Recording...' : done ? 'Ready' : 'Ready'}
          </p>
        </div>
      </div>

      {/* Controls */}
      {!recording && !done && (
        <button
          onClick={startRecording}
          className="flex items-center gap-3 px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-pink-500/25"
        >
          <span className="w-3 h-3 bg-white rounded-full"/>
          Start Recording
        </button>
      )}

      {recording && (
        <button
          onClick={stopRecording}
          className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-all border border-slate-600"
        >
          <span className="w-3 h-3 bg-pink-400 rounded-sm"/>
          Stop Recording
        </button>
      )}

      {done && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-green-400 text-sm">✓ Recording saved — {formatTime(seconds)} captured</p>
          <button
            onClick={handleAnalyze}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/25"
          >
            Analyze Recording →
          </button>
          <button
            onClick={() => { setSeconds(0); setDone(false); chunksRef.current = [] }}
            className="text-slate-500 text-sm hover:text-slate-400 underline"
          >
            Record again
          </button>
        </div>
      )}

      <p className="text-slate-600 text-xs mt-8">Make sure multiple people are speaking for best results</p>
    </div>
  )
}

export default LiveRecorder
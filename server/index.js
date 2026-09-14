require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { AssemblyAI } = require('assemblyai')
const fs = require('fs')

const app = express()
const upload = multer({ dest: 'uploads/' })
const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY })

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  res.setTimeout(120000, () => {
    res.status(408).json({ error: 'Request timed out. Try a shorter recording.' })
  })
  next()
})

app.post('/analyze', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' })
    }
    console.log('File received:', req.file?.originalname, req.file?.size, 'bytes')
    console.log('File path:', req.file?.path)

    const filePath = req.file.path
    const uploadUrl = await client.files.upload(fs.createReadStream(filePath))

    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      speaker_labels: true,
      sentiment_analysis: true,
    })

    fs.unlinkSync(filePath)

    const speakers = {}
    transcript.utterances?.forEach(u => {
      if (!speakers[u.speaker]) {
        speakers[u.speaker] = { words: 0, duration: 0, sentiment: [], firstUtterance: u.text }
      }
      speakers[u.speaker].words += u.words?.length || 0
      speakers[u.speaker].duration += (u.end - u.start)
      if (u.sentiment) speakers[u.speaker].sentiment.push(u.sentiment)
    })

    let interruptions = 0
    const utterances = transcript.utterances || []
    for (let i = 1; i < utterances.length; i++) {
      if (utterances[i].start < utterances[i - 1].end) interruptions++
    }

    res.json({ speakers, interruptions, utterances })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.listen(3001, () => console.log('Server running on http://localhost:3001'))
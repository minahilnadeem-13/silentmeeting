# SilentMeeting — Meeting Equity Analyzer

**Who spoke. Who was cut off. Whose ideas survived.**

SilentMeeting is a Voice AI application that reveals the real power dynamics inside every meeting. Most meetings feel collaborative — the data disagrees. Upload your meeting audio or record live, and SilentMeeting generates a full Meeting Equity Report showing talk-time distribution, interruptions, sentiment per speaker, and meeting personality types.

Built for the **AssemblyAI Voice Agent Hackathon** on lablab.ai — September 2026.

---

## The Problem

73% of meetings have one dominant speaker. The average meeting has 4.2 interruptions. 1 in 3 participants rarely speak at all. These are not edge cases — this is every meeting, every day, everywhere. Nobody tracks it.

## The Solution

SilentMeeting uses AssemblyAI's speaker diarization and sentiment analysis to separate every voice in the room, detect interruptions in real time, and generate a visual report that makes hidden power dynamics visible.

---

## Features

- Speaker diarization — separates and labels every voice automatically
- Talk time distribution — visual breakdown with gradient speaker bars
- Interruption detection — flags exactly who cut off whom
- Sentiment analysis — reads confidence, hesitation, and withdrawal per speaker
- Meeting personality types — The Monopolizer, The Ghost, The Driver, The Balancer, and more
- First utterance preview — see what each speaker said first to identify who's who
- Hear Report — spoken audio summary using browser speech synthesis
- Roast Mode — humorous AI-powered summary of meeting dynamics
- Demo Mode — full working demo without uploading any audio
- Live recording — record directly in the browser, no external tools needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express, Multer |
| Voice AI | AssemblyAI (Speaker Diarization, Sentiment Analysis) |
| Charts | Recharts |
| Deployment | Netlify (frontend), Render (backend) |

---

## Getting Started

### Prerequisites
- Node.js v18+
- AssemblyAI API key — [sign up here](https://www.assemblyai.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/minahilnadeem-13/silentmeeting.git
cd silentmeeting

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Environment Setup

Create a `.env` file inside the `server/` directory:

### Run Locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
node index.js
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## How It Works

1. **Upload or Record** — Drop your meeting audio or record live in the browser
2. **AI Analysis** — AssemblyAI transcribes every speaker separately with diarization and sentiment detection
3. **Equity Report** — A visual dashboard reveals talk time, interruptions, sentiment per speaker, and personality types

---

## Project Structure

silentmeeting/
├── src/
│ ├── components/
│ │ ├── Upload.jsx # Upload + live recording interface
│ │ ├── Processing.jsx # Analysis progress screen
│ │ ├── Report.jsx # Full equity report dashboard
│ │ └── LiveRecorder.jsx # Browser microphone recorder
│ ├── App.jsx
│ └── index.css
├── server/
│ └── index.js # Express backend + AssemblyAI integration
└── README.md

---

## Built By

**Minahil Nadeem** — CS Graduate, UI/UX Designer & Frontend Developer  
GitHub: [minahilnadeem-13](https://github.com/minahilnadeem-13)

AssemblyAI Voice Agent Hackathon — lablab.ai — September 2026
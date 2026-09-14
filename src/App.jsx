import { useState } from 'react'
import Upload from './components/Upload'
import Processing from './components/Processing'
import Report from './components/Report'

function App() {
  const [stage, setStage] = useState('upload') // upload | processing | report
  const [reportData, setReportData] = useState(null)

  return (
    <div className="min-h-screen text-gray-800" style={{ backgroundColor: 'var(--bg)' }}>
      {stage === 'upload' && (
        <Upload setStage={setStage} setReportData={setReportData} />
      )}
      {stage === 'processing' && (
        <Processing setStage={setStage} setReportData={setReportData} />
      )}
      {stage === 'report' && (
        <Report data={reportData} setStage={setStage} />
      )}
    </div>
  )
}

export default App
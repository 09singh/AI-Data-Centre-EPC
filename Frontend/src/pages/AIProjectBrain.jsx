import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getChatHistory, askAIManager } from '../services/AIAPI'

export default function AIProjectBrain() {
  const [history, setHistory] = useState([])
  const [messages, setMessages] = useState([
    { from: 'user', text: 'Why is the procurement file showing errors?' },
    {
      from: 'ai',
      text: 'Two switchgear orders are missing the certification field required by spec section 26-24.',
      meta: '2 orders affected · flagged 8 min ago'
    }
  ])
  const [input, setInput] = useState('')

  useEffect(() => {
    getChatHistory().then(setHistory)
  }, [])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    const question = input
    setMessages((m) => [...m, { from: 'user', text: question }])
    setInput('')
    const result = await askAIManager(question)
    setMessages((m) => [...m, { from: 'ai', text: result.response, meta: `Confidence ${Math.round(result.confidence * 100)}% · cites ${result.citedSource}` }])
  }

  return (
    <Layout>
      <div style={{ display: 'flex', height: 460, margin: -24 }}>
        <div style={{ width: 180, borderRight: '1px solid var(--border)', padding: '14px 12px', flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 10px' }}>
            History
          </p>
          {history.map((h) => (
            <div key={h.id} style={{ fontSize: 12, padding: '7px 8px', borderRadius: 8, color: 'var(--muted)', marginBottom: 4 }}>
              {h.title}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  background: m.from === 'user' ? 'var(--accent-soft)' : 'var(--panel)',
                  border: m.from === 'ai' ? '1px solid var(--border)' : 'none',
                  borderRadius: 12,
                  padding: '10px 12px'
                }}
              >
                <p style={{ fontSize: 13, margin: 0 }}>{m.text}</p>
                {m.meta && <p style={{ fontSize: 12, color: 'var(--danger)', margin: '6px 0 0' }}>{m.meta}</p>}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Ask the AI manager anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn" type="submit">
              <i className="ti ti-send" style={{ fontSize: 15 }} />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

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
      <div className="flex h-[460px] -m-6">
        <div className="w-[180px] border-r border-[var(--border)] p-3.5 flex-shrink-0">
          <p className="text-[11px] text-[var(--muted)] uppercase tracking-wide m-0 mb-2.5">
            History
          </p>
          {history.map((h) => (
            <div key={h.id} className="text-xs px-2 py-1.5 rounded-lg text-[var(--muted)] mb-1 hover:bg-[var(--panel)] cursor-pointer transition-colors">
              {h.title}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[70%] rounded-xl p-2.5 ${
                  m.from === 'user' 
                    ? 'self-end bg-[var(--accent-soft)]' 
                    : 'self-start bg-[var(--panel)] border border-[var(--border)]'
                }`}
              >
                <p className="text-sm m-0">{m.text}</p>
                {m.meta && <p className="text-xs text-[var(--danger)] m-0 mt-1.5">{m.meta}</p>}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-[var(--border)]">
            <input
              className="input flex-1"
              placeholder="Ask the AI manager anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              className="btn px-4 py-2 flex items-center gap-1.5 text-sm" 
              type="submit"
            >
              <i className="ti ti-send text-base" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
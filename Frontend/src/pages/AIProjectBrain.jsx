import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { askAIManager, getAIHealth } from '../services/AIAPI'

const POLL_SECONDS = 8

export default function AIProjectBrain() {
  const [messages, setMessages] = useState([
    { from: 'user', text: 'Why is the procurement file showing errors?' },
    {
      from: 'ai',
      text: 'Two switchgear orders are missing the certification field required by spec section 26-24.',
      meta: '2 orders affected · flagged 8 min ago'
    }
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [health, setHealth] = useState(null)

  const latestUserQuestion = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.from === 'user') return messages[i].text
    }
    return ''
  }, [messages])

  const abortRef = useRef(null)

  useEffect(() => {
    getAIHealth()
      .then((res) => setHealth(res))
      .catch(() => setHealth({ status: 'unavailable' }))
  }, [])

  // Best-effort “real-time”: since backend has no chat-history endpoint,
  // periodically ask the AI to refresh the latest response for the most
  // recent user question.
  useEffect(() => {
    if (!latestUserQuestion) return

    const id = setInterval(async () => {
      try {
        setIsSending(false) // keep UI from showing send state for polling
        abortRef.current?.abort?.()
        const controller = new AbortController()
        abortRef.current = controller

        const result = await askAIManager(latestUserQuestion, { signal: controller.signal })

        setMessages((m) => {
          // Replace the last AI message if one exists; otherwise append.
          const lastIndex = [...m].reverse().findIndex((x) => x?.from === 'ai')
          if (lastIndex >= 0) {
            const idx = m.length - 1 - lastIndex
            const next = [...m]
            next[idx] = {
              from: 'ai',
              text: result.response,
              meta: `Confidence ${Math.round(result.confidence * 100)}% · cites ${result.citedSource}`
            }
            return next
          }
          return [
            ...m,
            {
              from: 'ai',
              text: result.response,
              meta: `Confidence ${Math.round(result.confidence * 100)}% · cites ${result.citedSource}`
            }
          ]
        })
      } catch {
        // ignore polling errors to avoid disrupting chat
      }
    }, POLL_SECONDS * 1000)

    return () => clearInterval(id)
  }, [latestUserQuestion])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return

    const question = input
    setInput('')
    setIsSending(true)

    setMessages((m) => [...m, { from: 'user', text: question }])

    try {
      const result = await askAIManager(question)
      setMessages((m) => [
        ...m,
        {
          from: 'ai',
          text: result.response,
          meta: `Confidence ${Math.round(result.confidence * 100)}% · cites ${result.citedSource}`
        }
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Layout>
      <div className="flex h-[460px] -m-6">
        <div className="w-[180px] border-r border-[var(--border)] p-3.5 flex-shrink-0">
          <p className="text-[11px] text-[var(--muted)] uppercase tracking-wide m-0 mb-2.5">
            Status
          </p>
          <div className="text-xs px-2 py-1.5 rounded-lg text-[var(--muted)] mb-1">
            AI: {health?.status || health?.healthy || (health ? 'ready' : 'checking...')}
          </div>
          <div className="text-[11px] text-[var(--muted)] leading-snug px-2 mt-3">
            Polling refresh every {POLL_SECONDS}s (no backend history endpoint yet)
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex flex-col flex-1 gap-3 p-4 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[70%] rounded-xl p-2.5 ${
                  m.from === 'user'
                    ? 'self-end bg-[var(--accent-soft)]'
                    : 'self-start bg-[var(--panel)] border border-[var(--border)]'
                }`}
              >
                <p className="m-0 text-sm">{m.text}</p>
                {m.meta && <p className="text-xs text-[var(--danger)] m-0 mt-1.5">{m.meta}</p>}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-[var(--border)]">
            <input
              className="flex-1 input"
              placeholder="Ask the AI manager anything..."
              value={input}
              disabled={isSending}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn px-4 py-2 flex items-center gap-1.5 text-sm" type="submit" disabled={isSending}>
              <i className="text-base ti ti-send" />
              <span>{isSending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}


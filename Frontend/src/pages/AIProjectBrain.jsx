import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { askAIManager, getAIHealth } from '../services/AIAPI'

export default function AIProjectBrain() {
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [health, setHealth] = useState(null)
  const [docContext, setDocContext] = useState(null)
  const autoQuestionSent = useRef(false)  // ← Use ref instead of state

  // Check if coming from document click
  useEffect(() => {
    if (location.state?.documentId && location.state?.initialQuestion && !autoQuestionSent.current) {
      autoQuestionSent.current = true  // ← Mark as sent
      setDocContext({
        documentId: location.state.documentId,
        documentName: location.state.documentName
      })
      // Auto-send question about document
      handleAutoDocumentQuestion(location.state.initialQuestion, location.state.documentId)
    }
  }, [location.state])

  const handleAutoDocumentQuestion = async (question, documentId) => {
    setMessages([{ from: 'user', text: question }])
    setIsSending(true)

    try {
      const result = await askAIManager(question, { 
        filters: { document_id: documentId },
        session_id: `doc_${documentId}_${Date.now()}`
      })
      setMessages((m) => [
        ...m,
        {
          from: 'ai',
          text: result.response || result.data?.response || 'No response from AI',
          meta: result.citations ? `${result.citations.length} citations found` : ''
        }
      ])
    } catch (error) {
      setMessages((m) => [
        ...m,
        {
          from: 'ai',
          text: 'Sorry, I could not process your question about this document.',
          meta: 'Error occurred'
        }
      ])
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    getAIHealth()
      .then((res) => setHealth(res))
      .catch(() => setHealth({ status: 'unavailable' }))
  }, [])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const question = input
    setInput('')
    setIsSending(true)

    // If we have document context, include it in the query
    const options = docContext?.documentId ? {
      filters: { document_id: docContext.documentId },
      session_id: `doc_${docContext.documentId}_${Date.now()}`
    } : {}

    setMessages((m) => [...m, { from: 'user', text: question }])

    try {
      const result = await askAIManager(question, options)
      setMessages((m) => [
        ...m,
        {
          from: 'ai',
          text: result.response || result.data?.response || 'No response from AI',
          meta: result.citations ? `${result.citations.length} citations found` : ''
        }
      ])
    } catch (error) {
      setMessages((m) => [
        ...m,
        {
          from: 'ai',
          text: 'Sorry, I encountered an error. Please try again.',
          meta: 'Error occurred'
        }
      ])
    } finally {
      setIsSending(false)
    }
  }

  // Clear document context when user asks a new question without document filter
  const handleClearContext = () => {
    setDocContext(null)
    autoQuestionSent.current = false  // ← Reset for next document click
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-200px)] -m-6 min-h-[400px]">
        <div className="w-[180px] border-r border-[var(--border)] p-3.5 flex-shrink-0 overflow-y-auto">
          <p className="text-[11px] text-[var(--muted)] uppercase tracking-wide m-0 mb-2.5">
            Status
          </p>
          <div className="text-xs px-2 py-1.5 rounded-lg text-[var(--muted)] mb-1">
            AI: {health?.status || health?.healthy || (health ? 'ready' : 'checking...')}
          </div>
          {docContext && (
            <div className="text-xs px-2 py-1.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] mb-1">
              <p className="m-0 font-medium">Document Context</p>
              <p className="m-0 text-[10px] truncate">{docContext.documentName}</p>
              <button 
                onClick={handleClearContext}
                className="text-[10px] text-[var(--muted)] hover:text-[var(--text)] mt-1"
              >
                Clear context
              </button>
            </div>
          )}
          <div className="text-[11px] text-[var(--muted)] leading-snug px-2 mt-3">
            {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col flex-1 gap-3 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--muted)]">
                <i className="ti ti-robot text-4xl mb-3 opacity-50" />
                <p className="text-sm m-0">Ask the AI manager anything about your project</p>
                <p className="text-xs m-0 mt-1">Try: "What's the project status?" or "Tell me about recent changes"</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[70%] rounded-xl p-2.5 ${
                    m.from === 'user'
                      ? 'self-end bg-[var(--accent-soft)]'
                      : 'self-start bg-[var(--panel)] border border-[var(--border)]'
                  }`}
                >
                  <p className="m-0 text-sm">{m.text}</p>
                  {m.meta && <p className="text-xs text-[var(--muted)] m-0 mt-1.5">{m.meta}</p>}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-[var(--border)] flex-shrink-0">
            <input
              className="flex-1 input"
              placeholder={docContext ? `Ask about ${docContext.documentName}...` : "Ask the AI manager anything..."}
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
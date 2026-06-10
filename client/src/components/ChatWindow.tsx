import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/useAuth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWindow() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json() as { reply: string; history: HistoryEntry[] };
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setHistory(data.history);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: '48px', height: '48px', borderRadius: '50%',
          background: '#3b82f6', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', color: '#fff', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem',
          width: '360px', height: '480px',
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: '8px', display: 'flex', flexDirection: 'column',
          zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontFamily: 'monospace',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #1e293b',
            fontSize: '0.7rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#475569',
          }}>
            Dashboard Agent
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            {messages.length === 0 && (
              <div style={{ color: '#334155', fontSize: '0.8rem' }}>
                Ask me about your pipeline, commits, or system health.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.5rem 0.75rem',
                background: msg.role === 'user' ? '#1e3a5f' : '#1e293b',
                border: `1px solid ${msg.role === 'user' ? '#3b82f6' : '#334155'}`,
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#cbd5e1',
                lineHeight: '1.5',
              }}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start', padding: '0.5rem 0.75rem',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '6px', fontSize: '0.8rem', color: '#475569',
              }}>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem', borderTop: '1px solid #1e293b',
            display: 'flex', gap: '0.5rem',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              style={{
                flex: 1, background: '#0f172a', border: '1px solid #1e293b',
                borderRadius: '4px', padding: '0.5rem 0.75rem',
                color: '#cbd5e1', fontSize: '0.8rem', fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: '#3b82f6', border: 'none', borderRadius: '4px',
                padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.8rem',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                fontFamily: 'monospace',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../lib/useAuth'


interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  createdAt: string
  updatedAt: string
  url: string
  duration: number | null
}

interface ActivityEvent {
  id: string
  type: string
  message: string
  timestamp: string
}

let socket: Socket | null = null

export default function DashboardPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([])
  const [workflowsLoading, setWorkflowsLoading] = useState(true)
  const { logout, accessToken } = useAuth()
  const navigate = useNavigate()
  
  

  useEffect(() => {
    socket = io('http://localhost:3000', {
      withCredentials: true,
    })

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('activity', (event: Omit<ActivityEvent, 'id'>) => {
      setEvents(prev => [
        { ...event, id: crypto.randomUUID() },
        ...prev,
      ])
    })

    return () => {
      socket?.disconnect()
      socket = null
    }
  }, [])

  useEffect(() => {
  if (!accessToken) return

  fetch('http://localhost:3000/api/github/workflows', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      setWorkflowRuns(data)
      setWorkflowsLoading(false)
    })
    .catch(() => setWorkflowsLoading(false))
}, [accessToken])
  const handleLogout = async () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e8f0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f8fafc',
              margin: 0,
            }}>
              DevOps Dashboard
            </h1>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: connected ? '#22c55e' : '#ef4444',
              }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {connected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          {/* Nav + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <span style={{
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#3b82f6',
                cursor: 'default',
              }}>
                Dashboard
              </span>
            </nav>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #1e293b',
                color: '#64748b',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.375rem 0.75rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.borderColor = '#ef4444'
                ;(e.target as HTMLButtonElement).style.color = '#ef4444'
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.borderColor = '#1e293b'
                ;(e.target as HTMLButtonElement).style.color = '#64748b'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Feed */}
        <div>
          <h2 style={{
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#475569',
            marginBottom: '1rem',
          }}>
            Activity Feed
          </h2>

          {events.length === 0 ? (
            <div style={{ color: '#334155', fontSize: '0.875rem', padding: '2rem 0' }}>
              Waiting for events...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {events.map(event => (
                <div key={event.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderLeft: '3px solid #3b82f6',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ color: '#475569' }}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{ color: '#cbd5e1' }}>{event.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
                {/* Workflow Runs */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#475569',
            marginBottom: '1rem',
          }}>
            CI/CD Runs
          </h2>

          {workflowsLoading ? (
            <div style={{ color: '#334155', fontSize: '0.875rem', padding: '2rem 0' }}>
              Loading...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {workflowRuns.map(run => (
                <a
                  key={run.id}
                  href={run.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 80px 80px 1fr',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderLeft: `3px solid ${run.conclusion === 'success' ? '#22c55e' : run.conclusion === 'failure' ? '#ef4444' : '#f59e0b'}`,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}>
                    <span style={{ color: '#475569' }}>
                      {new Date(run.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{
                      color: run.conclusion === 'success' ? '#22c55e' : run.conclusion === 'failure' ? '#ef4444' : '#f59e0b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {run.conclusion ?? run.status}
                    </span>
                    <span style={{ color: '#475569' }}>
                      {run.duration != null ? `${run.duration}s` : '—'}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>{run.name}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>  
      </div>
    </div>
  )
}

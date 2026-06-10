import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../lib/useAuth'
import ChatWindow from '../components/ChatWindow';

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

interface CommitDay {
  date: string
  count: number
}

let socket: Socket | null = null

function PipelineHealth({ runs }: { runs: WorkflowRun[] }) {
  const last10 = runs.slice(0, 10)
  const passed = last10.filter(r => r.conclusion === 'success').length
  const failed = last10.length - passed
  const pct = last10.length > 0 ? Math.round((passed / last10.length) * 100) : 0
  const pctColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
  const successDeg = Math.round((passed / last10.length) * 360)

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Last {last10.length} runs
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {last10.map(run => (
            <div key={run.id} style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: run.conclusion === 'success' ? '#22c55e' : '#ef4444',
              border: '2px solid #000', boxSizing: 'border-box',
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>{passed}</div>
          <div style={{ fontSize: '0.65rem', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>passed</div>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>{failed}</div>
          <div style={{ fontSize: '0.65rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>failed</div>
        </div>
      </div>
      <div style={{
        position: 'relative', width: '200px', height: '200px', borderRadius: '50%',
        background: `conic-gradient(#22c55e 0deg ${successDeg}deg, #ef4444 ${successDeg}deg 360deg)`,
        outline: '2px solid #000',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', width: '140px', height: '140px',
          borderRadius: '50%', background: '#0f172a', border: '2px solid #000',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: pctColor }}>{pct}%</div>
          <div style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>success</div>
        </div>
      </div>
    </div>
  )
}

function CommitHeatmap({ data }: { data: CommitDay[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  const getColor = (count: number) => {
    if (count === 0) return '#1e293b'
    const intensity = count / max
    if (intensity < 0.25) return '#166534'
    if (intensity < 0.5) return '#16a34a'
    if (intensity < 0.75) return '#22c55e'
    return '#4ade80'
  }

  const firstDate = new Date(data[0]?.date)
  const startDow = firstDate.getDay()
  const cells: (CommitDay | null)[] = [...Array(startDow).fill(null), ...data]
  const weeks: (CommitDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const monthLabels: { label: string; weekIndex: number }[] = []
  weeks.forEach((week, wi) => {
    week.forEach(day => {
      if (!day) return
      const d = new Date(day.date)
      if (d.getDate() <= 7) {
        const label = MONTHS[d.getMonth()]
        if (!monthLabels.find(m => m.label === label)) monthLabels.push({ label, weekIndex: wi })
      }
    })
  })

  const CELL = 12
  const GAP = 3

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: '1rem' }}>
        Commit Activity
      </h2>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, paddingTop: `${CELL + GAP + 2}px` }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} style={{ height: `${CELL}px`, fontSize: '0.55rem', color: '#475569', display: 'flex', alignItems: 'center', width: '24px' }}>
                {label}
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', marginBottom: '2px', position: 'relative', height: `${CELL}px` }}>
              {monthLabels.map(({ label, weekIndex }) => (
                <div key={label} style={{ position: 'absolute', left: `${weekIndex * (CELL + GAP)}px`, fontSize: '0.6rem', color: '#64748b' }}>
                  {label}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: `${GAP}px` }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                  {week.map((day, di) => (
                    <div key={di}
                      title={day ? `${day.date}: ${day.count} commit${day.count !== 1 ? 's' : ''}` : ''}
                      style={{ width: `${CELL}px`, height: `${CELL}px`, background: day ? getColor(day.count) : 'transparent', borderRadius: '2px' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6rem', color: '#475569' }}>Less</span>
          {['#1e293b', '#166534', '#16a34a', '#22c55e', '#4ade80'].map(c => (
            <div key={c} style={{ width: `${CELL}px`, height: `${CELL}px`, background: c, borderRadius: '2px' }} />
          ))}
          <span style={{ fontSize: '0.6rem', color: '#475569' }}>More</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([])
  const [workflowsLoading, setWorkflowsLoading] = useState(true)
  const [commitActivity, setCommitActivity] = useState<CommitDay[]>([])
  const [commitsLoading, setCommitsLoading] = useState(true)
  const { logout, accessToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    socket = io(import.meta.env.VITE_API_URL || '', { withCredentials: true })
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('activity', (event: Omit<ActivityEvent, 'id'>) => {
      setEvents(prev => [{ ...event, id: crypto.randomUUID() }, ...prev])
    })
    return () => { socket?.disconnect(); socket = null }
  }, [])

  useEffect(() => {
    if (!accessToken) return
    fetch('/api/github/workflows', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(data => {
        const runs = data?.data ?? data
        setWorkflowRuns(Array.isArray(runs) ? runs : [])
        setWorkflowsLoading(false)
      })
      .catch(() => setWorkflowsLoading(false))
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return
    fetch('/api/github/commits', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(data => {
        const commits = data?.data ?? data
        setCommitActivity(Array.isArray(commits) ? commits : [])
        setCommitsLoading(false)
      })
      .catch(() => setCommitsLoading(false))
  }, [accessToken])

  const handleLogout = async () => { logout(); navigate('/login') }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: '2rem',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{
          marginBottom: '2rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f8fafc', margin: 0 }}>
              DevOps Dashboard
            </h1>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{connected ? 'LIVE' : 'DISCONNECTED'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', cursor: 'default' }}>Dashboard</span>
              <span onClick={() => navigate('/settings')} style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', cursor: 'pointer' }}>Settings</span>
            </nav>
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid #1e293b', color: '#64748b',
              fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0.375rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit',
            }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#ef4444'; (e.target as HTMLButtonElement).style.color = '#ef4444' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#1e293b'; (e.target as HTMLButtonElement).style.color = '#64748b' }}
            >Logout</button>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: '1rem' }}>Activity Feed</h2>
          {events.length === 0 ? (
            <div style={{ color: '#334155', fontSize: '0.875rem', padding: '2rem 0' }}>Waiting for events...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {events.map(event => (
                <div key={event.id} style={{
                  display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem',
                  padding: '0.75rem 1rem', background: '#0f172a',
                  border: '1px solid #1e293b', borderLeft: '3px solid #3b82f6', fontSize: '0.8rem',
                }}>
                  <span style={{ color: '#475569' }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  <span style={{ color: '#cbd5e1' }}>{event.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!workflowsLoading && (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {workflowRuns.length > 0 && (
              <div style={{ flexShrink: 0 }}>
                <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: '1rem' }}>Pipeline Health</h2>
                <PipelineHealth runs={workflowRuns} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: '1rem' }}>CI/CD Runs</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {workflowRuns.map(run => (
                  <a key={run.id} href={run.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '100px 70px 60px 1fr', gap: '0.75rem',
                      padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid #1e293b',
                      borderLeft: `3px solid ${run.conclusion === 'success' ? '#22c55e' : run.conclusion === 'failure' ? '#ef4444' : '#f59e0b'}`,
                      fontSize: '0.8rem', cursor: 'pointer',
                    }}>
                      <span style={{ color: '#475569' }}>{new Date(run.createdAt).toLocaleDateString()}</span>
                      <span style={{
                        color: run.conclusion === 'success' ? '#22c55e' : run.conclusion === 'failure' ? '#ef4444' : '#f59e0b',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{run.conclusion ?? run.status}</span>
                      <span style={{ color: '#475569' }}>{run.duration != null ? `${run.duration}s` : '—'}</span>
                      <span style={{ color: '#cbd5e1' }}>{run.name}</span>
                    </div>
                  </a>
                ))}
              </div>
              
            </div>
          </div>
        )}

        {!commitsLoading && commitActivity.length > 0 && (
          <CommitHeatmap data={commitActivity} />
        )}
        
      </div>
      <ChatWindow />
    </div>
  )
}
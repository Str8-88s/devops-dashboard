import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export default function SettingsPage() {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const { accessToken: authToken, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authToken) return
   fetch('http://localhost:3000/api/repos', {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Cache-Control': 'no-cache',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setOwner(data.owner ?? '')
          setRepo(data.repo ?? '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [authToken])

  const handleSave = async () => {
    if (!owner || !repo) {
      setMessage({ text: 'Owner and repo are required', error: true })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('http://localhost:3000/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ owner, repo, accessToken: accessToken || undefined }),
      })
      if (!res.ok) throw new Error()
      setMessage({ text: 'Repo saved', error: false })
      setAccessToken('')
    } catch {
      setMessage({ text: 'Failed to save', error: true })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setMessage(null)
    try {
      const res = await fetch('http://localhost:3000/api/repos', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!res.ok) throw new Error()
      setOwner('')
      setRepo('')
      setAccessToken('')
      setMessage({ text: 'Repo removed', error: false })
    } catch {
      setMessage({ text: 'Failed to remove', error: true })
    } finally {
      setDeleting(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const inputStyle = {
    background: '#0a0a0f',
    border: '1px solid #1e293b',
    color: '#e2e8f0',
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }

  const labelStyle = {
    fontSize: '0.65rem',
    color: '#475569',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: '0.4rem',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e8f0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#f8fafc',
            margin: 0,
          }}>
            Settings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <span
                onClick={() => navigate('/dashboard')}
                style={{
                  fontSize: '0.75rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#64748b', cursor: 'pointer',
                }}
              >
                Dashboard
              </span>
              <span style={{
                fontSize: '0.75rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#3b82f6', cursor: 'default',
              }}>
                Settings
              </span>
            </nav>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent', border: '1px solid #1e293b',
                color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '0.375rem 0.75rem',
                cursor: 'pointer', fontFamily: 'inherit',
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

        {/* GitHub Repo Config */}
        <div>
          <h2 style={{
            fontSize: '0.7rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#475569', marginBottom: '1rem',
          }}>
            GitHub Repository
          </h2>

          {loading ? (
            <div style={{ color: '#334155', fontSize: '0.875rem' }}>Loading...</div>
          ) : (
            <div style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div>
                <label style={labelStyle}>Owner</label>
                <input
                  style={inputStyle}
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                  placeholder="e.g. Str8-88s"
                  autoComplete="off"
                />
                <input
                  style={inputStyle}
                  value={repo}
                  onChange={e => setRepo(e.target.value)}
                  placeholder="e.g. devops-dashboard"
                  autoComplete="off"
                />
                <input
                  style={inputStyle}
                  type="password"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  placeholder="ghp_..."
                  autoComplete="new-password"
                />
              </div>

              {message && (
                <div style={{
                  fontSize: '0.75rem',
                  color: message.error ? '#ef4444' : '#22c55e',
                  letterSpacing: '0.05em',
                }}>
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: '#3b82f6', border: 'none', color: '#fff',
                    fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '0.5rem 1.25rem', cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                    fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '0.5rem 1.25rem', cursor: deleting ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
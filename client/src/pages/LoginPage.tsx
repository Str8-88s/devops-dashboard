import { useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message ?? 'Login failed')
      return
    }

    login(data.data.accessToken)
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e8f0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#f8fafc',
          marginBottom: '2rem',
        }}>
          DevOps Dashboard
        </h1>

        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          padding: '1.5rem',
        }}>
          <h2 style={{
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#475569',
            marginBottom: '1.5rem',
          }}>
            Sign In
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                fontSize: '0.65rem',
                color: '#475569',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.4rem',
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0a0f',
                  border: '1px solid #1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{
                fontSize: '0.65rem',
                color: '#475569',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.4rem',
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0a0f',
                  border: '1px solid #1e293b',
                  color: '#e2e8f0',
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</div>
            )}

            <button
              onClick={handleSubmit}
              style={{
                background: '#3b82f6',
                border: 'none',
                color: '#fff',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.625rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginTop: '0.5rem',
              }}
            >
              Sign In
            </button>

            <div style={{
              fontSize: '0.7rem',
              color: '#475569',
              textAlign: 'center',
              marginTop: '0.5rem',
            }}>
              No account?{' '}
              <span
                onClick={() => navigate('/register')}
                style={{ color: '#3b82f6', cursor: 'pointer' }}
              >
                Register
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
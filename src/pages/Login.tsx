import { useState } from 'react'
import { useAuth } from '../App'
import { Octokit } from '@octokit/rest'
import { nanoid } from 'nanoid'
import styles from './Login.module.css'

export function Login() {
  const { login } = useAuth()
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate token by fetching user info from GitHub
      const octokit = new Octokit({ auth: token })
      const { data: githubUser } = await octokit.users.getAuthenticated()

      // Store user in database
      if (window.electronAPI) {
        const dbUser = await window.electronAPI.db.upsertUser({
          github_id: githubUser.id,
          username: githubUser.login,
          avatar_url: githubUser.avatar_url,
          access_token: token,
        })

        if (dbUser) {
          // Create session
          const sessionId = nanoid(32)
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

          await window.electronAPI.db.createSession({
            id: sessionId,
            user_id: dbUser.id,
            expires_at: expiresAt,
          })

          // Store session ID in localStorage
          localStorage.setItem('sessionId', sessionId)

          // Update auth context
          login({
            id: dbUser.id,
            githubId: dbUser.github_id,
            username: dbUser.username,
            avatarUrl: dbUser.avatar_url,
          })
        }
      }
    } catch (err) {
      console.error('Login failed:', err)
      setError('Invalid token. Please check your GitHub personal access token.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
          </svg>
        </div>
        <h1 className={styles.title}>GitHub Dashboard</h1>
        <p className={styles.subtitle}>
          Manage and analyze your GitHub repositories
        </p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="token" className={styles.label}>
              Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className={styles.input}
              required
            />
            <p className={styles.hint}>
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Settings
              </a>
              {' '}with <code>repo</code> scope.
            </p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </button>
        </form>
      </div>
    </div>
  )
}

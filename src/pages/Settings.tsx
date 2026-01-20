import { useState } from 'react'
import { useAuth } from '../App'
import styles from './Settings.module.css'

export function Settings() {
  const { user, logout } = useAuth()
  const [showToken, setShowToken] = useState(false)

  const handleExportData = async () => {
    if (!user || !window.electronAPI) return

    try {
      const repos = await window.electronAPI.db.getRepositories(user.id)
      const data = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          username: user.username,
        },
        repositories: repos,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `github-dashboard-export-${user.username}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const handleClearData = async () => {
    if (!user || !window.electronAPI) return

    const confirmed = window.confirm(
      'Are you sure you want to clear all your data? This action cannot be undone.'
    )

    if (confirmed) {
      try {
        // Delete all repositories for this user
        await window.electronAPI.db.query(
          'DELETE FROM repositories WHERE user_id = ?',
          [user.id]
        )
        window.location.reload()
      } catch (error) {
        console.error('Failed to clear data:', error)
      }
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.card}>
          {user && (
            <div className={styles.userInfo}>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className={styles.avatar}
                />
              )}
              <div className={styles.userDetails}>
                <div className={styles.username}>{user.username}</div>
                <div className={styles.userId}>GitHub ID: {user.githubId}</div>
              </div>
            </div>
          )}
          <button onClick={logout} className={styles.dangerButton}>
            Sign Out
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Management</h2>
        <div className={styles.card}>
          <div className={styles.option}>
            <div>
              <h3 className={styles.optionTitle}>Export Data</h3>
              <p className={styles.optionDescription}>
                Download all your repository data as a JSON file.
              </p>
            </div>
            <button onClick={handleExportData} className={styles.button}>
              Export
            </button>
          </div>
          <div className={styles.divider} />
          <div className={styles.option}>
            <div>
              <h3 className={styles.optionTitle}>Clear All Data</h3>
              <p className={styles.optionDescription}>
                Delete all your synced repository data. This cannot be undone.
              </p>
            </div>
            <button onClick={handleClearData} className={styles.dangerButton}>
              Clear Data
            </button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>About</h2>
        <div className={styles.card}>
          <div className={styles.aboutInfo}>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Version</span>
              <span className={styles.aboutValue}>0.1.0</span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Electron</span>
              <span className={styles.aboutValue}>
                {window.electronAPI?.versions?.electron() || 'N/A'}
              </span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Chrome</span>
              <span className={styles.aboutValue}>
                {window.electronAPI?.versions?.chrome() || 'N/A'}
              </span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Node.js</span>
              <span className={styles.aboutValue}>
                {window.electronAPI?.versions?.node() || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

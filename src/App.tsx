import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Repositories } from './pages/Repositories'
import { RepositoryDetail } from './pages/RepositoryDetail'
import { Analysis } from './pages/Analysis'
import { Insights } from './pages/Insights'
import { Issues } from './pages/Issues'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import type { User } from './types/user'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on app load
    const checkSession = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId')
        if (sessionId && window.electronAPI) {
          const session = await window.electronAPI.db.getSession(sessionId)
          if (session) {
            setUser({
              id: session.user_id,
              githubId: session.github_id,
              username: session.username,
              avatarUrl: session.avatar_url,
            })
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId')
      if (sessionId && window.electronAPI) {
        await window.electronAPI.db.deleteSession(sessionId)
      }
      localStorage.removeItem('sessionId')
      setUser(null)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--color-foreground-secondary)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route
            path="/*"
            element={
              user ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/repositories" element={<Repositories />} />
                    <Route path="/repositories/:id" element={<RepositoryDetail />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/issues" element={<Issues />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App

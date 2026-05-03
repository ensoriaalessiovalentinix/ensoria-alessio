import React, { useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login', { replace: true })
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) return <LoadingSpinner size="lg" />
  if (!isAuthenticated) return null

  return <Outlet />
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleNavigate = (path: string) => navigate(path)
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <Sidebar currentPath={location.pathname} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={user?.name || 'User'} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

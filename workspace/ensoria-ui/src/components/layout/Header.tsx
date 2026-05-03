import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'

const navItems = [
  { icon: '🏠', label: 'Dashboard', path: '/' },
  { icon: '👤', label: 'People', path: '/people' },
  { icon: '📊', label: 'Projects', path: '/projects' },
]

const menuItems = [
  { icon: '👤', label: 'Profile', path: '/profile' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

export function Header({
  userName,
  onLogout,
  currentPath,
  onNavigate,
}: {
  userName: string
  onLogout: () => void
  currentPath: string
  onNavigate: (p: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-14 border-b border-[#2a2a3a] bg-[#13131a] flex items-center justify-between px-4 shrink-0">
      {/* Left: brand + nav */}
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-violet-400 whitespace-nowrap">Ensoria OS</span>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-[#9898b0] hover:text-[#e4e4ec] hover:bg-[#1a1a24]',
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right: user menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[#e4e4ec] hover:bg-[#1a1a24] transition-colors"
        >
          <span>{userName}</span>
          <span className={cn('text-[10px] transition-transform', menuOpen && 'rotate-180')}>▼</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg shadow-lg py-1 z-50">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#e4e4ec] hover:bg-violet-600/20 transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="border-t border-[#2a2a3a] my-1" />
            <button
              onClick={() => {
                onLogout()
                setMenuOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#9898b0] hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

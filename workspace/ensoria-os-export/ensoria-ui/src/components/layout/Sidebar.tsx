import React from 'react'
import { cn } from '../../lib/utils'

const items = [
  { icon: '🏠', label: 'Dashboard', path: '/' },
  { icon: '👤', label: 'People', path: '/people' },
  { icon: '📊', label: 'Projects', path: '/projects' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

export function Sidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate: (p: string) => void }) {
  return (
    <aside className="w-56 border-r border-[#2a2a3a] bg-[#13131a] flex flex-col py-4">
      <nav className="flex-1 space-y-1 px-2 pt-4">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              currentPath === item.path
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-[#9898b0] hover:text-[#e4e4ec] hover:bg-[#1a1a24]',
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

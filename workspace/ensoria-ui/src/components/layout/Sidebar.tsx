import React from 'react'
import { cn } from '../../lib/utils'

const items = [
  { icon: '🏠', label: 'Dashboard', path: '/' },
  { icon: '👤', label: 'People', path: '/people' },
  { icon: '📊', label: 'Projects', path: '/projects' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
]

export function Sidebar({
  currentPath,
  onNavigate,
  isOpen,
  onClose,
}: {
  currentPath: string
  onNavigate: (p: string) => void
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed md:relative z-50 h-full w-56 border-r border-[#2a2a3a] bg-[#13131a] flex flex-col py-4 transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          // When closed on desktop, take 0 width
          !isOpen && 'md:w-0 md:overflow-hidden md:border-r-0',
        )}
      >
        <nav className="flex-1 space-y-1 px-2 pt-4">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                onNavigate(item.path)
                onClose()
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
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
    </>
  )
}

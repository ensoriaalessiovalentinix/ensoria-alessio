import React from 'react'
import { cn } from '../../lib/utils'

export function Tabs({
  value,
  onChange,
  tabs,
}: {
  value: string
  onChange: (v: string) => void
  tabs: { value: string; label: string }[]
}) {
  return (
    <div className="flex gap-1 border-b border-[#2a2a3a] pb-px">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors rounded-t-lg',
            value === tab.value
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-[#9898b0] hover:text-[#e4e4ec]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

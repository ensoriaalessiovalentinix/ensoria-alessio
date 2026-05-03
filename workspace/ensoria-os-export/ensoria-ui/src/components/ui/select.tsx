import React from 'react'
import { cn } from '../../lib/utils'

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  className?: string
}) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-[#2a2a3a] bg-[#13131a] px-3 py-2 text-sm text-[#e4e4ec] focus:outline-none focus:border-violet-500 transition-colors',
        className,
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

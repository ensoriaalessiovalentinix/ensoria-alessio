import React from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-[#2a2a3a] bg-[#13131a] px-3 py-2 text-sm text-[#e4e4ec] placeholder:text-[#9898b0] focus:outline-none focus:border-violet-500 transition-colors',
        className,
      )}
      {...props}
    />
  )
}

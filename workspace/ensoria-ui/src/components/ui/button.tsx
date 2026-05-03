import React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-violet-600 text-white hover:bg-violet-500': variant === 'default',
          'bg-violet-600/20 text-violet-300 hover:bg-violet-600/30': variant === 'secondary',
          'border border-[#2a2a3a] text-[#e4e4ec] hover:bg-[#1a1a24]': variant === 'outline',
          'text-[#9898b0] hover:text-[#e4e4ec] hover:bg-[#1a1a24]': variant === 'ghost',
          'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30': variant === 'danger',
          'text-sm px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-5 py-2.5': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${sz[size]} animate-spin rounded-full border-2 border-violet-500 border-t-transparent`} />
    </div>
  )
}

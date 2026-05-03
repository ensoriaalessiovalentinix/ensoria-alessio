export function EmptyState({ message = 'No data yet' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[#9898b0]">
      <span className="text-3xl mb-2">📭</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}

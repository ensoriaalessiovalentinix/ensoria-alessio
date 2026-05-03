export function ErrorMessage({ message = 'Something went wrong' }: { message?: string }) {
  return (
    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
      {message}
    </div>
  )
}

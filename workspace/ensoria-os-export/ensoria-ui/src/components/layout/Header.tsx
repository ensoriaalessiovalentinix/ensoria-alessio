import { Button } from '../ui/button'

export function Header({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  return (
    <header className="h-14 border-b border-[#2a2a3a] bg-[#13131a] flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-violet-400">Ensoria OS</span>
        <span className="text-xs text-[#9898b0]">/local</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#e4e4ec]">{userName}</span>
        <Button variant="ghost" size="sm" onClick={onLogout}>Logout</Button>
      </div>
    </header>
  )
}

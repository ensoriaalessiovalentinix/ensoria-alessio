import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { EmptyState } from '../components/shared/EmptyState'
import { ErrorMessage } from '../components/shared/ErrorMessage'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const navigate = useNavigate()

  if (isLoading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage message="Failed to load dashboard" />
  if (!data) return <EmptyState />

  const { metrics, stageDistribution, recentActivity, projectsByStage } = data

  const metricCards = [
    { label: 'Total People', value: metrics.totalPeople, icon: '👤', color: 'text-blue-400' },
    { label: 'Active Projects', value: metrics.totalProjects, icon: '📊', color: 'text-green-400' },
    { label: 'Pipeline Value', value: `€${metrics.pipelineValue.toLocaleString()}`, icon: '💰', color: 'text-amber-400' },
    { label: 'Win Rate', value: `${Math.round(metrics.winRate * 100)}%`, icon: '🎯', color: 'text-rose-400' },
  ]

  const stageColors: Record<string, string> = {
    Contact: 'bg-blue-500/20 text-blue-300',
    Opportunity: 'bg-amber-500/20 text-amber-300',
    Proposal: 'bg-violet-500/20 text-violet-300',
    Implementation: 'bg-cyan-500/20 text-cyan-300',
    Onboarding: 'bg-green-500/20 text-green-300',
    Live: 'bg-emerald-500/20 text-emerald-300',
    Validated: 'bg-purple-500/20 text-purple-300',
  }

  const stageOrder = ['Contact', 'Opportunity', 'Proposal', 'Implementation', 'Onboarding', 'Live', 'Validated']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#e4e4ec]">Dashboard</h1>
        <p className="text-sm text-[#9898b0]">Pipeline overview and key metrics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#9898b0] uppercase tracking-wider">{m.label}</p>
                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              </div>
              <span className="text-2xl">{m.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Pipeline Kanban */}
      <div>
        <h2 className="text-lg font-semibold text-[#e4e4ec] mb-3">Pipeline</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stageOrder.map((stage) => {
            const projects = (projectsByStage as Record<string, unknown[]>)[stage] || []
            return (
              <div key={stage} className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={stageColors[stage] || 'bg-gray-500/20 text-gray-300'}>
                    {stage}
                  </Badge>
                  <span className="text-xs text-[#9898b0]">{projects.length}</span>
                </div>
                <div className="space-y-2">
                  {(projects as { id: string; name: string; value?: number | null; people?: { name: string } | null }[]).map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 cursor-pointer hover:border-violet-500/50 transition-colors"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <p className="text-sm font-medium text-[#e4e4ec] truncate">{p.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[#9898b0]">{p.people?.name || '—'}</span>
                        <span className="text-xs font-medium text-green-400">
                          {p.value != null ? `€${p.value.toLocaleString()}` : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity Feed */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#e4e4ec]">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.length === 0 && <p className="text-sm text-[#9898b0]">No recent activity</p>}
          {recentActivity.map((a) => (
            <div key={a.id} className="flex items-start gap-3 text-sm border-b border-[#2a2a3a] pb-2 last:border-0">
              <span className="text-lg">
                {a.type === 'created' ? '✨' : a.type === 'stage_changed' ? '🔄' : '📝'}
              </span>
              <div className="flex-1">
                <p className="text-[#e4e4ec]">{a.description}</p>
                <p className="text-xs text-[#9898b0] mt-0.5">
                  {a.peopleName ? `${a.peopleName} · ` : ''}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useCreateProject, useChangeProjectStage, useDeleteProject } from '../hooks/useProjects'
import { usePeople } from '../hooks/usePeople'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Dialog } from '../components/ui/dialog'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { EmptyState } from '../components/shared/EmptyState'
import { ErrorMessage } from '../components/shared/ErrorMessage'

const stageColors: Record<string, string> = {
  Contact: 'border-t-blue-500',
  Opportunity: 'border-t-amber-500',
  Proposal: 'border-t-violet-500',
  Implementation: 'border-t-cyan-500',
  Onboarding: 'border-t-green-500',
  Live: 'border-t-emerald-500',
  Validated: 'border-t-purple-500',
}

const stageBadgeColors: Record<string, string> = {
  Contact: 'bg-blue-500/20 text-blue-300',
  Opportunity: 'bg-amber-500/20 text-amber-300',
  Proposal: 'bg-violet-500/20 text-violet-300',
  Implementation: 'bg-cyan-500/20 text-cyan-300',
  Onboarding: 'bg-green-500/20 text-green-300',
  Live: 'bg-emerald-500/20 text-emerald-300',
  Validated: 'bg-purple-500/20 text-purple-300',
}

/** Sub-status colors for within-stage breakdown */
const subStatusColors: Record<string, string> = {
  'Proposal Preparation': 'border-l-violet-400',
  'Proposal Accepted': 'border-l-indigo-400',
  'Waiting for Contract & Payment': 'border-l-fuchsia-400',
}

const subStatusBadgeColors: Record<string, string> = {
  'Proposal Preparation': 'bg-violet-500/15 text-violet-300',
  'Proposal Accepted': 'bg-indigo-500/15 text-indigo-300',
  'Waiting for Contract & Payment': 'bg-fuchsia-500/15 text-fuchsia-300',
}

const stageOrder = ['Contact', 'Opportunity', 'Proposal', 'Implementation', 'Onboarding', 'Live', 'Validated']

export default function ProjectsPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const navigate = useNavigate()

  const { data: projects, isLoading, error } = useProjects()
  const { data: people } = usePeople()
  const createMutation = useCreateProject()
  const stageMutation = useChangeProjectStage()
  const deleteMutation = useDeleteProject()

  const peopleByName = new Map((people || []).map((p) => [p.id, p.name]))

  const groupedProjects: Record<string, any[]> = {}
  for (const p of (projects || [])) {
    if (!groupedProjects[p.stage]) groupedProjects[p.stage] = []
    groupedProjects[p.stage].push(p)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this project?')) await deleteMutation.mutateAsync(id)
  }

  // ── Drag & Drop handlers ──
  const [dragOverSub, setDragOverSub] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, projectId: string, currentStage: string, currentSub?: string | null) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: projectId, stage: currentStage, subStatus: currentSub }))
    e.dataTransfer.effectAllowed = 'move'
    const el = e.currentTarget as HTMLElement
    requestAnimationFrame(() => { el.style.opacity = '0.5' })
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '1'
    setDragOverStage(null)
    setDragOverSub(null)
  }

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stage)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if actually leaving the column, not entering a child
    const related = e.relatedTarget as HTMLElement | null
    const col = e.currentTarget as HTMLElement
    if (!col.contains(related)) {
      setDragOverStage(null)
      setDragOverSub(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetStage: string, targetSub?: string) => {
    e.preventDefault()
    setDragOverStage(null)
    setDragOverSub(null)

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (data.stage !== targetStage) {
        await stageMutation.mutateAsync({ id: data.id, stage: targetStage })
      } else if (targetSub && data.subStatus !== targetSub) {
        // Same stage, different sub-status
        await stageMutation.mutateAsync({ id: data.id, stage: targetStage })
        // Then update subStatus via REST (the PATCH above cleared it)
        const res = await fetch(`/api/projects/${data.id}/substatus`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subStatus: targetSub }),
        })
        if (!res.ok) console.error('Sub-status update failed')
      }
    } catch (err) {
      console.error('Drop failed:', err)
    }
  }

  // Sub-status zones for Proposal column
  const proposalSubStatuses = ['Proposal Preparation', 'Proposal Accepted', 'Waiting for Contract & Payment']

  const getProjectsBySub = (projList: any[], sub: string) =>
    projList.filter((p) => p.subStatus === sub)
  const getProjectsWithoutSub = (projList: any[]) =>
    projList.filter((p) => !p.subStatus)

  if (isLoading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#e4e4ec]">Projects</h1>
        <Button onClick={() => setShowDialog(true)}>+ New Project</Button>
      </div>

      {(!projects || projects.length === 0) && <EmptyState message="No projects yet" />}

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
        {stageOrder.map((stage) => {
          const stageProjects = groupedProjects[stage] || []
          const isDragOver = dragOverStage === stage
          const isProposal = stage === 'Proposal'

          const colContent = isProposal ? (
            // ── Proposal column with sub-status zones ──
            <div className="space-y-1 px-2 pb-2 min-h-[60px]">
              {/* Projects without sub-status */}
              {getProjectsWithoutSub(stageProjects).map((p) => (
                <ProjectCard
                  key={p.id} p={p} peopleByName={peopleByName}
                  onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                  onDelete={handleDelete} onNavigate={navigate}
                  stageColors={stageColors} stage={stage}
                />
              ))}

              {/* Sub-status zones */}
              {proposalSubStatuses.map((sub) => {
                const subProjs = getProjectsBySub(stageProjects, sub)
                const isSubOver = dragOverSub === sub
                return (
                  <div
                    key={sub}
                    className={`rounded-md transition-colors duration-150 ${
                      isSubOver ? 'bg-violet-500/10 ring-1 ring-violet-500/30' : ''
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverSub(sub) }}
                    onDragLeave={() => setDragOverSub(null)}
                    onDrop={(e) => handleDrop(e, stage, sub)}
                  >
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${subStatusBadgeColors[sub] || ''}`}>
                        {sub}
                      </span>
                      <span className="text-[10px] text-[#9898b0]">{subProjs.length}</span>
                    </div>
                    <div className="space-y-1.5 px-1 pb-1.5 min-h-[32px]">
                      {subProjs.map((p) => (
                        <ProjectCard
                          key={p.id} p={p} peopleByName={peopleByName}
                          onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                          onDelete={handleDelete} onNavigate={navigate}
                          stageColors={subStatusColors} stage={stage}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // ── Other columns — flat list ──
            <div className="space-y-2 px-2 pb-2 min-h-[60px]">
              {stageProjects.map((p) => (
                <ProjectCard
                  key={p.id} p={p} peopleByName={peopleByName}
                  onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                  onDelete={handleDelete} onNavigate={navigate}
                  stageColors={stageColors} stage={stage}
                />
              ))}
            </div>
          )

          return (
            <div
              key={stage}
              className={`min-w-[260px] flex-shrink-0 rounded-lg transition-colors duration-150 ${
                isDragOver ? 'bg-violet-500/10 ring-2 ring-violet-500/40' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-2 px-3 pt-2">
                <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${stageBadgeColors[stage] || ''}`}>
                  {stage}
                </span>
                <span className="text-xs text-[#9898b0]">{stageProjects.length}</span>
              </div>
              {colContent}
            </div>
          )
        })}
      </div>

      <ProjectFormDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        people={people || []}
        onSave={async (data) => {
          await createMutation.mutateAsync(data)
          setShowDialog(false)
        }}
        loading={createMutation.isPending}
      />
    </div>
  )
}

// ── Project Card component ────────────────────────
function ProjectCard({ p, peopleByName, onDragStart, onDragEnd, onDelete, onNavigate, stageColors }: {
  p: any
  peopleByName: Map<string, string>
  onDragStart: (e: React.DragEvent, id: string, stage: string, subStatus?: string | null) => void
  onDragEnd: (e: React.DragEvent) => void
  onDelete: (id: string) => void
  onNavigate: (path: string) => void
  stageColors: Record<string, string>
  stage: string
}) {
  const borderColor = stageColors[p.subStatus] || stageColors[p.stage] || ''
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, p.id, p.stage, p.subStatus)}
      onDragEnd={onDragEnd}
      className={`bg-[#1a1a24] rounded-lg border border-[#2a2a3a] border-t-2 ${borderColor} p-3 cursor-grab active:cursor-grabbing hover:border-violet-500/50 transition-colors select-none`}
      onClick={() => onNavigate(`/projects/${p.id}`)}
    >
      <p className="text-sm font-medium text-[#e4e4ec] truncate">{p.name}</p>
      <p className="text-xs text-[#9898b0] mt-1">{peopleByName.get(p.peopleId) || '—'}</p>
      <div className="flex items-center justify-between mt-2">
        {p.value != null && (
          <span className="text-xs font-medium text-green-400">€{p.value.toLocaleString()}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={(e) => { e.stopPropagation(); onDelete(p.id) }}
        >
          🗑️
        </Button>
      </div>
    </div>
  )
}

function ProjectFormDialog({
  open, onClose, people, onSave, loading,
}: {
  open: boolean
  onClose: () => void
  people: { id: string; name: string }[]
  onSave: (data: { name: string; peopleId: string; value?: number | null; stage?: string }) => void
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [peopleId, setPeopleId] = useState(people[0]?.id || '')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('Contact')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, peopleId, value: value ? parseFloat(value) : null, stage })
  }

  return (
    <Dialog open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select value={peopleId} onChange={setPeopleId} options={people.map((p) => ({ label: p.name, value: p.id }))} />
        <Input placeholder="Value (€)" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        <Select value={stage} onChange={setStage} options={stageOrder.map((s) => ({ label: s, value: s }))} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>Create</Button>
        </div>
      </form>
    </Dialog>
  )
}

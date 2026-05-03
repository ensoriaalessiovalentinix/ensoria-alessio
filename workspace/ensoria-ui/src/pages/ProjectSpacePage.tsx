import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject, useChangeProjectStage } from '../hooks/useProjects'
import { useConversations, useCreateConversation } from '../hooks/useConversations'
import { useRequirements, useCreateRequirement, useUpdateRequirement, useDeleteRequirement } from '../hooks/useRequirements'
import { useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '../hooks/useMilestones'
import { useCollaborators, useAddCollaborator, useRemoveCollaborator } from '../hooks/useCollaborators'
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/usePlans'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { Tabs } from '../components/ui/tabs'
import { Dialog } from '../components/ui/dialog'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { EmptyState } from '../components/shared/EmptyState'
import { ErrorMessage } from '../components/shared/ErrorMessage'

const stageBadgeColors: Record<string, string> = {
  Contact: 'bg-blue-500/20 text-blue-300',
  Opportunity: 'bg-amber-500/20 text-amber-300',
  Proposal: 'bg-violet-500/20 text-violet-300',
  Implementation: 'bg-cyan-500/20 text-cyan-300',
  Onboarding: 'bg-green-500/20 text-green-300',
  Live: 'bg-emerald-500/20 text-emerald-300',
  Validated: 'bg-purple-500/20 text-purple-300',
}

const subStatusBadgeColors: Record<string, string> = {
  'Proposal Preparation': 'bg-violet-500/15 text-violet-300',
  'Proposal Accepted': 'bg-indigo-500/15 text-indigo-300',
  'Waiting for Contract & Payment': 'bg-fuchsia-500/15 text-fuchsia-300',
}

const proposalSubStatuses = ['Proposal Preparation', 'Proposal Accepted', 'Waiting for Contract & Payment']

const stageOrder = ['Contact', 'Opportunity', 'Proposal', 'Implementation', 'Onboarding', 'Live', 'Validated']

export default function ProjectSpacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('conversations')

  const { data: project, isLoading, error } = useProject(id!)
  const stageMutation = useChangeProjectStage()
  const [subStatus, setSubStatus] = useState('')

  // Sync sub-status from project data
  React.useEffect(() => {
    if (project?.subStatus) setSubStatus(project.subStatus)
    else setSubStatus('')
  }, [project?.subStatus, project?.stage])

  const handleSubStatusChange = async (newSub: string) => {
    setSubStatus(newSub)
    try {
      const token = localStorage.getItem('ensoria_token')
      const res = await fetch(`/api/projects/${project!.id}/substatus`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subStatus: newSub }),
      })
      if (!res.ok) console.error('Sub-status update failed')
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage />
  if (!project) return null

  const tabs = [
    { value: 'conversations', label: '💬 Conversations' },
    { value: 'files', label: '📎 Files' },
    { value: 'requirements', label: '📋 Requirements' },
    { value: 'roadmap', label: '🗺️ Roadmap' },
    { value: 'collaborators', label: '👥 Collaborators' },
    { value: 'plans', label: '📐 Plans' },
  ]

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/projects')}>← Back to Projects</Button>

      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e4e4ec]">{project.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-[#9898b0]">{project.people?.name || '—'}</span>
            {project.value != null && (
              <span className="text-sm font-medium text-green-400">€{project.value.toLocaleString()}</span>
            )}
          </div>
          {/* Sub-status badge */}
          {project.stage === 'Proposal' && project.subStatus && (
            <span className={`inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded ${subStatusBadgeColors[project.subStatus] || ''}`}>
              {project.subStatus}
            </span>
          )}
        </div>
        <div className="flex items-start gap-2">
          <Select
            value={project.stage}
            onChange={(stage) => stageMutation.mutate({ id: project.id, stage })}
            options={stageOrder.map((s) => ({ label: s, value: s }))}
            className="w-44"
          />
          {/* Sub-status selector when in Proposal */}
          {project.stage === 'Proposal' && (
            <Select
              value={subStatus}
              onChange={handleSubStatusChange}
              options={[
                { label: '(no sub-status)', value: '' },
                ...proposalSubStatuses.map((s) => ({ label: s, value: s })),
              ]}
              className="w-52"
            />
          )}
        </div>
      </div>
      {project.description && (
        <p className="text-sm text-[#9898b0]">{project.description}</p>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} tabs={tabs} />

      <div className="pt-2">
        {activeTab === 'conversations' && <ConversationsTab projectId={project.id} />}
        {activeTab === 'files' && <FilesTab projectId={project.id} />}
        {activeTab === 'requirements' && <RequirementsTab projectId={project.id} />}
        {activeTab === 'roadmap' && <RoadmapTab projectId={project.id} />}
        {activeTab === 'collaborators' && <CollaboratorsTab projectId={project.id} />}
        {activeTab === 'plans' && <PlansTab projectId={project.id} />}
      </div>
    </div>
  )
}

/* ── Conversations Tab ── */
function ConversationsTab({ projectId }: { projectId: string }) {
  const { data: convs, isLoading } = useConversations(projectId)
  const createMutation = useCreateConversation()
  const [content, setContent] = useState('')
  const [channel, setChannel] = useState('manual')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await createMutation.mutateAsync({ projectId, channel, direction: 'inbound', content })
    setContent('')
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Select value={channel} onChange={setChannel} options={[
          { label: 'Manual', value: 'manual' }, { label: 'Email', value: 'email' },
          { label: 'WhatsApp', value: 'whatsapp' }, { label: 'Webchat', value: 'webchat' },
          { label: 'Social', value: 'social' }, { label: 'Gmail', value: 'gmail' },
        ]} className="w-32" />
        <Input
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <Button type="submit" disabled={createMutation.isPending}>Send</Button>
      </form>
      <div className="space-y-2">
        {(!convs || convs.length === 0) && <EmptyState message="No conversations yet" />}
        {convs?.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start gap-2">
              <Badge className={c.direction === 'inbound' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}>
                {c.direction}
              </Badge>
              <Badge className="bg-gray-500/20 text-gray-300">{c.channel}</Badge>
              <div className="flex-1">
                {c.subject && <p className="text-xs font-medium text-[#9898b0]">{c.subject}</p>}
                <p className="text-sm text-[#e4e4ec] mt-1">{c.content}</p>
                <p className="text-xs text-[#9898b0] mt-1">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ── Files Tab ── */
function FilesTab({ projectId }: { projectId: string }) {
  const { data: files, isLoading } = useProject(projectId)
  if (isLoading) return <LoadingSpinner />
  const fileList = (files as { files?: { id: string; name: string; url: string; type: string; createdAt: string }[] } | undefined)?.files
  if (!fileList || fileList.length === 0) return <EmptyState message="No files yet" />
  return (
    <div className="space-y-2">
      {fileList.map((f) => (
        <Card key={f.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#e4e4ec]">{f.name}</p>
              <p className="text-xs text-[#9898b0]">{f.type} · {new Date(f.createdAt).toLocaleDateString()}</p>
            </div>
            <Badge className="bg-gray-500/20 text-gray-300">{f.type}</Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}

/* ── Requirements Tab ── */
function RequirementsTab({ projectId }: { projectId: string }) {
  const { data: reqs, isLoading } = useRequirements(projectId)
  const createMutation = useCreateRequirement()
  const updateMutation = useUpdateRequirement()
  const deleteMutation = useDeleteRequirement()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('requirement')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync({ projectId, title, category })
    setTitle('')
    setShowForm(false)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setShowForm(!showForm)}>+ Add Requirement</Button>
      {showForm && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Requirement title" required />
          <Select value={category} onChange={setCategory} options={[
            { label: 'Need', value: 'need' }, { label: 'Goal', value: 'goal' }, { label: 'Requirement', value: 'requirement' },
          ]} className="w-32" />
          <Button type="submit" disabled={createMutation.isPending}>Add</Button>
        </form>
      )}
      {(!reqs || reqs.length === 0) && <EmptyState message="No requirements yet" />}
      {reqs?.map((r) => (
        <Card key={r.id}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#e4e4ec]">{r.title}</p>
                <Badge className={r.status === 'met' ? 'bg-green-500/20 text-green-300' : r.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'}>
                  {r.status}
                </Badge>
              </div>
              <p className="text-xs text-[#9898b0] mt-1">{r.category} · {r.priority} priority</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ projectId, id: r.id })}>🗑️</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

/* ── Roadmap Tab (Milestones) ── */
function RoadmapTab({ projectId }: { projectId: string }) {
  const { data: milestones, isLoading } = useMilestones(projectId)
  const createMutation = useCreateMilestone()
  const updateMutation = useUpdateMilestone()
  const deleteMutation = useDeleteMilestone()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync({ projectId, title })
    setTitle('')
    setShowForm(false)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setShowForm(!showForm)}>+ Add Milestone</Button>
      {showForm && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title" required />
          <Button type="submit" disabled={createMutation.isPending}>Add</Button>
        </form>
      )}
      {(!milestones || milestones.length === 0) && <EmptyState message="No milestones yet" />}
      {milestones?.map((m) => {
        const total = milestones.length
        const completed = milestones.filter((x) => x.status === 'completed').length
        return (
          <Card key={m.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#e4e4ec]">{m.title}</p>
                  <Badge className={
                    m.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                    m.status === 'in-progress' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-gray-500/20 text-gray-300'
                  }>
                    {m.status}
                  </Badge>
                </div>
                {m.dueDate && <p className="text-xs text-[#9898b0] mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</p>}
              </div>
              <Select
                value={m.status}
                onChange={(status) => updateMutation.mutate({ projectId, id: m.id, status })}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'In Progress', value: 'in-progress' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Cancelled', value: 'cancelled' },
                ]}
                className="w-32"
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}

/* ── Collaborators Tab ── */
function CollaboratorsTab({ projectId }: { projectId: string }) {
  const { data: collabs, isLoading } = useCollaborators(projectId)
  const addMutation = useAddCollaborator()
  const removeMutation = useRemoveCollaborator()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await addMutation.mutateAsync({ projectId, name, role: role || undefined })
    setName('')
    setRole('')
    setShowForm(false)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setShowForm(!showForm)}>+ Add Collaborator</Button>
      {showForm && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
          <Button type="submit" disabled={addMutation.isPending}>Add</Button>
        </form>
      )}
      {(!collabs || collabs.length === 0) && <EmptyState message="No collaborators yet" />}
      {collabs?.map((c) => (
        <Card key={c.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#e4e4ec]">{c.name}</p>
              {c.role && <p className="text-xs text-[#9898b0]">{c.role}</p>}
            </div>
            <Button variant="danger" size="sm" onClick={() => removeMutation.mutate({ projectId, id: c.id })}>Remove</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

/* ── Plans Tab ── */
function PlansTab({ projectId }: { projectId: string }) {
  const { data: plans, isLoading } = usePlans(projectId)
  const createMutation = useCreatePlan()
  const updateMutation = useUpdatePlan()
  const deleteMutation = useDeletePlan()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync({ projectId, title, content })
    setTitle('')
    setContent('')
    setShowForm(false)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setShowForm(!showForm)}>+ New Plan</Button>
      {showForm && (
        <form onSubmit={handleCreate} className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Plan title" required />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content (markdown)" rows={4} />
          <Button type="submit" disabled={createMutation.isPending}>Save</Button>
        </form>
      )}
      {(!plans || plans.length === 0) && <EmptyState message="No plans yet" />}
      {plans?.map((p) => (
        <Card key={p.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#e4e4ec]">{p.title}</p>
                <Badge className="bg-violet-500/20 text-violet-300">v{p.version}</Badge>
              </div>
              <p className="text-sm text-[#e4e4ec] mt-2 whitespace-pre-wrap">{p.content}</p>
              <p className="text-xs text-[#9898b0] mt-2">{new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate({ projectId, id: p.id })}>🗑️</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

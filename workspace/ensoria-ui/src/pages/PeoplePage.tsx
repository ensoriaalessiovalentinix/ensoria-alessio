import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePeople, useCreatePeople, useUpdatePeople, useDeletePeople, useChangePeopleStage, type People } from '../hooks/usePeople'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/dialog'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { EmptyState } from '../components/shared/EmptyState'
import { ErrorMessage } from '../components/shared/ErrorMessage'

const stageColors: Record<string, string> = {
  Contact: 'bg-blue-500/20 text-blue-300',
  Opportunity: 'bg-amber-500/20 text-amber-300',
  Client: 'bg-green-500/20 text-green-300',
  'Recurring Client': 'bg-purple-500/20 text-purple-300',
}

const typeOptions = [
  { label: 'All types', value: '' },
  { label: 'Staff', value: 'staff' },
  { label: 'Partner', value: 'partner' },
  { label: 'Freelancer', value: 'freelancer' },
  { label: 'Company', value: 'company' },
  { label: 'Investor', value: 'investor' },
]

const stageOptions = [
  { label: 'All stages', value: '' },
  { label: 'Contact', value: 'Contact' },
  { label: 'Opportunity', value: 'Opportunity' },
  { label: 'Client', value: 'Client' },
  { label: 'Recurring Client', value: 'Recurring Client' },
]

export default function PeoplePage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editPerson, setEditPerson] = useState<People | null>(null)
  const navigate = useNavigate()

  const { data: people, isLoading, error } = usePeople({ type: typeFilter || undefined, stage: stageFilter || undefined, search: search || undefined })
  const createMutation = useCreatePeople()
  const updateMutation = useUpdatePeople()
  const deleteMutation = useDeletePeople()
  const stageMutation = useChangePeopleStage()

  const handleSave = async (formData: Partial<People>) => {
    if (editPerson) {
      await updateMutation.mutateAsync({ id: editPerson.id, ...formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setShowDialog(false)
    setEditPerson(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this person?')) await deleteMutation.mutateAsync(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#e4e4ec]">People</h1>
        <Button onClick={() => { setEditPerson(null); setShowDialog(true) }}>+ Add Person</Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onChange={setTypeFilter} options={typeOptions} className="w-36" />
        <Select value={stageFilter} onChange={setStageFilter} options={stageOptions} className="w-44" />
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage />}
      {people && people.length === 0 && <EmptyState message="No people found" />}

      {people && people.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <button className="text-violet-400 hover:underline" onClick={() => navigate(`/people/${p.id}`)}>
                    {p.name}
                  </button>
                </TableCell>
                <TableCell><span className="text-xs text-[#9898b0] capitalize">{p.type}</span></TableCell>
                <TableCell>
                  <Select
                    value={p.stage}
                    onChange={(stage) => stageMutation.mutate({ id: p.id, stage })}
                    options={[
                      { label: 'Contact', value: 'Contact' },
                      { label: 'Opportunity', value: 'Opportunity' },
                      { label: 'Client', value: 'Client' },
                      { label: 'Recurring Client', value: 'Recurring Client' },
                    ]}
                    className="w-36"
                  />
                </TableCell>
                <TableCell className="text-[#9898b0]">{p.email || '—'}</TableCell>
                <TableCell className="text-[#9898b0]">{p.company || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditPerson(p); setShowDialog(true) }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PeopleFormDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditPerson(null) }}
        onSave={handleSave}
        person={editPerson}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}

function PeopleFormDialog({
  open, onClose, onSave, person, loading,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<People>) => void
  person: People | null
  loading: boolean
}) {
  const [name, setName] = useState(person?.name || '')
  const [type, setType] = useState(person?.type || 'client')
  const [email, setEmail] = useState(person?.email || '')
  const [phone, setPhone] = useState(person?.phone || '')
  const [company, setCompany] = useState(person?.company || '')
  const [stage, setStage] = useState(person?.stage || 'Contact')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, type, email: email || null, phone: phone || null, company: company || null, stage })
  }

  return (
    <Dialog open={open} onClose={onClose} title={person ? 'Edit Person' : 'Add Person'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select value={type} onChange={setType} options={[
          { label: 'Staff', value: 'staff' }, { label: 'Partner', value: 'partner' },
          { label: 'Freelancer', value: 'freelancer' }, { label: 'Company', value: 'company' },
          { label: 'Investor', value: 'investor' },
        ]} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Select value={stage} onChange={setStage} options={[
          { label: 'Contact', value: 'Contact' }, { label: 'Opportunity', value: 'Opportunity' },
          { label: 'Client', value: 'Client' }, { label: 'Recurring Client', value: 'Recurring Client' },
        ]} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : person ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import { usePerson } from '../hooks/usePeople'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { ErrorMessage } from '../components/shared/ErrorMessage'

const stageColors: Record<string, string> = {
  Contact: 'bg-blue-500/20 text-blue-300',
  Opportunity: 'bg-amber-500/20 text-amber-300',
  Client: 'bg-green-500/20 text-green-300',
  'Recurring Client': 'bg-purple-500/20 text-purple-300',
}

export default function PeopleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: person, isLoading, error } = usePerson(id!)

  if (isLoading) return <LoadingSpinner size="lg" />
  if (error) return <ErrorMessage />
  if (!person) return null

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/people')}>← Back to People</Button>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#e4e4ec]">{person.name}</h1>
            <p className="text-sm text-[#9898b0] capitalize mt-1">{person.type}</p>
          </div>
          <Badge className={stageColors[person.stage] || ''}>{person.stage}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-xs text-[#9898b0] uppercase tracking-wider">Email</p>
            <p className="text-sm text-[#e4e4ec]">{person.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#9898b0] uppercase tracking-wider">Phone</p>
            <p className="text-sm text-[#e4e4ec]">{person.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#9898b0] uppercase tracking-wider">Company</p>
            <p className="text-sm text-[#e4e4ec]">{person.company || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#9898b0] uppercase tracking-wider">Member Since</p>
            <p className="text-sm text-[#e4e4ec]">{new Date(person.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {person.projects && person.projects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#e4e4ec] mb-3">Projects ({person.projects.length})</h2>
          <div className="grid grid-cols-2 gap-3">
            {person.projects.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div>
                    <p className="text-sm font-medium text-violet-400 hover:underline">{p.name}</p>
                    <Badge className="bg-blue-500/20 text-blue-300 mt-2">{p.stage}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

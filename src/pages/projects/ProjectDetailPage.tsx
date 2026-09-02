import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Project, Task, ActivityLog, Profile, ProjectMember } from '@/types'
import {
  TIPO_SERVICO_LABELS,
  STATUS_PROJETO_LABELS,
  STATUS_TAREFA_LABELS,
  PRIORIDADE_LABELS,
  statusTarefaOptions,
  prioridadeOptions,
  statusProjetoOptions,
} from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner, StatusBadge } from '@/components/ui/Shared'
import { ArrowLeft, Plus, Save, Calendar, DollarSign } from 'lucide-react'

export function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<(ProjectMember & { profiles: Profile })[]>([])
  const [logs, setLogs] = useState<(ActivityLog & { profiles: Profile })[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const fetchAll = useCallback(async () => {
    const [projRes, tasksRes, membersRes, logsRes, profilesRes] = await Promise.all([
      supabase.from('projects').select('*, clients(*)').eq('id', id).single(),
      supabase.from('tasks').select('*, profiles(nome)').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('project_members').select('*, profiles(*)').eq('project_id', id),
      supabase.from('activity_log').select('*, profiles(nome)').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
    ])

    if (projRes.data) setProject(projRes.data as Project)
    setTasks((tasksRes.data ?? []) as Task[])
    setMembers((membersRes.data ?? []) as (ProjectMember & { profiles: Profile })[])
    setLogs((logsRes.data ?? []) as (ActivityLog & { profiles: Profile })[])
    setAllProfiles((profilesRes.data ?? []) as Profile[])
    setLoading(false)
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleStatusChange(newStatus: string) {
    if (!project) return
    setSavingStatus(true)
    await supabase.from('projects').update({ status: newStatus }).eq('id', project.id)
    await fetchAll()
    setSavingStatus(false)
  }

  async function handleTaskStatusChange(taskId: string, newStatus: string) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    fetchAll()
  }

  if (loading) return <LoadingSpinner />
  if (!project) return <div>Projeto não encontrado</div>

  const client = project.clients as unknown as { nome: string; empresa: string } | null

  return (
    <div>
      <button onClick={() => navigate('/projetos')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar para projetos
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.nome}</h1>
          <p className="text-sm text-gray-500">{client?.nome}{client?.empresa ? ` — ${client.empresa}` : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={project.status} onChange={e => handleStatusChange(e.target.value)} className="w-40">
            {statusProjetoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          {savingStatus && <span className="text-xs text-gray-400">Salvando...</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Informações</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Tipo</span><span>{TIPO_SERVICO_LABELS[project.tipo_servico]}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={project.status} labels={STATUS_PROJETO_LABELS} /></div>
            <div className="flex justify-between"><span className="text-gray-500">Valor</span><span>{project.valor_fechado ? `R$ ${Number(project.valor_fechado).toLocaleString('pt-BR')}` : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Início</span><span>{project.data_inicio ? new Date(project.data_inicio).toLocaleDateString('pt-BR') : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Prazo</span><span>{project.prazo_entrega ? new Date(project.prazo_entrega).toLocaleDateString('pt-BR') : '-'}</span></div>
          </div>
          {project.descricao && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Descrição</p>
              <p className="text-sm text-gray-700">{project.descricao}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-2">Responsáveis</p>
            <div className="space-y-1">
              {members.map(m => (
                <span key={m.profile_id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-700 mr-1">
                  {m.profiles?.nome}
                </span>
              ))}
              {members.length === 0 && <span className="text-xs text-gray-400">Nenhum responsável</span>}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Tarefas ({tasks.length})</h2>
            <Button size="sm" onClick={() => setShowTaskModal(true)}>
              <Plus className="h-4 w-4" /> Nova Tarefa
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
              Nenhuma tarefa cadastrada
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={t.status === 'concluida'}
                    onChange={() => handleTaskStatusChange(t.id, t.status === 'concluida' ? 'pendente' : 'concluida')}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${t.status === 'concluida' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.titulo}</p>
                    <p className="text-xs text-gray-500">{(t.profiles as unknown as { nome: string })?.nome ?? 'Sem responsável'}</p>
                  </div>
                  <StatusBadge status={t.prioridade} labels={PRIORIDADE_LABELS} />
                  <StatusBadge status={t.status} labels={STATUS_TAREFA_LABELS} />
                  {t.prazo && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(t.prazo).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Activity Log */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Atividades</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma atividade registrada</p>
            ) : (
              <div className="space-y-2">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-gray-700">{log.descricao}</p>
                      <p className="text-xs text-gray-400">
                        {(log.profiles as unknown as { nome: string })?.nome} — {new Date(log.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSaved={fetchAll}
        projectId={project.id}
        profiles={allProfiles}
        currentProfileId={profile?.id}
      />
    </div>
  )
}

function TaskModal({ open, onClose, onSaved, projectId, profiles, currentProfileId }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  projectId: string
  profiles: Profile[]
  currentProfileId?: string
}) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    responsavel_id: currentProfileId ?? '',
    prioridade: 'media',
    prazo: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('tasks').insert({
      ...form,
      project_id: projectId,
      prazo: form.prazo || null,
    })
    setSaving(false)
    setForm({ titulo: '', descricao: '', responsavel_id: currentProfileId ?? '', prioridade: 'media', prazo: '' })
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova Tarefa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título *" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required />
        <Textarea label="Descrição" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
        <Select label="Responsável" value={form.responsavel_id} onChange={e => setForm(f => ({ ...f, responsavel_id: e.target.value }))}>
          <option value="">Selecione...</option>
          {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Prioridade" value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}>
            {prioridadeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Input label="Prazo" type="date" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

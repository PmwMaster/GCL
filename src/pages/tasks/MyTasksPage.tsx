import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Task } from '@/types'
import {
  STATUS_TAREFA_LABELS,
  PRIORIDADE_LABELS,
  TIPO_SERVICO_LABELS,
  statusTarefaOptions,
  prioridadeOptions,
} from '@/types'
import { Select } from '@/components/ui/Form'
import { LoadingSpinner, StatusBadge } from '@/components/ui/Shared'
import { Calendar, Filter } from 'lucide-react'

export function MyTasksPage() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<(Task & { projects: { nome: string; tipo_servico: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPrioridade, setFilterPrioridade] = useState('')

  const fetchTasks = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('tasks')
      .select('*, projects(nome, tipo_servico)')
      .eq('responsavel_id', profile.id)
      .order('prazo', { ascending: true, nullsFirst: false })

    setTasks((data ?? []) as (Task & { projects: { nome: string; tipo_servico: string } })[])
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function handleStatusChange(taskId: string, newStatus: string) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    fetchTasks()
  }

  const filtered = tasks.filter(t => {
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchPrioridade = !filterPrioridade || t.prioridade === filterPrioridade
    return matchStatus && matchPrioridade
  })

  const grouped = {
    pendente: filtered.filter(t => t.status === 'pendente'),
    em_andamento: filtered.filter(t => t.status === 'em_andamento'),
    concluida: filtered.filter(t => t.status === 'concluida'),
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Tarefas</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          {filtered.length} tarefas
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
        >
          <option value="">Todos os status</option>
          {statusTarefaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterPrioridade}
          onChange={e => setFilterPrioridade(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 outline-none"
        >
          <option value="">Todas as prioridades</option>
          {prioridadeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(['pendente', 'em_andamento', 'concluida'] as const).map(status => (
          <div key={status}>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              {STATUS_TAREFA_LABELS[status]}
              <span className="text-xs font-normal text-gray-400 dark:text-gray-500">({grouped[status].length})</span>
            </h2>
            <div className="space-y-2">
              {grouped[status].map(t => (
                <div key={t.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.titulo}</p>
                    <StatusBadge status={t.prioridade} labels={PRIORIDADE_LABELS} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t.projects?.nome} — {TIPO_SERVICO_LABELS[t.projects?.tipo_servico as keyof typeof TIPO_SERVICO_LABELS] ?? ''}</p>
                  {t.prazo && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(t.prazo).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <div className="mt-3">
                    <Select value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)} className="text-xs">
                      {statusTarefaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  </div>
                </div>
              ))}
              {grouped[status].length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Nenhuma tarefa</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

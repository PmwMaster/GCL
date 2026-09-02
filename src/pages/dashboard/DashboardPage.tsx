import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TIPO_SERVICO_LABELS, STATUS_TAREFA_LABELS, PRIORIDADE_LABELS, type Project, type Task, type Profile } from '@/types'
import { LoadingSpinner } from '@/components/ui/Shared'
import { FolderKanban, AlertTriangle, Clock, Users } from 'lucide-react'

interface DashboardStats {
  projetosAtivos: number
  tarefasAtrasadas: number
  projetosPorTipo: Record<string, number>
  cargaPorSocio: { nome: string; tarefas: number }[]
  projetosProximos: Project[]
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      const [projectsRes, tasksRes, profilesRes] = await Promise.all([
        supabase.from('projects').select('*, clients(nome)').order('prazo_entrega', { ascending: true }),
        supabase.from('tasks').select('*, profiles(nome)').in('status', ['pendente', 'em_andamento']),
        supabase.from('profiles').select('*').eq('papel', 'socio'),
      ])

      const projects = (projectsRes.data ?? []) as Project[]
      const tasks = (tasksRes.data ?? []) as Task[]
      const profiles = (profilesRes.data ?? []) as Profile[]

      const projetosAtivos = projects.filter(p =>
        ['prospeccao', 'em_andamento', 'em_revisao'].includes(p.status)
      ).length

      const today = new Date().toISOString().split('T')[0]
      const tarefasAtrasadas = tasks.filter(t => t.prazo && t.prazo < today).length

      const projetosPorTipo: Record<string, number> = {}
      projects.forEach(p => {
        if (['prospeccao', 'em_andamento', 'em_revisao'].includes(p.status)) {
          projetosPorTipo[p.tipo_servico] = (projetosPorTipo[p.tipo_servico] ?? 0) + 1
        }
      })

      const cargaPorSocio = profiles.map(s => ({
        nome: s.nome.split(' ')[0],
        tarefas: tasks.filter(t => t.responsavel_id === s.id).length,
      }))

      const projetosProximos = projects
        .filter(p => p.prazo_entrega && ['prospeccao', 'em_andamento', 'em_revisao'].includes(p.status))
        .slice(0, 5)

      setStats({ projetosAtivos, tarefasAtrasadas, projetosPorTipo, cargaPorSocio, projetosProximos })
      setLoading(false)
    }

    fetchDashboard()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats) return null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FolderKanban className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
          label="Projetos Ativos"
          value={stats.projetosAtivos}
          color="bg-primary-50 dark:bg-primary-900/40"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
          label="Tarefas Atrasadas"
          value={stats.tarefasAtrasadas}
          color="bg-red-50 dark:bg-red-900/40"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
          label="Tipos de Serviço"
          value={Object.keys(stats.projetosPorTipo).length}
          color="bg-yellow-50 dark:bg-yellow-900/40"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-green-600 dark:text-green-400" />}
          label="Sócios Ativos"
          value={stats.cargaPorSocio.length}
          color="bg-green-50 dark:bg-green-900/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Projetos por Tipo de Serviço</h2>
          <div className="space-y-3">
            {Object.entries(stats.projetosPorTipo).map(([tipo, count]) => (
              <div key={tipo} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{TIPO_SERVICO_LABELS[tipo as keyof typeof TIPO_SERVICO_LABELS]}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(count / stats.projetosAtivos) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(stats.projetosPorTipo).length === 0 && (
              <p className="text-sm text-gray-400">Nenhum projeto ativo</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Carga de Tarefas por Sócio</h2>
          <div className="space-y-3">
            {stats.cargaPorSocio.map(s => (
              <div key={s.nome} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{s.nome}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((s.tarefas / Math.max(...stats.cargaPorSocio.map(x => x.tarefas), 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-6 text-right">{s.tarefas}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Próximos Prazos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
                  <th className="pb-2 font-medium">Projeto</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium">Prazo</th>
                </tr>
              </thead>
              <tbody>
                {stats.projetosProximos.map(p => (
                  <tr key={p.id} className="border-b last:border-0 dark:border-gray-800">
                    <td className="py-2.5 font-medium text-gray-900 dark:text-white">{p.nome}</td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-400">{(p.clients as unknown as { nome: string })?.nome ?? '-'}</td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-400">{TIPO_SERVICO_LABELS[p.tipo_servico]}</td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-400">{p.prazo_entrega ? new Date(p.prazo_entrega).toLocaleDateString('pt-BR') : '-'}</td>
                  </tr>
                ))}
                {stats.projetosProximos.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-400">Nenhum projeto com prazo definido</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

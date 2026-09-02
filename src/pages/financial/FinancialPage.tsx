import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { FinancialEntry, ProjectRevenueSplit, Project } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner, StatusBadge } from '@/components/ui/Shared'
import { Plus, DollarSign, TrendingUp, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react'

export function FinancialPage() {
  const { isSocio } = useAuth()
  const [entries, setEntries] = useState<(FinancialEntry & { projects?: { nome: string } })[]>([])
  const [splits, setSplits] = useState<(ProjectRevenueSplit & {
    financial_entries?: FinancialEntry & { projects?: { nome: string } }
    revenue_split_details?: { profiles?: { nome: string }; valor_base_fixa: number; valor_variavel: number; valor_total: number }[]
  })[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [expandedSplit, setExpandedSplit] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      const [entriesRes, splitsRes, projectsRes] = await Promise.all([
        supabase.from('financial_entries').select('*, projects(nome)').order('data', { ascending: false }),
        supabase.from('project_revenue_splits').select('*, financial_entries(*, projects(nome)), revenue_split_details(*, profiles(nome))').order('created_at', { ascending: false }),
        supabase.from('projects').select('id, nome').order('nome'),
      ])
      setEntries((entriesRes.data ?? []) as (FinancialEntry & { projects?: { nome: string } })[])
      setSplits((splitsRes.data ?? []) as (ProjectRevenueSplit & {
        financial_entries?: FinancialEntry & { projects?: { nome: string } }
        revenue_split_details?: { profiles?: { nome: string }; valor_base_fixa: number; valor_variavel: number; valor_total: number }[]
      })[])
      setProjects((projectsRes.data ?? []) as Project[])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!isSocio) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Acesso restrito a sócios</div>

  const totalReceitas = entries.filter(e => e.tipo === 'receita').reduce((s, e) => s + e.valor, 0)
  const totalCustos = entries.filter(e => e.tipo === 'custo').reduce((s, e) => s + e.valor, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" /> Novo Lançamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/50"><TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Receitas</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50"><TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Custos</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950/50"><DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {(totalReceitas - totalCustos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lucro Líquido</p>
            </div>
          </div>
        </div>
      </div>

      {/* Splits */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Divisões de Receita</h2>
        {splits.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma divisão calculada ainda</p>
        ) : (
          <div className="space-y-3">
            {splits.map(split => (
              <div key={split.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <button
                  onClick={() => setExpandedSplit(expandedSplit === split.id ? null : split.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {expandedSplit === split.id ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {split.financial_entries?.projects?.nome ?? 'Sem projeto'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {split.financial_entries?.descricao} — {new Date(split.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">R$ {split.valor_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">bruto</p>
                  </div>
                </button>

                {expandedSplit === split.id && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div><span className="text-gray-500 dark:text-gray-400">Reserva:</span> <span className="font-medium text-gray-900 dark:text-white">R$ {split.valor_reserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                      <div><span className="text-gray-500 dark:text-gray-400">Lucro Distribuível:</span> <span className="font-medium text-gray-900 dark:text-white">R$ {split.valor_lucro_distribuivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                      <div><span className="text-gray-500 dark:text-gray-400">Base Fixa Total:</span> <span className="font-medium text-gray-900 dark:text-white">R$ {split.valor_base_fixa_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                      <div><span className="text-gray-500 dark:text-gray-400">Variável Total:</span> <span className="font-medium text-gray-900 dark:text-white">R$ {split.valor_variavel_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    </div>

                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Detalhamento por Sócio</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
                          <th className="pb-2 font-medium">Sócio</th>
                          <th className="pb-2 font-medium text-right">Base Fixa</th>
                          <th className="pb-2 font-medium text-right">Variável</th>
                          <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {split.revenue_split_details?.map(detail => (
                          <tr key={detail.id} className="border-b last:border-0 dark:border-gray-800 text-gray-900 dark:text-white">
                            <td className="py-2">{detail.profiles?.nome}</td>
                            <td className="py-2 text-right">R$ {detail.valor_base_fixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 text-right">R$ {detail.valor_variavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="py-2 text-right font-medium">R$ {detail.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lançamentos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lançamentos</h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(e.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.tipo} labels={{ receita: 'Receita', custo: 'Custo' }} /></td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{e.descricao}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{e.projects?.nome ?? '-'}</td>
                  <td className={`px-4 py-3 text-right font-medium ${e.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {e.tipo === 'receita' ? '+' : '-'} R$ {e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">Nenhum lançamento</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EntryModal open={showModal} onClose={() => setShowModal(false)} projects={projects} onSaved={() => {
        supabase.from('financial_entries').select('*, projects(nome)').order('data', { ascending: false }).then(r => setEntries((r.data ?? []) as (FinancialEntry & { projects?: { nome: string } })[]))
        supabase.from('project_revenue_splits').select('*, financial_entries(*, projects(nome)), revenue_split_details(*, profiles(nome))').order('created_at', { ascending: false }).then(r => setSplits((r.data ?? []) as (ProjectRevenueSplit & { financial_entries?: FinancialEntry & { projects?: { nome: string } }; revenue_split_details?: { profiles?: { nome: string }; valor_base_fixa: number; valor_variavel: number; valor_total: number }[] })[]))
      }} />
    </div>
  )
}

function EntryModal({ open, onClose, projects, onSaved }: {
  open: boolean
  onClose: () => void
  projects: Project[]
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    tipo: 'receita',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    project_id: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('financial_entries').insert({
      ...form,
      valor: Number(form.valor),
      project_id: form.project_id || null,
    })
    setSaving(false)
    setForm({ tipo: 'receita', descricao: '', valor: '', data: new Date().toISOString().split('T')[0], project_id: '' })
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Lançamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Tipo" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
          <option value="receita">Receita</option>
          <option value="custo">Custo</option>
        </Select>
        <Input label="Descrição *" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} required />
        <Input label="Valor (R$) *" type="number" step="0.01" min="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} required />
        <Input label="Data" type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
        <Select label="Projeto (opcional)" value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}>
          <option value="">Sem projeto</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </Select>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { supabase } from '@/lib/supabase'
import type { Project, Client, Profile } from '@/types'
import {
  TIPO_SERVICO_LABELS,
  STATUS_PROJETO_LABELS,
  tipoServicoOptions,
  statusProjetoOptions,
} from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/ui/Shared'
import { Plus, Search, Eye, Trash2 } from 'lucide-react'

export function ProjectsPage() {
  const { data: projects, loading, refetch } = useSupabaseQuery<Project>('projects', {
    columns: '*, clients(nome, empresa)',
    orderBy: 'created_at',
    ascending: false,
  })
  const { data: clients } = useSupabaseQuery<Client>('clients', { orderBy: 'nome' })
  const { data: profiles } = useSupabaseQuery<Profile>('profiles', { filters: { papel: 'socio' } })

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const filtered = projects.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || p.status === filterStatus
    const matchTipo = !filterTipo || p.tipo_servico === filterTipo
    return matchSearch && matchStatus && matchTipo
  })

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return
    await supabase.from('projects').delete().eq('id', id)
    refetch()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar projeto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">Todos os status</option>
          {statusProjetoOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">Todos os tipos</option>
          {tipoServicoOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Nenhum projeto encontrado" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Prazo</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{(p.clients as unknown as { nome: string })?.nome ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{TIPO_SERVICO_LABELS[p.tipo_servico]}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} labels={STATUS_PROJETO_LABELS} /></td>
                  <td className="px-4 py-3 text-gray-600">{p.prazo_entrega ? new Date(p.prazo_entrega).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.valor_fechado ? `R$ ${Number(p.valor_fechado).toLocaleString('pt-BR')}` : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/projetos/${p.id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={refetch}
        clients={clients}
        profiles={profiles}
      />
    </div>
  )
}

function ProjectModal({ open, onClose, onSaved, clients, profiles }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  clients: Client[]
  profiles: Profile[]
}) {
  const [form, setForm] = useState({
    nome: '', client_id: '', tipo_servico: 'landing_page', valor_fechado: '',
    data_inicio: '', prazo_entrega: '', descricao: '',
  })
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: project, error } = await supabase.from('projects').insert({
      ...form,
      valor_fechado: form.valor_fechado ? Number(form.valor_fechado) : null,
      data_inicio: form.data_inicio || null,
      prazo_entrega: form.prazo_entrega || null,
    }).select().single()

    if (project && !error) {
      for (const profileId of selectedMembers) {
        await supabase.from('project_members').insert({
          project_id: project.id,
          profile_id: profileId,
        })
      }
    }

    setSaving(false)
    setForm({ nome: '', client_id: '', tipo_servico: 'landing_page', valor_fechado: '', data_inicio: '', prazo_entrega: '', descricao: '' })
    setSelectedMembers([])
    onSaved()
    onClose()
  }

  function toggleMember(id: string) {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Projeto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome do Projeto *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
        <Select label="Cliente *" value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} required>
          <option value="">Selecione...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` — ${c.empresa}` : ''}</option>)}
        </Select>
        <Select label="Tipo de Serviço" value={form.tipo_servico} onChange={e => setForm(f => ({ ...f, tipo_servico: e.target.value }))}>
          {tipoServicoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Input label="Valor Fechado (R$)" type="number" step="0.01" value={form.valor_fechado} onChange={e => setForm(f => ({ ...f, valor_fechado: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data Início" type="date" value={form.data_inicio} onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))} />
          <Input label="Prazo Entrega" type="date" value={form.prazo_entrega} onChange={e => setForm(f => ({ ...f, prazo_entrega: e.target.value }))} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Responsáveis</label>
          <div className="space-y-2">
            {profiles.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(p.id)}
                  onChange={() => toggleMember(p.id)}
                  className="rounded border-gray-300"
                />
                {p.nome}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

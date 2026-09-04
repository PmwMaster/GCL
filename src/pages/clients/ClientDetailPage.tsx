import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Client, Project } from '@/types'
import { TIPO_SERVICO_LABELS, STATUS_PROJETO_LABELS } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { LoadingSpinner, StatusBadge } from '@/components/ui/Shared'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

export function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState({ nome: '', empresa: '', contato_email: '', contato_telefone: '', origem: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetch() {
      const [clientRes, projectsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('projects').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      ])
      if (clientRes.data) {
        setClient(clientRes.data)
        setForm({
          nome: clientRes.data.nome,
          empresa: clientRes.data.empresa ?? '',
          contato_email: clientRes.data.contato_email ?? '',
          contato_telefone: clientRes.data.contato_telefone ?? '',
          origem: clientRes.data.origem ?? '',
        })
      }
      setProjects((projectsRes.data ?? []) as Project[])
      setLoading(false)
    }
    fetch()
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('clients').update(form).eq('id', id)
    setSaving(false)
  }

  async function handleDeleteClient() {
    if (!confirm('Tem certeza que deseja excluir este cliente? Todos os projetos e dados vinculados serão excluídos.')) return
    setDeleting(true)
    const { error } = await supabase.from('clients').delete().eq('id', id)
    setDeleting(false)
    if (error) {
      alert(`Erro ao excluir cliente: ${error.message}`)
    } else {
      navigate('/clientes')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!client) return <div className="text-gray-500 dark:text-gray-400">Cliente não encontrado</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/clientes')} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar para clientes
        </button>
        <Button variant="danger" onClick={handleDeleteClient} disabled={deleting}>
          <Trash2 className="h-4 w-4" /> Excluir Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dados do Cliente</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
            <Input label="Empresa" value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} />
            <Input label="E-mail" type="email" value={form.contato_email} onChange={e => setForm(f => ({ ...f, contato_email: e.target.value }))} />
            <Input label="Telefone" value={form.contato_telefone} onChange={e => setForm(f => ({ ...f, contato_telefone: e.target.value }))} />
            <Input label="Origem" value={form.origem} onChange={e => setForm(f => ({ ...f, origem: e.target.value }))} />
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projetos ({projects.length})</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum projeto vinculado</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projetos/${p.id}`)}
                  className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 bg-gray-50/50 dark:bg-gray-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{p.nome}</span>
                    <StatusBadge status={p.status} labels={STATUS_PROJETO_LABELS} />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{TIPO_SERVICO_LABELS[p.tipo_servico]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

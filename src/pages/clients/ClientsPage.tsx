import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner, EmptyState } from '@/components/ui/Shared'
import { Plus, Search, Eye, Trash2 } from 'lucide-react'

export function ClientsPage() {
  const { data: clients, loading, refetch } = useSupabaseQuery<Client>('clients', {
    orderBy: 'created_at',
    ascending: false,
  })
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const filtered = clients.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.empresa?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    await supabase.from('clients').delete().eq('id', id)
    refetch()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Nenhum cliente encontrado" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{client.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{client.empresa ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.contato_email ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.contato_telefone ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.origem ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/clientes/${client.id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
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

      <ClientModal open={showModal} onClose={() => setShowModal(false)} onSaved={refetch} />
    </div>
  )
}

function ClientModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ nome: '', empresa: '', contato_email: '', contato_telefone: '', origem: '' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('clients').insert(form)
    setSaving(false)
    setForm({ nome: '', empresa: '', contato_email: '', contato_telefone: '', origem: '' })
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
        <Input label="Empresa" value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} />
        <Input label="E-mail" type="email" value={form.contato_email} onChange={e => setForm(f => ({ ...f, contato_email: e.target.value }))} />
        <Input label="Telefone" value={form.contato_telefone} onChange={e => setForm(f => ({ ...f, contato_telefone: e.target.value }))} />
        <Input label="Origem" value={form.origem} onChange={e => setForm(f => ({ ...f, origem: e.target.value }))} placeholder="Indicação, tráfego pago, orgânico..." />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Profile, PapelUsuario, AreaPrincipal } from '@/types'
import { AREA_LABELS } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/Shared'
import { Shield, User, Pencil, UserPlus, Check, X, Mail } from 'lucide-react'

const PAPEL_LABELS: Record<PapelUsuario, string> = {
  socio: 'Sócio',
  funcionario: 'Funcionário',
}

export function TeamPage() {
  const { isSocio } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ papel: PapelUsuario; area_principal: AreaPrincipal }>({
    papel: 'funcionario',
    area_principal: 'geral',
  })
  const [saving, setSaving] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', nome: '', senha: '', papel: 'funcionario' as PapelUsuario, area: 'geral' as AreaPrincipal })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
    setProfiles(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  function startEdit(profile: Profile) {
    setEditingId(profile.id)
    setEditForm({ papel: profile.papel, area_principal: profile.area_principal })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(profileId: string) {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ papel: editForm.papel, area_principal: editForm.area_principal })
      .eq('id', profileId)

    if (error) {
      console.error('Erro ao atualizar:', error.message)
      alert('Erro ao atualizar: ' + error.message)
    } else {
      await fetchProfiles()
    }
    setSaving(false)
    setEditingId(null)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    setInviteLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: inviteForm.email,
      password: inviteForm.senha,
      options: { data: { nome: inviteForm.nome } },
    })

    if (error) {
      setInviteError(error.message)
      setInviteLoading(false)
      return
    }

    // Atualizar papel e área do novo usuário
    if (data.user) {
      // Aguardar o trigger criar o profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      await supabase
        .from('profiles')
        .update({ papel: inviteForm.papel, area_principal: inviteForm.area })
        .eq('id', data.user.id)
    }

    setInviteSuccess(`Usuário ${inviteForm.nome} criado com sucesso!`)
    setInviteForm({ email: '', nome: '', senha: '', papel: 'funcionario', area: 'geral' })
    await fetchProfiles()
    setInviteLoading(false)
    setTimeout(() => {
      setInviteSuccess('')
      setInviteOpen(false)
    }, 2000)
  }

  if (loading) return <LoadingSpinner />
  if (!isSocio) return <div className="text-center py-12 text-gray-500">Acesso restrito a sócios</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipe</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie os membros, papéis e áreas da agência</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" /> Convidar Membro
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
              <th className="px-5 py-3 font-medium">Membro</th>
              <th className="px-5 py-3 font-medium">Papel</th>
              <th className="px-5 py-3 font-medium">Área Principal</th>
              <th className="px-5 py-3 font-medium">Desde</th>
              <th className="px-5 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id} className="border-b last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${profile.papel === 'socio' ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {profile.papel === 'socio'
                        ? <Shield className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        : <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.nome}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {editingId === profile.id ? (
                    <Select
                      value={editForm.papel}
                      onChange={e => setEditForm(f => ({ ...f, papel: e.target.value as PapelUsuario }))}
                    >
                      <option value="socio">Sócio</option>
                      <option value="funcionario">Funcionário</option>
                    </Select>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      profile.papel === 'socio'
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {profile.papel === 'socio' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {PAPEL_LABELS[profile.papel]}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {editingId === profile.id ? (
                    <Select
                      value={editForm.area_principal}
                      onChange={e => setEditForm(f => ({ ...f, area_principal: e.target.value as AreaPrincipal }))}
                    >
                      {Object.entries(AREA_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">{AREA_LABELS[profile.area_principal]}</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                  {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-4 text-right">
                  {editingId === profile.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" onClick={() => saveEdit(profile.id)} disabled={saving}>
                        <Check className="h-3.5 w-3.5" /> {saving ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => startEdit(profile)}>
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Convidar Novo Membro">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Nome Completo"
            value={inviteForm.nome}
            onChange={e => setInviteForm(f => ({ ...f, nome: e.target.value }))}
            required
            placeholder="João Silva"
          />
          <Input
            label="E-mail"
            type="email"
            value={inviteForm.email}
            onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
            required
            placeholder="joao@email.com"
          />
          <Input
            label="Senha Inicial"
            type="password"
            value={inviteForm.senha}
            onChange={e => setInviteForm(f => ({ ...f, senha: e.target.value }))}
            required
            placeholder="••••••••"
            minLength={6}
          />
          <Select
            label="Papel"
            value={inviteForm.papel}
            onChange={e => setInviteForm(f => ({ ...f, papel: e.target.value as PapelUsuario }))}
          >
            <option value="funcionario">Funcionário</option>
            <option value="socio">Sócio</option>
          </Select>
          <Select
            label="Área Principal"
            value={inviteForm.area}
            onChange={e => setInviteForm(f => ({ ...f, area: e.target.value as AreaPrincipal }))}
          >
            {Object.entries(AREA_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          {inviteError && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{inviteError}</p>
          )}
          {inviteSuccess && (
            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{inviteSuccess}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={inviteLoading}>
              <UserPlus className="h-4 w-4" /> {inviteLoading ? 'Criando...' : 'Criar Membro'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

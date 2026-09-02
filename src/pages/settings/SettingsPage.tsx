import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { CompanySettings } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { LoadingSpinner } from '@/components/ui/Shared'
import { Save, AlertCircle } from 'lucide-react'

export function SettingsPage() {
  const { isSocio } = useAuth()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [form, setForm] = useState({ percentual_reserva: '', percentual_fixo: '', percentual_variavel: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('company_settings').select('*').limit(1).single()
      if (data) {
        setSettings(data)
        setForm({
          percentual_reserva: String(data.percentual_reserva),
          percentual_fixo: String(data.percentual_fixo),
          percentual_variavel: String(data.percentual_variavel),
        })
      }
      setLoading(false)
    }
    fetch()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const reserva = Number(form.percentual_reserva)
    const fixo = Number(form.percentual_fixo)
    const variavel = Number(form.percentual_variavel)

    if (fixo + variavel !== 100) {
      setError('A soma de percentual fixo e variável deve ser exatamente 100%')
      return
    }

    if (reserva < 0 || reserva > 100 || fixo < 0 || fixo > 100 || variavel < 0 || variavel > 100) {
      setError('Todos os percentuais devem estar entre 0 e 100')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase
      .from('company_settings')
      .update({ percentual_reserva: reserva, percentual_fixo: fixo, percentual_variavel: variavel })
      .eq('id', settings?.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />
  if (!isSocio) return <div className="text-center py-12 text-gray-500">Acesso restrito a sócios</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações da Empresa</h1>

      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Parâmetros de Divisão Financeira</h2>
          <p className="text-sm text-gray-500 mb-6">
            Estes percentuais são usados automaticamente ao calcular a divisão de receitas.
            Mudanças aqui valem para as próximas divisões, sem alterar as já calculadas.
          </p>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <Input
                label="Reserva de Caixa (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.percentual_reserva}
                onChange={e => setForm(f => ({ ...f, percentual_reserva: e.target.value }))}
              />
              <p className="text-xs text-gray-400 mt-1">Percentual do bruto que vai para o caixa da empresa antes da divisão</p>
            </div>

            <div className="border-t pt-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Divisão do Lucro Distribuível</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Base Fixa (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.percentual_fixo}
                    onChange={e => setForm(f => ({ ...f, percentual_fixo: e.target.value }))}
                  />
                  <p className="text-xs text-gray-400 mt-1">Dividido igualmente entre todos os sócios</p>
                </div>
                <div>
                  <Input
                    label="Variável (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.percentual_variavel}
                    onChange={e => setForm(f => ({ ...f, percentual_variavel: e.target.value }))}
                  />
                  <p className="text-xs text-gray-400 mt-1">Dividido entre membros do projeto</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Soma atual: {Number(form.percentual_fixo) + Number(form.percentual_variavel)}% (deve ser 100%)
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                {success}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

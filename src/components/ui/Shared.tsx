import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
    </div>
  )
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <p className="text-gray-500 mb-4">{message}</p>
      {action}
    </div>
  )
}

export function StatusBadge({ status, labels, colors }: {
  status: string
  labels: Record<string, string>
  colors?: Record<string, string>
}) {
  const defaultColors: Record<string, string> = {
    prospeccao: 'bg-gray-100 text-gray-700',
    em_andamento: 'bg-blue-100 text-blue-700',
    em_revisao: 'bg-yellow-100 text-yellow-700',
    entregue: 'bg-green-100 text-green-700',
    pausado: 'bg-orange-100 text-orange-700',
    cancelado: 'bg-red-100 text-red-700',
    pendente: 'bg-gray-100 text-gray-700',
    concluida: 'bg-green-100 text-green-700',
    baixa: 'bg-gray-100 text-gray-600',
    media: 'bg-yellow-100 text-yellow-700',
    alta: 'bg-red-100 text-red-700',
    receita: 'bg-green-100 text-green-700',
    custo: 'bg-red-100 text-red-700',
  }

  const allColors = { ...defaultColors, ...colors }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${allColors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[status] ?? status}
    </span>
  )
}

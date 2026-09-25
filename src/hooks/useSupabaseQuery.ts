import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Cache em memória para guardar os dados entre as navegações (Stale-While-Revalidate)
const queryCache = new Map<string, any>()

export function useSupabaseQuery<T>(
  table: string,
  options?: {
    columns?: string
    filters?: Record<string, unknown>
    orderBy?: string
    ascending?: boolean
  }
) {
  // Cria uma chave única baseada na tabela e opções para identificar a query
  const cacheKey = JSON.stringify({ table, options })

  // Se já existir no cache, inicia com os dados em cache e loading falso
  const [data, setData] = useState<T[]>(() => queryCache.get(cacheKey) || [])
  const [loading, setLoading] = useState(() => !queryCache.has(cacheKey))
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) {
      setLoading(true)
    }
    setError(null)

    let query = supabase.from(table).select(options?.columns ?? '*')

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value)
        }
      }
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false })
    }

    const { data: result, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      const finalData = (result ?? []) as T[]
      queryCache.set(cacheKey, finalData) // Salva no cache
      setData(finalData)
    }
    setLoading(false)
  }, [table, options?.columns, options?.orderBy, options?.ascending, JSON.stringify(options?.filters), cacheKey])

  useEffect(() => {
    // Se temos cache, fazemos um fetch silencioso no fundo para atualizar os dados
    const hasCache = queryCache.has(cacheKey)
    fetchData(hasCache)
  }, [fetchData, cacheKey])

  return { data, loading, error, refetch: () => fetchData(false) }
}

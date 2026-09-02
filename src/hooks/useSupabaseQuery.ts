import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseQuery<T>(
  table: string,
  options?: {
    columns?: string
    filters?: Record<string, unknown>
    orderBy?: string
    ascending?: boolean
  }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
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
      setData((result ?? []) as T[])
    }
    setLoading(false)
  }, [table, options?.columns, options?.orderBy, options?.ascending, JSON.stringify(options?.filters)])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

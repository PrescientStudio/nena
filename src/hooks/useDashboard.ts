"use client"
import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '@/lib/types/dashboard'

interface UseDashboardReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(userId: string): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/dashboard/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }
      
      setData({
        analytics: result.analytics,
        recentRecordings: result.recentRecordings,
        progressData: result.progressData,
        badges: result.badges,
        coachingInsights: result.coachingInsights,
        practiceIdeas: result.practiceIdeas
      })
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const refetch = useCallback(async () => {
    await fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    data,
    loading,
    error,
    refetch
  }
}
"use client"
import { useState, useEffect, useCallback } from 'react'
import type { UserStats, RecentRecording, ProgressDataPoint } from '@/lib/types/dashboard'

interface UseUserAnalyticsReturn {
  analytics: UserStats | null
  recentRecordings: RecentRecording[]
  progressData: ProgressDataPoint[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUserAnalytics(userId: string | undefined): UseUserAnalyticsReturn {
  const [analytics, setAnalytics] = useState<UserStats | null>(null)
  const [recentRecordings, setRecentRecordings] = useState<RecentRecording[]>([])
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/analytics/${userId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      setAnalytics(data.analytics)
      setRecentRecordings(data.recentRecordings || [])
      setProgressData(data.progressData || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    recentRecordings,
    progressData,
    loading,
    error,
    refresh: fetchAnalytics
  }
}
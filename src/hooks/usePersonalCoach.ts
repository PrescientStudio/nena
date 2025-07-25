"use client"
import { useState, useEffect, useCallback } from 'react'
import type { CoachingInsight, PracticeIdea } from '@/services'
interface UsePersonalCoachReturn {
  coachingInsights: CoachingInsight | null
  practiceIdeas: PracticeIdea[]
  loading: boolean
  error: string | null
  refreshInsights: () => Promise<void>
  refreshPracticeIdeas: () => Promise<void>
}

export function usePersonalCoach(userId: string | undefined): UsePersonalCoachReturn {
  const [coachingInsights, setCoachingInsights] = useState<CoachingInsight | null>(null)
  const [practiceIdeas, setPracticeIdeas] = useState<PracticeIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoachingData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // For now, let's use the dashboard endpoint that includes coaching data
      const response = await fetch(`/api/dashboard/${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch coaching data')
      }

        const data = await response.json()

        if (data.success) {
        setCoachingInsights(data.coachingInsights)
        setPracticeIdeas(data.practiceIdeas || [])
        }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const refreshInsights = useCallback(async () => {
    await fetchCoachingData()
  }, [fetchCoachingData])

  const refreshPracticeIdeas = useCallback(async () => {
    await fetchCoachingData()
  }, [fetchCoachingData])

  useEffect(() => {
    fetchCoachingData()
  }, [fetchCoachingData])

  return {
    coachingInsights,
    practiceIdeas,
    loading,
    error,
    refreshInsights,
    refreshPracticeIdeas
  }
}
"use client"
import { useState, useEffect, useCallback } from 'react'
import type { BadgeProgress } from '@/services'
interface UseBadgesReturn {
  badges: BadgeProgress[]
  unlockedBadges: BadgeProgress[]
  lockedBadges: BadgeProgress[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useBadges(userId: string | undefined): UseBadgesReturn {
  const [badges, setBadges] = useState<BadgeProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBadges = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Use dashboard endpoint for now
      const response = await fetch(`/api/dashboard/${userId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch badges')
      }

      setBadges(data.badges || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  const unlockedBadges = badges.filter(badge => badge.isUnlocked)
  const lockedBadges = badges.filter(badge => !badge.isUnlocked)

  return {
    badges,
    unlockedBadges,
    lockedBadges,
    loading,
    error,
    refresh: fetchBadges
  }
}
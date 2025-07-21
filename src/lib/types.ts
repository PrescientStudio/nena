import type { ReactNode } from "react"

export interface RecentActivity {
  id: number
  date: string
  duration: string
  score: number
  insight: string
}

export interface ProgressData {
  name: string
  score: number
}

export interface KeyMetric {
  name: string
  value: string
  change: string
  icon: ReactNode
}

export interface Achievement {
  name: string
  unlocked: boolean
  icon: ReactNode
}

export interface Goal {
  name: string
  progress: number
}
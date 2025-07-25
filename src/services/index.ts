// Central export file for all services
export { IntegrationService } from './integrationService'
export { SpeechAnalysisService } from './speechAnalysisService'
export { UserAnalyticsService } from './userAnalyticsService'
export { PersonalCoachService } from './personalCoachService'
export { BadgeService } from './badgeService'

export type { AnalysisResult } from './speechAnalysisService'
export type { CoachingInsight, PracticeIdea } from './personalCoachService'
export type { BadgeProgress } from './badgeService'
export type { UserStats, RecentRecording, ProgressDataPoint } from './userAnalyticsService'
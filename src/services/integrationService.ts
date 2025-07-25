import { SpeechAnalysisService } from './speechAnalysisService'
import { UserAnalyticsService } from './userAnalyticsService'
import { PersonalCoachService } from './personalCoachService'
import { BadgeService } from './badgeService'

export class IntegrationService {
  private speechService = new SpeechAnalysisService()
  private analyticsService = new UserAnalyticsService()
  private coachService = new PersonalCoachService()
  private badgeService = new BadgeService()

  async processRecording(data: {
    userId: string
    audioBuffer: Buffer
    duration: number
    videoUrl?: string
    fileType?: string
  }) {
    try {
      console.log(`Processing recording for user ${data.userId}`)
      console.log(`File type: ${data.fileType}, Size: ${(data.audioBuffer.length / 1024 / 1024).toFixed(1)}MB`)
      
      // 1. Analyze the speech with file type and user ID
      console.log('Starting speech analysis...')
      const analysisResult = await this.speechService.analyzeAudio(
        data.audioBuffer,
        data.fileType,
        data.userId
      )
      console.log('Speech analysis completed:', {
        confidence: analysisResult.confidence,
        pace: analysisResult.speakingPace,
        clarity: analysisResult.clarityScore,
        transcription: analysisResult.transcription.substring(0, 100) + '...'
      })
      
      // 2. Save recording and update analytics
      console.log('Saving recording and updating analytics...')
      const recording = await this.analyticsService.saveRecording({
        ...data,
        analysisResult
      })
      console.log('Recording saved with ID:', recording.id)
      
      // 3. Check for new badges
      console.log('Checking for new badges...')
      const newBadges = await this.badgeService.checkAndAwardBadges(data.userId)
      console.log('New badges awarded:', newBadges)
      
      // 4. Generate personalized coaching (async, don't wait)
      this.generateCoachingInsights(data.userId).catch(console.error)
      
      return {
        recording,
        analysisResult,
        newBadges,
        success: true
      }
    } catch (error) {
      console.error('Recording processing failed:', error)
      throw error
    }
  }

  async getDashboardData(userId: string) {
    try {
      console.log(`Fetching dashboard data for user ${userId}`)
      
      const [
        analytics,
        recentRecordings,
        progressData,
        badges,
        coachingInsights,
        practiceIdeas
      ] = await Promise.all([
        this.analyticsService.getUserAnalytics(userId),
        this.analyticsService.getRecentRecordings(userId, 5),
        this.analyticsService.getProgressData(userId, 7),
        this.badgeService.getUserBadges(userId),
        this.coachService.generatePersonalizedFeedback(userId),
        this.coachService.generatePracticeIdeas(userId, 3)
      ])

      console.log('Dashboard data fetched successfully')

      return {
        analytics,
        recentRecordings,
        progressData,
        badges,
        coachingInsights,
        practiceIdeas
      }
    } catch (error) {
      console.error('Dashboard data fetch failed:', error)
      throw error
    }
  }

  private async generateCoachingInsights(userId: string) {
    try {
      console.log(`Generating coaching insights for user ${userId}`)
      await this.coachService.generatePersonalizedFeedback(userId)
      console.log('Coaching insights generated successfully')
    } catch (error) {
      console.error('Coaching insights generation failed:', error)
    }
  }

  // Testing method
  async testIntegration(userId: string = 'test-user-123') {
    console.log('🧪 Starting integration test...')
    
    try {
      // Create a mock audio buffer (in real app, this would come from recording)
      const mockAudioBuffer = Buffer.from('mock-audio-data')
      
      console.log('📝 Step 1: Processing mock recording...')
      const result = await this.processRecording({
        userId,
        audioBuffer: mockAudioBuffer,
        duration: 120, // 2 minutes
        videoUrl: undefined
      })
      
      console.log('✅ Recording processed successfully!')
      console.log('Analysis result:', result.analysisResult)
      console.log('New badges:', result.newBadges)
      
      console.log('📊 Step 2: Fetching dashboard data...')
      const dashboardData = await this.getDashboardData(userId)
      
      console.log('✅ Dashboard data fetched successfully!')
      console.log('Analytics:', dashboardData.analytics)
      console.log('Recent recordings:', dashboardData.recentRecordings.length)
      console.log('Badges:', dashboardData.badges.length)
      
      return {
        success: true,
        result,
        dashboardData
      }
    } catch (error) {
      console.error('❌ Integration test failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}
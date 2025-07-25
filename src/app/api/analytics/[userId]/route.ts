import { NextRequest, NextResponse } from 'next/server'
import { IntegrationService } from '@/services'

const integrationService = new IntegrationService()

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const dashboardData = await integrationService.getDashboardData(userId)
    
    return NextResponse.json({
      success: true,
      analytics: dashboardData.analytics,
      recentRecordings: dashboardData.recentRecordings,
      progressData: dashboardData.progressData
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { IntegrationService } from '@/services'

const integrationService = new IntegrationService()

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    const dashboardData = await integrationService.getDashboardData(userId)
    
    return NextResponse.json({
      success: true,
      ...dashboardData
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
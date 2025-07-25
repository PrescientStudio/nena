import { NextResponse } from 'next/server'
import { StorageConnectivityTest } from '@/lib/test-storage'

export async function GET() {
  console.log('🧪 Storage connectivity test requested via API')
  
  try {
    const tester = new StorageConnectivityTest()
    const results = await tester.runConnectivityTest()
    
    return NextResponse.json({
      success: results.success,
      message: results.success ? 'All storage tests passed!' : 'Some storage tests failed',
      results: results.results,
      error: results.error,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Storage test API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Storage test failed to run',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  console.log('🚀 Quick storage test requested via API')
  
  try {
    const tester = new StorageConnectivityTest()
    const success = await tester.quickTest()
    
    return NextResponse.json({
      success,
      message: success ? 'Quick test passed!' : 'Quick test failed',
      type: 'quick',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Quick storage test API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Quick test failed to run',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
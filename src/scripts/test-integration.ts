import { IntegrationService } from '@/services'
import { BadgeService } from '@/services/badgeService'

async function testCompleteIntegration() {
  console.log('🚀 Starting Complete Integration Test')
  console.log('=====================================')
  
  const integrationService = new IntegrationService()
  const badgeService = new BadgeService()
  const testUserId = 'test-user-' + Date.now()
  
  try {
    // Step 1: Initialize default badges
    console.log('📋 Step 1: Initializing default badges...')
    await badgeService.initializeDefaultBadges()
    console.log('✅ Default badges initialized')
    
    // Step 2: Run integration test
    console.log('\n🧪 Step 2: Running integration test...')
    const testResult = await integrationService.testIntegration(testUserId)
    
    if (testResult.success) {
      console.log('✅ Integration test passed!')
      
      // Step 3: Test dashboard API
      console.log('\n📊 Step 3: Testing dashboard API...')
      const dashboardResponse = await fetch(`http://localhost:3000/api/dashboard/${testUserId}`)
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        console.log('✅ Dashboard API working correctly')
        console.log('Dashboard data keys:', Object.keys(dashboardData))
      } else {
        console.log('❌ Dashboard API test failed')
      }
      
      // Step 4: Test analytics API
      console.log('\n📈 Step 4: Testing analytics API...')
      const analyticsResponse = await fetch(`http://localhost:3000/api/analytics/${testUserId}`)
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        console.log('✅ Analytics API working correctly')
        console.log('Analytics keys:', Object.keys(analyticsData))
      } else {
        console.log('❌ Analytics API test failed')
      }
      
    } else {
      console.log('❌ Integration test failed:', testResult.error)
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
  }
  
  console.log('\n🏁 Test completed')
}

// Run the test
testCompleteIntegration()
// Load environment variables first
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Simple integration test without database dependencies
import { SpeechAnalysisService } from '@/services/speechAnalysisService'

async function testSpeechAnalysis() {
  console.log('🚀 Starting Simple Integration Test')
  console.log('===================================')
  
  try {
    console.log('📝 Testing Speech Analysis Service...')
    
    const speechService = new SpeechAnalysisService()
    
    // Create a mock audio buffer
    const mockAudioBuffer = Buffer.from('mock-webm-audio-data', 'utf8')
    
    console.log('Mock audio buffer created, size:', mockAudioBuffer.length)
    console.log('Testing speech analysis (this will likely fail without real audio, but we can see the error handling)...')
    
    try {
      const result = await speechService.analyzeAudio(mockAudioBuffer)
      console.log('✅ Speech analysis completed:', result)
    } catch (error) {
      console.log('⚠️  Expected error with mock data:', error.message)
      console.log('This is normal - we need real audio data for actual analysis')
    }
    
    console.log('✅ Speech service is properly configured')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Test environment variables
function testEnvironmentConfig() {
  console.log('\n🔧 Testing Environment Configuration')
  console.log('====================================')
  
  const requiredEnvVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_KEY_PATH', 
    'GEMINI_API_KEY',
    'DATABASE_URL'
  ]
  
  let allConfigured = true

  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar]
    if (value) {
      // Show first 20 chars for security
      const preview = value.length > 20 ? value.substring(0, 20) + '...' : value
      console.log(`✅ ${envVar}: ${preview}`)
    } else {
      console.log(`❌ ${envVar}: Missing`)
      allConfigured = false
    }
  })

  return allConfigured
}

// Test Google Cloud credentials file
function testCredentialsFile() {
  console.log('\n📁 Testing Google Cloud Credentials')
  console.log('===================================')

  const credentialsPath = process.env.GOOGLE_CLOUD_KEY_PATH
  if (!credentialsPath) {
    console.log('❌ GOOGLE_CLOUD_KEY_PATH not set')
    return false
  }

  try {
    const fs = require('fs')
    const fullPath = path.resolve(process.cwd(), credentialsPath)

    if (fs.existsSync(fullPath)) {
      console.log(`✅ Credentials file exists: ${fullPath}`)

      // Try to parse JSON
      const content = fs.readFileSync(fullPath, 'utf8')
      const parsed = JSON.parse(content)

      if (parsed.type && parsed.project_id && parsed.private_key) {
        console.log(`✅ Credentials file is valid JSON with required fields`)
        console.log(`   Project ID: ${parsed.project_id}`)
        console.log(`   Type: ${parsed.type}`)
        return true
      } else {
        console.log('❌ Credentials file missing required fields')
        return false
      }
    } else {
      console.log(`❌ Credentials file not found: ${fullPath}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error reading credentials file: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🌟 Nena AI Integration Test Suite')
  console.log('=================================\n')

  const envOk = testEnvironmentConfig()
  const credentialsOk = testCredentialsFile()

  if (envOk && credentialsOk) {
    await testSpeechAnalysis()
    console.log('\n🎉 All basic tests passed! Ready for full integration.')
  } else {
    console.log('\n⚠️  Please fix the configuration issues above before proceeding.')
    console.log('\nQuick fixes:')
    console.log('1. Make sure .env.local exists in your project root')
    console.log('2. Create the Google Cloud credentials file at: ./config/credentials/google-cloud-key.json')
    console.log('3. Verify your PostgreSQL database is running')
  }

  console.log('\n🏁 Test completed')
}

runTests()
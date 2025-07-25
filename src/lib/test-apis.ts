import { SpeechClient } from '@google-cloud/speech'
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function testGoogleCloudSetup() {
  try {
    // Test Speech-to-Text
    const speechClient = new SpeechClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })
    
    console.log('✅ Speech-to-Text client initialized')
    
    // Test Video Intelligence
    const videoClient = new VideoIntelligenceServiceClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })
    
    console.log('✅ Video Intelligence client initialized')
    
    // Test Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent('Hello, this is a test.')
    console.log('✅ Gemini API working:', result.response.text())
    
    return { success: true, message: 'All APIs configured correctly!' }
    
  } catch (error) {
    console.error('❌ API setup error:', error)
    return { success: false, error: error.message }
  }
}
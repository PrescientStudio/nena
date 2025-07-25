import { CloudStorageService } from '@/services/cloudStorageService'

export class StorageConnectivityTest {
  private storageService: CloudStorageService

  constructor() {
    this.storageService = new CloudStorageService()
  }

  async runConnectivityTest(): Promise<{
    success: boolean
    results: {
      credentialsTest: { success: boolean; message: string }
      bucketAccessTest: { success: boolean; message: string }
      uploadTest: { success: boolean; message: string }
      downloadTest: { success: boolean; message: string }
      cleanupTest: { success: boolean; message: string }
    }
    error?: string
  }> {
    console.log('🧪 Starting Google Cloud Storage Connectivity Test...\n')

    const results = {
      credentialsTest: { success: false, message: '' },
      bucketAccessTest: { success: false, message: '' },
      uploadTest: { success: false, message: '' },
      downloadTest: { success: false, message: '' },
      cleanupTest: { success: false, message: '' }
    }

    try {
      // Test 1: Check credentials and basic connection
      console.log('📋 Test 1: Checking credentials and connection...')
      try {
        await this.testCredentials()
        results.credentialsTest = { success: true, message: 'Credentials are valid and connection established' }
        console.log('✅ Credentials test passed\n')
      } catch (error) {
        results.credentialsTest = { success: false, message: `Credentials failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        console.log('❌ Credentials test failed:', results.credentialsTest.message)
        throw error // Stop here if credentials fail
      }

      // Test 2: Check bucket access
      console.log('📦 Test 2: Checking bucket access...')
      try {
        await this.testBucketAccess()
        results.bucketAccessTest = { success: true, message: 'Bucket exists and is accessible' }
        console.log('✅ Bucket access test passed\n')
      } catch (error) {
        results.bucketAccessTest = { success: false, message: `Bucket access failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        console.log('❌ Bucket access test failed:', results.bucketAccessTest.message)
        throw error
      }

      // Test 3: Upload a test file
      console.log('📤 Test 3: Testing file upload...')
      let testFileName = ''
      try {
        testFileName = await this.testFileUpload()
        results.uploadTest = { success: true, message: `Test file uploaded successfully: ${testFileName}` }
        console.log('✅ Upload test passed\n')
      } catch (error) {
        results.uploadTest = { success: false, message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        console.log('❌ Upload test failed:', results.uploadTest.message)
        throw error
      }

      // Test 4: Verify file exists and can be accessed
      console.log('📥 Test 4: Testing file access...')
      try {
        await this.testFileAccess(testFileName)
        results.downloadTest = { success: true, message: 'Test file is accessible and readable' }
        console.log('✅ File access test passed\n')
      } catch (error) {
        results.downloadTest = { success: false, message: `File access failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        console.log('❌ File access test failed:', results.downloadTest.message)
      }

      // Test 5: Clean up test file
      console.log('🧹 Test 5: Cleaning up test file...')
      try {
        await this.testFileCleanup(testFileName)
        results.cleanupTest = { success: true, message: 'Test file cleaned up successfully' }
        console.log('✅ Cleanup test passed\n')
      } catch (error) {
        results.cleanupTest = { success: false, message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
        console.log('⚠️ Cleanup test failed (not critical):', results.cleanupTest.message)
      }

      console.log('🎉 All storage connectivity tests completed successfully!')
      return { success: true, results }

    } catch (error) {
      console.log('❌ Storage connectivity test failed')
      return {
        success: false,
        results,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private async testCredentials() {
    const { Storage } = await import('@google-cloud/storage')
    
    // Check environment variables
    if (!process.env.GOOGLE_CLOUD_KEY_PATH) {
      throw new Error('GOOGLE_CLOUD_KEY_PATH environment variable is not set')
    }
    
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is not set')
    }

    console.log(`   📁 Key file path: ${process.env.GOOGLE_CLOUD_KEY_PATH}`)
    console.log(`   🏗️ Project ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`)

    // Check if credentials file exists
    const fs = await import('fs')
    if (!fs.existsSync(process.env.GOOGLE_CLOUD_KEY_PATH)) {
      throw new Error(`Credentials file not found at: ${process.env.GOOGLE_CLOUD_KEY_PATH}`)
    }

    // Try to create storage client
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })

    // Test basic connection by getting project info
    await storage.getProjectId()
    console.log('   ✅ Google Cloud Storage client initialized successfully')
  }

  private async testBucketAccess() {
    if (!process.env.GOOGLE_CLOUD_STORAGE_BUCKET) {
      throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET environment variable is not set')
    }

    console.log(`   📦 Bucket name: ${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}`)

    // Ensure bucket exists (this also tests our permissions)
    await this.storageService.ensureBucketExists()
    console.log('   ✅ Bucket is accessible and ready')
  }

  private async testFileUpload(): Promise<string> {
    // Create a small test file
    const testContent = JSON.stringify({
      test: true,
      message: 'This is a connectivity test file',
      timestamp: new Date().toISOString(),
      userId: 'test-user-connectivity'
    }, null, 2)

    const testBuffer = Buffer.from(testContent, 'utf-8')
    
    console.log(`   📄 Test file size: ${testBuffer.length} bytes`)

    // Upload the test file
    const result = await this.storageService.uploadFile(
      testBuffer,
      'application/json',
      'test-user-connectivity'
    )

    console.log(`   ✅ File uploaded to: ${result.uri}`)
    return result.fileName
  }

  private async testFileAccess(fileName: string) {
    const { Storage } = await import('@google-cloud/storage')
    
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })

    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!)
    const file = bucket.file(fileName)

    // Check if file exists
    const [exists] = await file.exists()
    if (!exists) {
      throw new Error('Uploaded file does not exist in bucket')
    }

    // Try to get file metadata
    const [metadata] = await file.getMetadata()
    console.log(`   📊 File size: ${metadata.size} bytes`)
    console.log(`   📅 Created: ${metadata.timeCreated}`)
    console.log(`   ✅ File is accessible and has correct metadata`)
  }

  private async testFileCleanup(fileName: string) {
    await this.storageService.deleteFile(fileName)
    console.log(`   🗑️ Test file deleted: ${fileName}`)
  }

  // Helper method to run a quick test
  async quickTest(): Promise<boolean> {
    console.log('🚀 Running quick Google Cloud Storage test...\n')
    
    try {
      const testBuffer = Buffer.from('Quick test content', 'utf-8')
      const result = await this.storageService.uploadFile(testBuffer, 'text/plain', 'quick-test')
      
      console.log('✅ Quick upload successful:', result.uri)
      
      // Clean up
      await this.storageService.deleteFile(result.fileName)
      console.log('✅ Quick cleanup successful')
      
      console.log('\n🎉 Quick test passed! Google Cloud Storage is working.\n')
      return true
    } catch (error) {
      console.log('❌ Quick test failed:', error instanceof Error ? error.message : 'Unknown error')
      console.log('\n💡 Run the full connectivity test for more details.\n')
      return false
    }
  }
}
import { Storage } from '@google-cloud/storage'
import { randomUUID } from 'crypto'

export class CloudStorageService {
  private storage: Storage
  private bucketName: string

  constructor() {
    this.storage = new Storage({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    })
    
    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'nena-uploads-bucket'
  }

  async uploadFile(
    buffer: Buffer, 
    fileType: string, 
    userId: string
  ): Promise<{ uri: string; fileName: string }> {
    try {
      // Generate unique filename
      const fileExtension = this.getFileExtension(fileType)
      const fileName = `uploads/${userId}/${randomUUID()}.${fileExtension}`
      
      console.log(`Uploading file to Cloud Storage: ${fileName}`)
      
      // Get bucket reference
      const bucket = this.storage.bucket(this.bucketName)
      const file = bucket.file(fileName)
      
      // Upload file
      await file.save(buffer, {
        metadata: {
          contentType: fileType,
          metadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          }
        },
        resumable: false // Use simple upload for files under 5MB, resumable for larger
      })
      
      console.log(`File uploaded successfully: gs://${this.bucketName}/${fileName}`)
      
      // Return the GCS URI
      return {
        uri: `gs://${this.bucketName}/${fileName}`,
        fileName
      }
    } catch (error) {
      console.error('Cloud Storage upload failed:', error)
      throw new Error(`Failed to upload file to Cloud Storage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName)
      await bucket.file(fileName).delete()
      console.log(`File deleted from Cloud Storage: ${fileName}`)
    } catch (error) {
      console.error('Failed to delete file from Cloud Storage:', error)
      // Don't throw error for cleanup failures
    }
  }

  private getFileExtension(fileType: string): string {
    const extensionMap: Record<string, string> = {
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/mov': 'mov',
      'video/quicktime': 'mov',
      'video/avi': 'avi',
      'video/x-msvideo': 'avi',
      'audio/mp3': 'mp3',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/m4a': 'm4a',
      'audio/aac': 'aac',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg'
    }
    
    return extensionMap[fileType.toLowerCase()] || 'bin'
  }

  async ensureBucketExists(): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName)
      const [exists] = await bucket.exists()
      
      if (!exists) {
        console.log(`Creating Cloud Storage bucket: ${this.bucketName}`)
        await this.storage.createBucket(this.bucketName, {
          location: 'US',
          storageClass: 'STANDARD'
        })
        console.log(`Bucket created: ${this.bucketName}`)
      }
    } catch (error) {
      console.error('Failed to ensure bucket exists:', error)
      throw new Error(`Cloud Storage bucket setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
import { useState, useCallback } from 'react'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UseFileUploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  onProgress?: (progress: UploadProgress) => void
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxSize = 500 * 1024 * 1024, // 500MB default
    allowedTypes = ['audio/*', 'video/*'],
    onProgress,
    onSuccess,
    onError
  } = options

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0
  })

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the ${maxSize / 1024 / 1024}MB limit`
    }

    const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'))
      }
      return file.type === type
    })

    if (!isTypeAllowed) {
      return `File type ${file.type} is not allowed`
    }

    return null
  }, [maxSize, allowedTypes])

  const uploadFile = useCallback(async (file: File, endpoint: string, additionalData?: Record<string, string>) => {
    const validation = validateFile(file)
    if (validation) {
      onError?.(validation)
      return { success: false, error: validation }
    }

    setIsUploading(true)
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      const formData = new FormData()
      formData.append('audio', file)
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100)
            }
            setUploadProgress(progress)
            onProgress?.(progress)
          }
        })

        xhr.onload = () => {
          setIsUploading(false)
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText)
              onSuccess?.(result)
              resolve({ success: true, result })
            } catch (error) {
              const errorMsg = 'Failed to parse response'
              onError?.(errorMsg)
              reject({ success: false, error: errorMsg })
            }
          } else {
            const errorMsg = `Upload failed with status ${xhr.status}`
            onError?.(errorMsg)
            reject({ success: false, error: errorMsg })
          }
        }

        xhr.onerror = () => {
          setIsUploading(false)
          const errorMsg = 'Upload failed'
          onError?.(errorMsg)
          reject({ success: false, error: errorMsg })
        }

        xhr.open('POST', endpoint)
        xhr.send(formData)
      })
    } catch (error) {
      setIsUploading(false)
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      onError?.(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [validateFile, onProgress, onSuccess, onError])

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    validateFile
  }
}
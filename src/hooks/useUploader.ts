// ** React Imports
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react'

// ** External Imports
import type {
  ReadPermission,
  UploadOptions,
  UploadProgress,
} from '@emd-cloud/sdk'

// ** Source code Imports
import { ApplicationContext } from 'src/components/ApplicationProvider/context'

// Re-export SDK's ReadPermission for backward compatibility
export { ReadPermission as ReadPermissionsType } from '@emd-cloud/sdk'

export type FileType = {
  id: string
  name?: string
  fileName?: string
  fileUrl?: string
  status: 'started' | 'progress' | 'success' | 'failed'
  progress?: number | string
  bytesUploaded?: number
  bytesTotal?: number
  methods?: {
    stop: () => void
  }
  error?: Error
}

export interface UploaderType {
  chunkSize?: number
  integration?: string
  headers?: Record<string, string | number | boolean>
  readPermission?: ReadPermission
  permittedUsers?: string[]
  presignedUrlTTL?: number
  retryDelays?: number[]
  onBeforeUpload?: (files: File[]) => boolean
  onBeforeRequest?: (req: any) => void
  onUpdate?: (files: FileType[]) => void
  onSuccess?: (files: FileType[]) => void
  onFailed?: (files: FileType[]) => void
}

/**
 * Hook for uploading files to EMD Cloud storage using the SDK's TUS protocol implementation.
 *
 * This hook provides a React-friendly interface for the EMD Cloud SDK uploader with support for:
 * - Multiple concurrent file uploads with progress tracking
 * - Resumable uploads (can survive connection interruptions)
 * - Flexible permission settings (public, authenticated users, staff only, or specific users)
 * - Chunked uploads with configurable chunk size (default: 5MB)
 * - Automatic retry with configurable delays
 * - Upload cancellation/abort functionality
 * - Request interception via onBeforeRequest callback
 *
 * **Configuration Note**: The hook uses apiUrl and app configuration from ApplicationProvider.
 * Make sure your application is wrapped with ApplicationProvider before using this hook.
 *
 * @param {UploaderType} params - Configuration options for the uploader
 * @param {number} [params.chunkSize=5242880] - Size of each upload chunk in bytes (default: 5MB)
 * @param {string} [params.integration='default'] - S3 integration identifier
 * @param {Record<string, string|number|boolean>} [params.headers] - Additional headers for upload requests
 * @param {ReadPermission} [params.readPermission='onlyAppStaff'] - File access permission level
 * @param {string[]} [params.permittedUsers] - User IDs with access (required when readPermission is 'onlyPermittedUsers')
 * @param {number} [params.presignedUrlTTL=60] - Presigned URL lifetime in minutes
 * @param {number[]} [params.retryDelays=[0,3000,5000,10000,20000]] - Retry delay intervals in milliseconds
 * @param {(files: File[]) => boolean} [params.onBeforeUpload] - Callback before upload starts (return false to cancel)
 * @param {(req: any) => void} [params.onBeforeRequest] - Callback before each HTTP request (for request interception)
 * @param {(files: FileType[]) => void} [params.onUpdate] - Callback when file statuses update (fires periodically during upload, stops when all files complete)
 * @param {(files: FileType[]) => void} [params.onSuccess] - Callback fired once when all files in the batch succeed
 * @param {(files: FileType[]) => void} [params.onFailed] - Callback fired once when any file in the batch fails
 *
 * @returns {{ uploadFiles: (files: File[]) => void, isProcess: boolean, resetUploader: () => void }}
 * - `uploadFiles`: Function to initiate file uploads
 * - `isProcess`: Boolean indicating if any uploads are in progress
 * - `resetUploader`: Function to clear all internal state and file references (call after upload completion to free memory)
 *
 * @example
 * ```tsx
 * import { useUploader, ReadPermission } from '@emd-cloud/react-components'
 * import { useState } from 'react'
 *
 * const FileUploadComponent = () => {
 *   const [files, setFiles] = useState([])
 *
 *   const { uploadFiles, isProccess, resetUploader } = useUploader({
 *     readPermission: ReadPermission.OnlyAuthUser,
 *     chunkSize: 10 * 1024 * 1024, // 10MB chunks
 *     onBeforeUpload: (files) => {
 *       // Validate file sizes
 *       const maxSize = 100 * 1024 * 1024 // 100MB
 *       if (files.some(f => f.size > maxSize)) {
 *         alert('Some files exceed 100MB limit')
 *         return false
 *       }
 *       return true
 *     },
 *     onBeforeRequest: (req) => {
 *       // Add custom headers or log requests
 *       console.log('Upload request:', req.getURL())
 *     },
 *     onUpdate: (updatedFiles) => {
 *       // Fires periodically during upload
 *       setFiles(updatedFiles)
 *       console.log('Upload progress:', updatedFiles)
 *     },
 *     onSuccess: (completedFiles) => {
 *       // Fires once when all files succeed
 *       console.log('All files uploaded successfully!')
 *       completedFiles.forEach(file => {
 *         console.log(`File uploaded: ${file.fileUrl}`)
 *       })
 *       // Clear state after successful upload
 *       setTimeout(() => resetUploader(), 2000)
 *     },
 *     onFailed: (completedFiles) => {
 *       // Fires once when any file fails
 *       console.error('Upload batch failed!')
 *       completedFiles.forEach(file => {
 *         if (file.status === 'failed') {
 *           console.error(`Failed: ${file.fileName} - ${file.error?.message}`)
 *         }
 *       })
 *       // Clear state after failed upload
 *       setTimeout(() => resetUploader(), 2000)
 *     }
 *   })
 *
 *   const handleFileSelect = (event) => {
 *     const selectedFiles = Array.from(event.target.files)
 *     uploadFiles(selectedFiles)
 *   }
 *
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         multiple
 *         onChange={handleFileSelect}
 *         disabled={isProccess}
 *       />
 *       {isProccess && <p>Uploading...</p>}
 *
 *       <div>
 *         {files.map((file) => (
 *           <div key={file.id}>
 *             <span>{file.fileName}</span>
 *             <span>{file.status}</span>
 *             {file.progress && <progress value={file.progress} max="100" />}
 *             {file.fileUrl && <a href={file.fileUrl}>Download</a>}
 *             {file.methods?.stop && (
 *               <button onClick={file.methods.stop}>Cancel</button>
 *             )}
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Example with specific user permissions
 * const { uploadFiles } = useUploader({
 *   readPermission: ReadPermission.OnlyPermittedUsers,
 *   permittedUsers: ['user-id-1', 'user-id-2', 'user-id-3'],
 *   onUpdate: (files) => console.log('Upload status:', files)
 * })
 * ```
 */
const useUploader = ({
  chunkSize,
  integration,
  headers,
  readPermission = 'onlyAppStaff' as ReadPermission,
  permittedUsers,
  presignedUrlTTL = 60,
  retryDelays = [0, 3000, 5000, 10000, 20000],
  onBeforeUpload = () => true,
  onBeforeRequest,
  onUpdate,
  onSuccess,
  onFailed,
}: UploaderType): {
  uploadFiles: (files: File[]) => void
  isProcess: boolean
  resetUploader: () => void
} => {
  const isFirstRun = useRef(true)
  const [isProcess, setIsProcess] = useState<boolean>(false)
  const [observedFiles, setObservedFiles] = useState<FileType[]>([])
  const filesMapRef = useRef<Map<string, FileType>>(new Map())
  const batchSizeRef = useRef<number>(0)
  const batchCallbacksFiredRef = useRef<boolean>(false)
  const batchCompleteRef = useRef<boolean>(false)

  const appData = useContext(ApplicationContext)

  const integrationId = useMemo(() => integration || 'default', [integration])

  const sdkUploader = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return appData.sdkInstance.uploader
  }, [appData.sdkInstance])

  // Check if batch is complete and fire appropriate callbacks
  const checkBatchCompletion = useCallback(() => {
    // Skip if callbacks already fired or batch not initialized
    if (batchCallbacksFiredRef.current || batchSizeRef.current === 0) {
      return
    }

    const allFiles = Array.from(filesMapRef.current.values())

    // Check if all files have reached a final state (success or failed)
    const completedFiles = allFiles.filter(
      (file) => file.status === 'success' || file.status === 'failed'
    )

    // If not all files are done, return
    if (completedFiles.length < batchSizeRef.current) {
      return
    }

    // Mark batch as complete
    batchCompleteRef.current = true
    batchCallbacksFiredRef.current = true

    // Check if any files failed
    const failedFiles = allFiles.filter((file) => file.status === 'failed')

    if (failedFiles.length > 0) {
      // At least one file failed - call onFailed
      if (onFailed) {
        onFailed(allFiles)
      }
    } else {
      // All files succeeded - call onSuccess
      if (onSuccess) {
        onSuccess(allFiles)
      }
    }
  }, [onSuccess, onFailed])

  // Update observed files array when map changes
  useEffect(() => {
    const filesInProgress = Array.from(filesMapRef.current.values()).some(
      ({ status }) => status === 'progress',
    )
    setIsProcess(filesInProgress)

    if (isFirstRun.current) {
      isFirstRun.current = false
    } else {
      // Only call onUpdate if batch is not complete
      if (!batchCompleteRef.current && onUpdate) {
        onUpdate(observedFiles)
      }
    }

    // Check if batch is complete
    checkBatchCompletion()
  }, [observedFiles, onUpdate, checkBatchCompletion])

  const uploadFiles = useCallback(
    (files: File[]) => {
      // Check if SDK uploader is available
      if (!sdkUploader) {
        throw new Error(
          'SDK uploader is not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency and ApplicationProvider is properly configured.',
        )
      }

      const isContinue = onBeforeUpload(files)
      if (!isContinue) return

      // Initialize batch tracking for new upload batch
      batchSizeRef.current = files.length
      batchCallbacksFiredRef.current = false
      batchCompleteRef.current = false

      // Upload options for SDK
      const uploadOptions: UploadOptions = {
        integration: integrationId,
        chunkSize,
        retryDelays,
        readPermission,
        permittedUsers,
        presignedUrlTTL,
        headers,
        ...(onBeforeRequest && { onBeforeRequest }),
      }

      // Start uploads and initialize file tracking
      files.forEach((file) => {
        try {
          const { uploadId, file: uploadFile } =
            sdkUploader.uploadFile(file, uploadOptions, {
              onProgress: (progress: UploadProgress) => {
                const currentFile = filesMapRef.current.get(uploadId)
                if (currentFile) {
                  const updatedFile: FileType = {
                    ...currentFile,
                    status: 'progress',
                    progress: progress.percentage.toFixed(2),
                    bytesUploaded: progress.bytesUploaded,
                    bytesTotal: progress.bytesTotal,
                  }
                  filesMapRef.current.set(uploadId, updatedFile)
                  setObservedFiles(Array.from(filesMapRef.current.values()))
                }
              },
              onSuccess: (_fileId: string, fileUrl: string) => {
                const currentFile = filesMapRef.current.get(uploadId)
                if (currentFile) {
                  const updatedFile: FileType = {
                    ...currentFile,
                    status: 'success',
                    fileUrl,
                  }
                  filesMapRef.current.set(uploadId, updatedFile)
                  setObservedFiles(Array.from(filesMapRef.current.values()))
                }
              },
              onError: (error: Error) => {
                const currentFile = filesMapRef.current.get(uploadId)
                if (currentFile) {
                  const updatedFile: FileType = {
                    ...currentFile,
                    status: 'failed',
                    error,
                  }
                  filesMapRef.current.set(uploadId, updatedFile)
                  setObservedFiles(Array.from(filesMapRef.current.values()))
                }
              },
            })

          // Create initial file entry
          const fileEntry: FileType = {
            id: uploadId,
            fileName: file.name,
            status: 'started',
            progress: 0,
            methods: {
              stop: () => {
                uploadFile.abort()
                filesMapRef.current.delete(uploadId)
                setObservedFiles(Array.from(filesMapRef.current.values()))
              },
            },
          }

          filesMapRef.current.set(uploadId, fileEntry)
        } catch (error) {
          console.error('Failed to start upload:', error)
          // Create a failed file entry for the error
          const errorFile: FileType = {
            id: `error-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            status: 'failed',
            error: error as Error,
          }
          filesMapRef.current.set(errorFile.id, errorFile)
        }
      })

      // Update state with all new files at once
      setObservedFiles(Array.from(filesMapRef.current.values()))
    },
    [
      sdkUploader,
      integrationId,
      chunkSize,
      retryDelays,
      readPermission,
      permittedUsers,
      presignedUrlTTL,
      headers,
      onBeforeUpload,
      onBeforeRequest,
      checkBatchCompletion,
    ],
  )

  const resetUploader = useCallback(() => {
    filesMapRef.current.clear()
    setObservedFiles([])
    batchSizeRef.current = 0
    batchCallbacksFiredRef.current = false
    batchCompleteRef.current = false
    isFirstRun.current = true
  }, [])

  return { uploadFiles, isProcess: isProcess, resetUploader }
}

export default useUploader

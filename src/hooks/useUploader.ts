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
  onUpdate: (files: FileType[]) => void
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
 * @param {(files: FileType[]) => void} params.onUpdate - Callback when file statuses update
 *
 * @returns {{ uploadFiles: (files: File[]) => void, isProcess: boolean }}
 * - `uploadFiles`: Function to initiate file uploads
 * - `isProcess`: Boolean indicating if any uploads are in progress
 *
 * @example
 * ```tsx
 * import { useUploader, ReadPermission } from '@emd-cloud/react-components'
 * import { useState } from 'react'
 *
 * const FileUploadComponent = () => {
 *   const [files, setFiles] = useState([])
 *
 *   const { uploadFiles, isProccess } = useUploader({
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
 *       setFiles(updatedFiles)
 *
 *       // Check for completed/failed uploads
 *       updatedFiles.forEach(file => {
 *         if (file.status === 'success') {
 *           console.log(`File uploaded: ${file.fileUrl}`)
 *         } else if (file.status === 'failed') {
 *           console.error(`Upload failed: ${file.error?.message}`)
 *         }
 *       })
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
}: UploaderType): {
  uploadFiles: (files: File[]) => void
  isProcess: boolean
} => {
  const isFirstRun = useRef(true)
  const [isProcess, setIsProcess] = useState<boolean>(false)
  const [observedFiles, setObservedFiles] = useState<FileType[]>([])
  const filesMapRef = useRef<Map<string, FileType>>(new Map())

  const appData = useContext(ApplicationContext)

  const integrationId = useMemo(() => integration || 'default', [integration])

  const sdkUploader = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return appData.sdkInstance.uploader
  }, [appData.sdkInstance])

  // Update observed files array when map changes
  useEffect(() => {
    const filesInProgress = Array.from(filesMapRef.current.values()).some(
      ({ status }) => status === 'progress',
    )
    setIsProcess(filesInProgress)

    if (isFirstRun.current) {
      isFirstRun.current = false
    } else {
      onUpdate(observedFiles)
    }
  }, [observedFiles, onUpdate])

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

      // Start uploads and build initial file tracking
      const newFiles: FileType[] = []

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
              onSuccess: (fileId: string, fileUrl: string) => {
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
          newFiles.push(fileEntry)
        } catch (error) {
          console.error('Failed to start upload:', error)
          // Create a failed file entry for the error
          const errorFile: FileType = {
            id: `error-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            status: 'failed',
            error: error as Error,
          }
          newFiles.push(errorFile)
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
    ],
  )

  return { uploadFiles, isProcess: isProcess }
}

export default useUploader

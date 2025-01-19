// ** React Importsi
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react'

// ** Modules Imports
import { Upload } from 'tus-js-client'
import { v4 as uuidv4 } from 'uuid'

// ** Source code Imports
import { ApplicationContext } from '../components/ApplicationProvider/context'

export type UploaderOptions = {
  apiUrl: string
  app: string
}

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
}

export enum ReadPermissionsType {
  Public = 'public',
  OnlyAuthUser = 'onlyAuthUser',
  OnlyAppStaff = 'onlyAppStaff',
}

export interface UploaderType {
  options?: UploaderOptions
  chunkSize?: number
  integration?: string
  headers?: Record<string, string | number | boolean>
  readPermission?: ReadPermissionsType
  presignedUrlTTL?: number
  retryDelays?: number[]
  onBeforeUpload?: (files: File[]) => boolean
  onUpdate: (files: FileType[]) => void
}

const useUploader = ({
  options,
  chunkSize,
  integration,
  headers,
  readPermission = ReadPermissionsType.OnlyAppStaff,
  presignedUrlTTL = 60,
  retryDelays = [0, 3000, 5000, 10000, 20000],
  onBeforeUpload = () => true,
  onUpdate,
}: UploaderType) => {
  const isFirstRun = useRef(true)
  const [isProccess, setProccess] = useState<boolean>(false)
  const [observedfiles, setObservedFiles] = useState<FileType[]>([])

  const appData = useContext(ApplicationContext)

  const integrationId = useMemo(() => integration || 'default', [integration])

  const getEndpointUrl = useCallback(() => {
    const apiUrl = options?.apiUrl || appData?.apiUrl
    const app = options?.app || appData?.app

    return `${apiUrl}/api/${app}/uploader/chunk/${integrationId}/s3/`
  }, [options, integrationId, appData])

  const getFileUrl = useCallback(
    (fileId: string) => {
      const apiUrl = options?.apiUrl || appData?.apiUrl
      const app = options?.app || appData?.app

      return `${apiUrl}/api/${app}/uploader/chunk/${integrationId}/file/${fileId}`
    },
    [options, integrationId, appData],
  )

  useEffect(() => {
    const filesInProgress = !!observedfiles.find(
      ({ status }) => status === 'progress',
    )
    setProccess(filesInProgress)

    if (isFirstRun.current) isFirstRun.current = false
    else onUpdate(observedfiles)
  }, [observedfiles])

  const uploadFiles = useCallback(
    (files: File[]) => {
      const uploadFile = (file: File, fileId: string) => {
        const upload = new Upload(file, {
          endpoint: getEndpointUrl(),
          chunkSize,
          retryDelays,
          headers: {
            ...(appData.user?.token && {
              Authorization: `token ${appData.user.token}`,
            }),
            ...headers,
          },
          metadata: {
            filename: file.name,
            filetype: file.type,
            read_permission: readPermission,
            presigned_url_ttl: presignedUrlTTL.toString(),
          },
          onError: (error) => {
            setObservedFiles((state: FileType[]) => {
              return state.map((item) => {
                if (item.id === fileId)
                  return {
                    ...item,
                    status: 'failed',
                    error,
                  }

                return item
              })
            })
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const progress = ((bytesUploaded / bytesTotal) * 100).toFixed(2)

            setObservedFiles((state: FileType[]) => {
              return state.map((item) => {
                if (item.id === fileId)
                  return {
                    ...item,
                    status: 'progress',
                    progress,
                    bytesUploaded,
                    bytesTotal,
                  }

                return item
              })
            })
          },
          onSuccess: (payload) => {
            console.log(upload.url)
            const xFileDownloadId =
              payload.lastResponse.getHeader('x-file-download-id')

            setObservedFiles((state: FileType[]) => {
              return state.map((item) => {
                const fileUrl = xFileDownloadId
                  ? getFileUrl(xFileDownloadId)
                  : undefined

                if (item.id === fileId) {
                  return {
                    ...item,
                    status: xFileDownloadId ? 'success' : 'failed',
                    fileName: file.name,
                    fileUrl,
                  }
                }

                return item
              })
            })
          },
        })

        return upload
      }

      const isContinue = onBeforeUpload(files)

      if (!isContinue) return

      const data: FileType[] = files.map((file) => {
        const id = uuidv4()

        const upload = uploadFile(file, id)
        upload.start()

        const stop = () => {
          upload.abort()

          setObservedFiles((state: FileType[]) => {
            return state.filter((item) => item.id !== id)
          })
        }

        return {
          id,
          methods: { stop },
          fileName: file.name,
          status: 'started',
          progress: 0,
        }
      })

      setObservedFiles(data)
    },
    [onBeforeUpload],
  )

  return { uploadFiles, isProccess }
}

export default useUploader

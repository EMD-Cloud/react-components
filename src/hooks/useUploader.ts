// ** React Importsi
import { useRef, useState, useEffect, useCallback, useContext } from 'react'

// ** Modules Imports
import { Upload } from 'tus-js-client'
import { v4 as uuidv4 } from 'uuid'

// ** Source code Imports
import ApplicationContext from '../components/ApplicationProvider/context'

type UploaderOptions = {
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
    stop?: () => void
  }
}

interface UploaderType {
  options?: UploaderOptions
  integration?: string
  headers?: Record<string, string | number | boolean>
  retryDelays?: number[]
  onBeforeUpload?: (files: File[]) => boolean
  onUpdate: (files: FileType[]) => void
}

const useUploader = ({
  options,
  integration,
  headers,
  retryDelays = [0, 3000, 5000, 10000, 20000],
  onBeforeUpload = () => true,
  onUpdate,
}: UploaderType) => {
  const isFirstRun = useRef(true)
  const [isProccess, setProccess] = useState<boolean>(false)
  const [observedfiles, setObservedFiles] = useState<FileType[]>([])

  const appData = useContext(ApplicationContext)

  const getEndpointUrl = useCallback(() => {
    const apiUrl = options?.apiUrl || appData?.apiUrl
    const app = options?.app || appData?.app

    return `https://${apiUrl}/api/${app}/uploader/chunk/${integration}/s3/`
  }, [options, integration, appData])

  const getFileUrl = useCallback(() => {
    const apiUrl = options?.apiUrl || appData?.apiUrl
    const app = options?.app || appData?.app

    return `https://${apiUrl}/api/${app}/uploader/chunk/${integration}/file/`
  }, [options, integration, appData])

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
          retryDelays,
          headers: {
            ...(appData?.token && { Authorization: `token ${appData.token}` }),
            ...headers,
          },
          metadata: {
            filename: file.name,
            filetype: file.type,
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
          onSuccess: () => {
            setObservedFiles((state: FileType[]) => {
              return state.map((item) => {
                const fileUrl = `${getFileUrl()}/${upload.url?.split('/').pop()}`

                if (item.id === fileId) {
                  return {
                    ...item,
                    name: item.name,
                    status: 'success',
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

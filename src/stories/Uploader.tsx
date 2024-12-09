import * as React from 'react'
import { FileType, UploaderOptions, UploaderType } from '../hooks/useUploader'
import { useUploader, useDropzone } from '..'

interface IProps {
  options: UploaderOptions
  chunkSize?: number
  headers: Record<string, string | number | boolean>
  disabled?: boolean
  maxNumberOfFiles?: number
  accept?: Record<string, string[]>
  readPermission?: UploaderType['readPermission']
}

const Uploader = ({
  options,
  chunkSize,
  headers,
  readPermission,
  disabled = false,
  maxNumberOfFiles = 0,
  accept = { "*": [] }
}: IProps) => {
  const [value, setValue] = React.useState<FileType[]>([])
  const [uploadingFiles, setUploadingFiles] = React.useState<FileType[]>([])
  const [isUploading, setUploading] = React.useState(false)

  const onUpdate = (data: FileType[]) => setValue((state) => [...state, ...data])
  const onDelete = (index: number) => setValue((state) => state.filter((_, i) => i !== index))

  const disabledUploadingConditions = 
    isUploading ||
    disabled ||
    !!(maxNumberOfFiles && value.length === maxNumberOfFiles)

  const { uploadFiles } = useUploader({
    options,
    chunkSize,
    headers,
    readPermission,
    onBeforeUpload: (files) => {
      const allFilesLength = value.length + files.length

      if (maxNumberOfFiles && maxNumberOfFiles < allFilesLength) return false

      setUploading(true)

      return true
    },
    onUpdate: (files) => {
      const uploadedOrFailedFiles = files.filter(({ status }) => status === 'success' || status === 'failed')
      if (uploadedOrFailedFiles.length === files.length) {
        const uploadedFiles = uploadedOrFailedFiles.filter(({ status }) => status === 'success')
        onUpdate(uploadedFiles)

        setUploadingFiles([])
        setUploading(false)

        return
      }

      setUploadingFiles(files)
    }
  })

  const { rootProps, inputProps, dragStatus } = useDropzone({
    accept,
    multiple: maxNumberOfFiles !== 1,
    disabled: disabledUploadingConditions,
    onDroped: (files) => {
      uploadFiles(files)
    }
  })

  return (
    <div>
      <div style={{ cursor: 'pointer' }} {...rootProps}>
        {dragStatus.isDraggingOver ? (
          <div>Add file</div>
        ) : (
          <div>
            { 
              isUploading
                ? 'Uploading...'
                : 'Select files'
            }
          </div>
        )}
        <input {...inputProps} hidden />
      </div>
      <ul>
        {value?.map(({ fileName, fileUrl }, index) => (
          <li key={`uploaded-${index}`}>
            <a href={fileUrl}>{fileName}</a>
            <div onClick={() => onDelete(index)}>Delete</div>
          </li>
        ))}
        {uploadingFiles?.map(({
          id,
          methods,
          fileName,
          status,
          progress
        }) => (
          <li key={id}>
            <span>{fileName}</span>
            {status === 'started' && (
              <div>Uploading</div>
            )}
            {status === 'progress' && (
              <div>{progress}%</div>
            )}
            {status === 'failed' && (
              <div>Failed</div>
            )}
            {status === 'success' && (
              <div>Success</div>
            )}
            {(status === 'started' || status === 'progress') && (
              <div onClick={() => methods?.stop()}>Cancel</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Uploader


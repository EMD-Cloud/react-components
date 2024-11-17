import * as React from 'react'
import { FileType, UploaderOptions } from '../hooks/useUploader'
import { useUploader, useDropzone } from '..'

interface IProps {
  options: UploaderOptions
  headers: Record<string, string | number | boolean>
  disabled?: boolean
  maxNumberOfFiles?: number
  accept?: Record<string, string[]>
}

const Uploader = ({
  options,
  headers,
  disabled = false,
  maxNumberOfFiles = 0,
  accept = { "*": [] }
}: IProps) => {
  const [value, setValue] = React.useState<FileType[]>([])
  const [uploadingFiles, setUploadingFiles] = React.useState<FileType[]>([])
  const [isUploading, setUploading] = React.useState(false)

  const onUpdate = (data: FileType[]) => setValue(data)
  const onDelete = (index: number) => setValue((state) => state.filter((_, i) => i !== index))

  const disabledUploadingConditions = 
    isUploading ||
    disabled ||
    !!(maxNumberOfFiles && value.length === maxNumberOfFiles)

  const { uploadFiles } = useUploader({
    options,
    headers,
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
          <div>Добавить</div>
        ) : (
          <div>
            { 
              isUploading
                ? 'Загрузка...'
                : 'Выберите файл'
            }
          </div>
        )}
        <input {...inputProps} hidden />
      </div>
      <ul>
        {value?.map(({ fileName, fileUrl }, index) => (
          <li key={`uploaded-${index}`}>
            <a href={fileUrl}>{fileName}</a>
            <div onClick={() => onDelete(index)}>Удалить</div>
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
               <div>Загрузка</div>
            )}
            {status === 'progress' && (
              <div>{progress}%</div>
            )}
            {status === 'failed' && (
              <div>Ошибка</div>
            )}
            {status === 'success' && (
              <div>Загружено</div>
            )}
            {(status === 'started' || status === 'progress') && (
              <div onClick={() => methods?.stop()}>Отмена</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Uploader


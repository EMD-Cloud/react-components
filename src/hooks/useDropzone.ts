// ** React Imports
import {
  useState,
  useMemo,
  useCallback,
  useRef,
  ChangeEvent,
  DragEvent,
} from 'react'

// ** Source code Imports
import { acceptPropAsAcceptAttr } from 'src/tools/uploader'

interface DropzoneType {
  accept?: Record<string, string[]>
  onDragOver?: (event: DragEvent<HTMLInputElement>) => void
  onDragLeave?: (event: DragEvent<HTMLInputElement>) => void
  onDrop?: (event: DragEvent<HTMLInputElement>) => void
  onDroped?: (files: File[]) => void
  multiple?: boolean
  disabled?: boolean
}

const useDropzone = ({
  accept = { '*': [] },
  onDragOver = () => {
    /* Empty... */
  },
  onDragLeave = () => {
    /* Empty... */
  },
  onDrop = () => {
    /* Empty... */
  },
  onDroped = () => {
    /* Empty... */
  },
  multiple = true,
  disabled = false,
}: DropzoneType) => {
  const timeout = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragStatus, setDragStatus] = useState({ isDraggingOver: false })
  const acceptAttr = useMemo(() => acceptPropAsAcceptAttr(accept), [accept])

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || disabled) return

      const files = Array.from(event.target.files)
      if (files.length) onDroped(files)

      event.target.value = ''
    },
    [onDroped, disabled],
  )

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLInputElement>) => {
      if (disabled) return

      event.preventDefault()
      event.stopPropagation()

      const { types } = event.dataTransfer
      const hasFiles = types.some((type: string) => type === 'Files')

      if (!hasFiles) {
        event.dataTransfer.dropEffect = 'none'
        clearTimeout(timeout.current)

        return
      }

      event.dataTransfer.dropEffect = 'copy'

      clearTimeout(timeout.current)
      setDragStatus({ isDraggingOver: true })

      onDragOver(event)
    },
    [onDragOver, disabled],
  )

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLInputElement>) => {
      if (disabled) return

      event.preventDefault()
      event.stopPropagation()

      clearTimeout(timeout.current)

      timeout.current = setTimeout(() => {
        setDragStatus({ isDraggingOver: false })
      }, 50)

      onDragLeave(event)
    },
    [onDragLeave, disabled],
  )

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLInputElement>) => {
      if (disabled) return

      event.preventDefault()

      clearTimeout(timeout.current)

      setDragStatus({ isDraggingOver: false })

      onDrop(event)

      // Add all dropped files
      const files = Array.from(event.dataTransfer.files).filter(({ type }) => {
        const acceptedTypes = acceptAttr?.replace(/\*/g, '').split(',')
        let isExist = false

        acceptedTypes?.forEach((item: string) => {
          if (type.includes(item)) isExist = true
        })

        return isExist
      })
      if (files.length) onDroped(files)
    },
    [onDrop, onDroped, disabled, acceptAttr],
  )

  const open = useCallback(() => !disabled && inputRef.current?.click(), [disabled])

  const rootProps = useMemo(() => ({
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onClick: open,
  }), [handleDragOver, handleDragLeave, handleDrop, open])

  const inputProps = useMemo(() => ({
    ref: inputRef,
    multiple,
    accept: acceptAttr,
    type: 'file' as const,
    onChange: onInputChange,
  }), [multiple, acceptAttr, onInputChange])

  return {
    rootProps,
    inputProps,
    open,
    dragStatus,
  }
}

export default useDropzone

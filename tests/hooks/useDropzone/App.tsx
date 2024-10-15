import React from 'react'
import { useDropzone } from '@lib'

interface IProps {
  multiple: boolean
  accept: Record<string, string[]>
  disabled?: boolean
}

const App = ({
  multiple,
  accept,
  disabled = false,
}: IProps) => {
  const [value, setValue] = React.useState<File[]>([])

  const { rootProps, inputProps } = useDropzone({
    accept,
    multiple,
    disabled,
    onDroped: (files) => {
      setValue(files)
    }
  })

  return (
    <div {...rootProps}>
      <div data-testid='add-file'>Добавить</div>
      <input {...inputProps} hidden />
      <div data-testid='files-length'>{value.length}</div>
    </div>
  )
}

export default App

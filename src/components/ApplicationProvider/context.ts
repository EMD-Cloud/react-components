// ** React Imports
import { createContext } from 'react'

// ** Source code Imports
import { ApplicationctionType, ApplicationDataType } from './state-manage'

export const ApplicationContext = createContext<ApplicationDataType>({
  apiUrl: '',
  app: '',
  tokenType: '',
  user: null,
})

export const DispatchContext = createContext<
  React.Dispatch<ApplicationctionType>
>(() => {})

// ** React Imports
import { createContext } from 'react'

// ** Source code Imports
import { ApplicationActionType, ApplicationDataType } from './state-manage'

export const ApplicationContext = createContext<ApplicationDataType>({
  apiUrl: '',
  app: '',
  tokenType: '',
  user: null,
  sdkInstance: null,
})

export const DispatchContext = createContext<
  React.Dispatch<ApplicationActionType>
>(() => {})

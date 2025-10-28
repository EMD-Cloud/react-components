// ** React Imports
import { createContext, Dispatch } from 'react'

// ** Source code Imports
import { ApplicationActionType, ApplicationDataType } from './state-manager'

export const ApplicationContext = createContext<ApplicationDataType>({
  apiUrl: '',
  websocketUrl: '',
  app: '',
  tokenType: '',
  user: null,
  sdkInstance: null,
})

export const DispatchContext = createContext<
  Dispatch<ApplicationActionType>
>(() => {})

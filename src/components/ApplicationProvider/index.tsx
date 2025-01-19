// ** React Imports
import * as React from 'react'

// ** Source code Imports
import { ApplicationContext, DispatchContext } from './context'
import reducer, {
  ApplicationDataType,
  ApplicationctionType,
} from './state-manage'

interface IApplicationProviderProps {
  apiUrl?: string
  app: string
  tokenType?: string
  children: React.ReactNode
}

const ApplicationProvider = ({
  app,
  apiUrl = 'https://api.emd.one',
  tokenType = 'token',
  children,
}: IApplicationProviderProps) => {
  const [value, dispatch] = React.useReducer<
    (
      state: ApplicationDataType,
      { type, payload }: ApplicationctionType,
    ) => ApplicationDataType
  >(reducer, {
    apiUrl,
    app,
    tokenType,
    user: null,
  })

  return (
    <ApplicationContext.Provider value={value}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </ApplicationContext.Provider>
  )
}

export default ApplicationProvider

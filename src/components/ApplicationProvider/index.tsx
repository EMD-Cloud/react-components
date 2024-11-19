// ** React Imports
import * as React from 'react'

// ** Source code Imports
import ApplicationContext from './context'
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
  apiUrl = 'api.emd.one',
  app,
  tokenType = 'token',
  children,
}: IApplicationProviderProps) => {
  const [value] = React.useReducer<
    (
      state: ApplicationDataType,
      { type, payload }: ApplicationctionType,
    ) => ApplicationDataType
  >(reducer, {
    apiUrl,
    app,
    tokenType,
    user: null
  })

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  )
}

export default ApplicationProvider

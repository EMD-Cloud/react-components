// ** React Imports
import * as React from 'react'

// ** External Imports
import { EmdCloud, AppEnvironment } from '@emd-cloud/sdk'

// ** Source code Imports
import { ApplicationContext, DispatchContext } from './context'
import reducer, {
  ApplicationDataType,
  ApplicationActionType,
  ACTION,
} from './state-manager'

interface IApplicationProviderProps {
  apiUrl?: string
  app: string
  tokenType?: string
  authToken?: string
  children: React.ReactNode
}

const ApplicationProvider = ({
  app,
  apiUrl = 'https://api.emd.one',
  tokenType = 'token',
  authToken,
  children,
}: IApplicationProviderProps) => {
  const [value, dispatch] = React.useReducer<
    (
      state: ApplicationDataType,
      { type, payload }: ApplicationActionType,
    ) => ApplicationDataType
  >(reducer, {
    apiUrl,
    app,
    tokenType,
    user: null,
    sdkInstance: null,
  })

  // Initialize SDK instance when component mounts or when dependencies change
  React.useEffect(() => {
    try {
      const sdkInstance = new EmdCloud({
        environment: AppEnvironment.Client,
        appId: app,
        apiUrl,
        ...(authToken && { apiToken: authToken }),
      })

      dispatch({
        type: ACTION.SET_SDK_INSTANCE,
        payload: sdkInstance,
      })
    } catch (error) {
      // SDK initialization failed, continue without it
      console.warn('@emd-cloud/sdk initialization failed:', error)
    }
  }, [app, apiUrl, authToken])

  if (!value.sdkInstance) return null

  return (
    <ApplicationContext.Provider value={value}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </ApplicationContext.Provider>
  )
}

export default ApplicationProvider

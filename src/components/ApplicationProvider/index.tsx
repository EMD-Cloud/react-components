import { useReducer, useEffect, useState, ReactNode } from 'react'

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
  children: ReactNode
  loadingComponent?: ReactNode
}

const ApplicationProvider = ({
  app,
  apiUrl = 'https://api.emd.one',
  tokenType = 'token',
  authToken,
  children,
  loadingComponent = null,
}: IApplicationProviderProps) => {
  const [sdkReady, setSdkReady] = useState(false)

  const [value, dispatch] = useReducer<
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
    authInited: false,
  })

  // Initialize SDK instance when component mounts or when dependencies change
  useEffect(() => {
    setSdkReady(false)

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

      dispatch({
        type: ACTION.AUTH_INITED,
        payload: true,
      })

      setSdkReady(true)
    } catch (error) {
      // SDK initialization failed, continue without it
      console.error('@emd-cloud/sdk initialization failed:', error)
      setSdkReady(true)
    }
  }, [app, apiUrl, authToken])

  if (!sdkReady) {
    return loadingComponent
  }

  return (
    <ApplicationContext.Provider value={value}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </ApplicationContext.Provider>
  )
}

export default ApplicationProvider

// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import { ApplicationContext, DispatchContext } from 'src/components'
import {
  ACTION,
  UserType,
} from 'src/components/ApplicationProvider/state-manager'
import type { EmdCloud } from '@emd-cloud/sdk'

// ** Types
// Reuse SDK method parameter types to stay in sync with @emd-cloud/sdk
type SDKAuth = EmdCloud['auth']
export type LogInUserType = Parameters<SDKAuth['login']>[0]
export type SignUpUserType = Parameters<SDKAuth['registration']>[0]
export type SocialLoginType = Parameters<SDKAuth['socialLogin']>[0]
export type ForgotPasswordType = Parameters<
  SDKAuth['forgotPassword']
>[0] extends string
  ? { email: string }
  : Parameters<SDKAuth['forgotPassword']>[0]
export type ForgotPasswordCheckCodeType = Parameters<
  SDKAuth['forgotPasswordCheckCode']
>[0]
export type ForgotPasswordChangeType = Parameters<
  SDKAuth['forgotPasswordChange']
>[0]

const useAuth = () => {
  const appData = useContext(ApplicationContext)
  const dispatch = useContext(DispatchContext)

  const sdkAuth = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return {
      auth: appData.sdkInstance.auth,
      setAuthToken: appData.sdkInstance.setAuthToken.bind(appData.sdkInstance),
    }
  }, [appData.sdkInstance])

  const authorization = useCallback(
    async (token?: UserType['token']): ReturnType<SDKAuth['authorization']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        if (token) {
          sdkAuth.setAuthToken(token)
        }

        const userData = await sdkAuth.auth.authorization()

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        return userData
      } catch (error) {
        throw error
      }
    },
    [sdkAuth, dispatch],
  )

  const logInUser = useCallback(
    async (params: LogInUserType): ReturnType<SDKAuth['login']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const userData = await sdkAuth.auth.login(params)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        return userData
      } catch (error) {
        throw error
      } finally {
        dispatch({
          type: ACTION.AUTH_INITED,
          payload: true,
        })
      }
    },
    [sdkAuth, dispatch],
  )

  const signUpUser = useCallback(
    async (params: SignUpUserType): ReturnType<SDKAuth['registration']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const userData = await sdkAuth.auth.registration(params)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        dispatch({
          type: ACTION.AUTH_INITED,
          payload: true,
        })

        return userData
      } catch (error) {
        throw error
      }
    },
    [sdkAuth, dispatch],
  )

  const socialLogin = useCallback(
    async (params: SocialLoginType): ReturnType<SDKAuth['socialLogin']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        // Use the provider string directly - SDK will handle it internally
        return await sdkAuth.auth.socialLogin({
          provider: params.provider,
          redirectUrl: params.redirectUrl,
        })
      } catch (error) {
        throw error
      }
    },
    [sdkAuth],
  )

  const exchangeOAuthToken = useCallback(
    async (
      secret: Parameters<SDKAuth['exchangeOAuthToken']>[0],
    ): ReturnType<SDKAuth['exchangeOAuthToken']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const userData = await sdkAuth.auth.exchangeOAuthToken(secret)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        dispatch({
          type: ACTION.AUTH_INITED,
          payload: true,
        })

        return userData
      } catch (error) {
        throw error
      }
    },
    [sdkAuth, dispatch],
  )

  const forgotPassword = useCallback(
    async (
      params: ForgotPasswordType,
    ): ReturnType<SDKAuth['forgotPassword']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkAuth.auth.forgotPassword(params.email)
      } catch (error) {
        throw error
      }
    },
    [sdkAuth],
  )

  const forgotPasswordCheckCode = useCallback(
    async (
      params: ForgotPasswordCheckCodeType,
    ): ReturnType<SDKAuth['forgotPasswordCheckCode']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkAuth.auth.forgotPasswordCheckCode(params)
      } catch (error) {
        throw error
      }
    },
    [sdkAuth],
  )

  const forgotPasswordChange = useCallback(
    async (
      params: ForgotPasswordChangeType,
    ): ReturnType<SDKAuth['forgotPasswordChange']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const userData = await sdkAuth.auth.forgotPasswordChange(params)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        return userData
      } catch (error) {
        throw error
      }
    },
    [sdkAuth, dispatch],
  )

  const logOutUser = useCallback(() => {
    dispatch({
      type: ACTION.SET_USER,
      payload: null,
    })

    dispatch({
      type: ACTION.AUTH_INITED,
      payload: false,
    })

    // Clear token from SDK instance if available
    if (sdkAuth) {
      // SDK expects a string; clear by setting empty string
      sdkAuth.setAuthToken('')
    }
  }, [dispatch, sdkAuth])

  const updateUser = useCallback(
    async (
      payload: Parameters<SDKAuth['updateUser']>[0],
    ): ReturnType<SDKAuth['updateUser']> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const userData = await sdkAuth.auth.updateUser(payload)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        return userData
      } catch (error) {
        throw error
      }
    },
    [sdkAuth, dispatch],
  )

  const userInfo = useMemo(() => {
    return appData.user
  }, [appData.user])

  const authInited = useMemo(() => {
    return appData.authInited
  }, [appData.authInited])
  return {
    authorization,
    logInUser,
    logOutUser,
    signUpUser,
    socialLogin,
    exchangeOAuthToken,
    forgotPassword,
    forgotPasswordCheckCode,
    forgotPasswordChange,
    updateUser,
    userInfo,
    authInited,
  }
}

export default useAuth

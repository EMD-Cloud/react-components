// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import { ApplicationContext, DispatchContext } from 'src/components'
import {
  ACTION,
  UserType,
} from 'src/components/ApplicationProvider/state-manager'
import type { EmdCloud } from '@emd-cloud/sdk'
import type {
  CallOptions,
  ServerError,
  ValidationError,
  AuthUserResponse,
  ForgotPassDataResponse,
  ForgotPassCheckCodeDataResponse,
  UserData,
  ForgotPassData,
  ForgotPassCheckCodeData,
} from '@emd-cloud/sdk'

// ** Types
// Reuse SDK method parameter types to stay in sync with @emd-cloud/sdk
type SDKAuth = EmdCloud['auth']
export type LogInUserType = Parameters<SDKAuth['login']>[0]
export type SignUpUserType = Parameters<SDKAuth['registration']>[0]
export type SocialLoginType = Parameters<SDKAuth['socialLogin']>[0]
export type ForgotPasswordType = Parameters<SDKAuth['forgotPassword']>[0]
export type ForgotPasswordCheckCodeType = Parameters<
  SDKAuth['forgotPasswordCheckCode']
>[0]
export type ForgotPasswordChangeType = Parameters<
  SDKAuth['forgotPasswordChange']
>[0]

export interface UseAuthReturn {
  authorization(
    token: UserType['token'] | undefined,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError | ValidationError | null>
  authorization(
    token?: UserType['token'],
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError | ValidationError | null>

  logInUser: SDKAuth['login']
  signUpUser: SDKAuth['registration']
  exchangeOAuthToken: SDKAuth['exchangeOAuthToken']
  forgotPassword: SDKAuth['forgotPassword']
  forgotPasswordCheckCode: SDKAuth['forgotPasswordCheckCode']
  forgotPasswordChange: SDKAuth['forgotPasswordChange']
  updateUser: SDKAuth['updateUser']

  socialLogin: SDKAuth['socialLogin']

  logOutUser: () => void

  userInfo: UserType | null
  authInited: boolean
}

const isAuthUserResponse = (
  value: AuthUserResponse | UserData | ServerError | ValidationError,
): value is AuthUserResponse => {
  return typeof value === 'object' && value !== null && 'success' in value && 'data' in value
}

const getAuthUser = (
  result: AuthUserResponse | UserData | ServerError | ValidationError | null,
  callOptions: CallOptions,
): UserData | null => {
  if (!result || result instanceof Error) {
    return null
  }

  if (callOptions.ignoreFormatResponse && isAuthUserResponse(result)) {
    return result.data
  }

  if (isAuthUserResponse(result)) {
    return result.data
  }

  return result
}

const useAuth = (): UseAuthReturn => {
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
    async (
      token?: UserType['token'],
      callOptions: CallOptions = {},
    ): Promise<AuthUserResponse | UserData | ServerError | ValidationError | null> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        if (token) {
          sdkAuth.setAuthToken(token)

          const result = await sdkAuth.auth.authorization(callOptions)

          const userData = getAuthUser(result, callOptions)

          dispatch({
            type: ACTION.SET_USER,
            payload: userData,
          })

          return result
        }

        return null
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

  const logInUser = useCallback(
    async (
      params: LogInUserType,
      callOptions: CallOptions = {},
    ): Promise<AuthUserResponse | UserData | ServerError> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const result = await sdkAuth.auth.login(params, callOptions)

        const userData = getAuthUser(result, callOptions)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        dispatch({
          type: ACTION.AUTH_INITED,
          payload: true,
        })

        return result
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
    async (
      params: SignUpUserType,
      callOptions: CallOptions = {},
    ): Promise<AuthUserResponse | UserData | ServerError> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const result = await sdkAuth.auth.registration(params, callOptions)

        const userData = getAuthUser(result, callOptions)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        dispatch({
          type: ACTION.AUTH_INITED,
          payload: true,
        })

        return result
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
      callOptions: CallOptions = {},
    ): Promise<AuthUserResponse | UserData | ServerError> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const result = await sdkAuth.auth.exchangeOAuthToken(secret, callOptions)

        const userData = getAuthUser(result, callOptions)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        dispatch({
          type: ACTION.AUTH_INITED,
          payload: true,
        })

        return result
      } catch (error) {
        throw error
      }
    },
    [sdkAuth, dispatch],
  )

  const forgotPassword = useCallback(
    async (
      email: ForgotPasswordType,
      callOptions: CallOptions = {},
    ): Promise<ForgotPassDataResponse | ForgotPassData | ServerError> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkAuth.auth.forgotPassword(email, callOptions)
      } catch (error) {
        throw error
      }
    },
    [sdkAuth],
  )

  const forgotPasswordCheckCode = useCallback(
    async (
      params: ForgotPasswordCheckCodeType,
      callOptions: CallOptions = {},
    ): Promise<ForgotPassCheckCodeDataResponse | ForgotPassCheckCodeData | ServerError> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkAuth.auth.forgotPasswordCheckCode(params, callOptions)
      } catch (error) {
        throw error
      }
    },
    [sdkAuth],
  )

  const forgotPasswordChange = useCallback(
    async (
      params: ForgotPasswordChangeType,
      callOptions: CallOptions = {},
    ): Promise<AuthUserResponse | UserData | ServerError> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const result = await sdkAuth.auth.forgotPasswordChange(params, callOptions)

        const userData = getAuthUser(result, callOptions)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        return result
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
      callOptions: CallOptions = {},
    ): Promise<AuthUserResponse | UserData | ServerError> => {
      if (!sdkAuth) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        const result = await sdkAuth.auth.updateUser(payload, callOptions)

        const userData = getAuthUser(result, callOptions)

        dispatch({
          type: ACTION.SET_USER,
          payload: userData,
        })

        return result
      } catch (error) {
        throw error
      }
    },
    [sdkAuth, dispatch],
  )

  const userInfo = useMemo(() => {
    return appData.user ?? null
  }, [appData.user])

  const authInited = useMemo(() => {
    return appData.authInited ?? false
  }, [appData.authInited])

  return {
    authorization: authorization as UseAuthReturn['authorization'],
    logInUser: logInUser as UseAuthReturn['logInUser'],
    logOutUser,
    signUpUser: signUpUser as UseAuthReturn['signUpUser'],
    socialLogin: socialLogin as UseAuthReturn['socialLogin'],
    exchangeOAuthToken: exchangeOAuthToken as UseAuthReturn['exchangeOAuthToken'],
    forgotPassword: forgotPassword as UseAuthReturn['forgotPassword'],
    forgotPasswordCheckCode: forgotPasswordCheckCode as UseAuthReturn['forgotPasswordCheckCode'],
    forgotPasswordChange: forgotPasswordChange as UseAuthReturn['forgotPasswordChange'],
    updateUser: updateUser as UseAuthReturn['updateUser'],
    userInfo,
    authInited,
  }
}

export default useAuth

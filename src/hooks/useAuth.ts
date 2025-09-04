// ** React Imports
import { useContext, useMemo } from 'react'

// ** Source code Imports
import {
  ApplicationContext,
  DispatchContext,
} from '../components/ApplicationProvider/context'
import {
  ACTION,
  UserType,
} from '../components/ApplicationProvider/state-manager'
import type { SocialProvider } from '@emd-cloud/sdk'

// ** Types
export type LogInUserType = {
  login: string
  password: string
}

export type SignUpUserType = {
  login: string
  password: string
  firstName?: string
  lastName?: string
  customFields?: object
  captchaToken?: string
}

export type SocialLoginType = {
  provider: SocialProvider
  redirectUrl: string
}

export type ForgotPasswordType = {
  email: string
}

export type ForgotPasswordCheckCodeType = {
  requestId: string
  code: string
}

export type ForgotPasswordChangeType = {
  requestId: string
  newPassword: string
  newPasswordRepeat: string
}

const useAuth = () => {
  const appData = useContext(ApplicationContext)
  const dispatch = useContext(DispatchContext)

  const authorization = async (token?: UserType['token']): Promise<UserType> => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      if (token) {
        appData.sdkInstance.setAuthToken(token)
      }
      
      const userData = await appData.sdkInstance.auth.authorization()
      
      dispatch({
        type: ACTION.SET_USER,
        payload: userData,
      })

      return userData
    } catch (error) {
      throw error
    }
  }

  const logInUser = async (params: LogInUserType): Promise<UserType> => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const userData = await appData.sdkInstance.auth.login(params)
      
      dispatch({
        type: ACTION.SET_USER,
        payload: userData,
      })

      return userData
    } catch (error) {
      throw error
    }
  }

  const signUpUser = async (params: SignUpUserType): Promise<UserType> => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const userData = await appData.sdkInstance.auth.registration(params)
      
      dispatch({
        type: ACTION.SET_USER,
        payload: userData,
      })

      return userData
    } catch (error) {
      throw error
    }
  }

  const socialLogin = async (params: SocialLoginType) => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      // Use the provider string directly - SDK will handle it internally
      return await appData.sdkInstance.auth.socialLogin({
        provider: params.provider,
        redirectUrl: params.redirectUrl
      })
    } catch (error) {
      throw error
    }
  }

  const exchangeOAuthToken = async (secret: string): Promise<UserType> => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const userData = await appData.sdkInstance.auth.exchangeOAuthToken(secret)
      
      dispatch({
        type: ACTION.SET_USER,
        payload: userData,
      })

      return userData
    } catch (error) {
      throw error
    }
  }

  const forgotPassword = async (params: ForgotPasswordType) => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      return await appData.sdkInstance.auth.forgotPassword(params.email)
    } catch (error) {
      throw error
    }
  }

  const forgotPasswordCheckCode = async (params: ForgotPasswordCheckCodeType) => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      return await appData.sdkInstance.auth.forgotPasswordCheckCode(params)
    } catch (error) {
      throw error
    }
  }

  const forgotPasswordChange = async (params: ForgotPasswordChangeType): Promise<UserType> => {
    if (!appData.sdkInstance) {
      throw new Error('SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.')
    }

    try {
      const userData = await appData.sdkInstance.auth.forgotPasswordChange(params)
      
      dispatch({
        type: ACTION.SET_USER,
        payload: userData,
      })

      return userData
    } catch (error) {
      throw error
    }
  }

  const logOutUser = () => {
    dispatch({
      type: ACTION.SET_USER,
      payload: null,
    })
    
    // Clear token from SDK instance if available
    if (appData.sdkInstance) {
      appData.sdkInstance.setAuthToken(null)
    }
  }

  const userInfo = useMemo(() => {
    return appData.user
  }, [appData.user])

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
    userInfo 
  }
}

export default useAuth

// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import { ApplicationContext } from 'src/components/ApplicationProvider/context'

// ** Types
import type {
  UserData,
  SocialProvider,
  SocialAttachResponse,
  SocialAttachRawResponse,
  UserListOptions,
  UserListResponse,
  UserListRawResponse,
  AuthUserResponse,
  SimpleSuccessResponse,
  CallOptions,
  ServerError,
} from '@emd-cloud/sdk'
import type { EmdCloud } from '@emd-cloud/sdk'

// Reuse SDK method parameter types to stay in sync with @emd-cloud/sdk
type SDKUserInteraction = EmdCloud['user']

export interface UseUserInteractionReturn {
  attachSocialAccount(
    params: { provider: SocialProvider; redirectUrl: string },
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<SocialAttachRawResponse | ServerError>
  attachSocialAccount(
    params: { provider: SocialProvider; redirectUrl: string },
    callOptions?: CallOptions,
  ): Promise<SocialAttachResponse | ServerError>

  detachSocialAccount(
    provider: SocialProvider,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<SimpleSuccessResponse | ServerError>
  detachSocialAccount(
    provider: SocialProvider,
    callOptions?: CallOptions,
  ): Promise<{ success: boolean } | ServerError>

  ping(
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<SimpleSuccessResponse | ServerError>
  ping(
    callOptions?: CallOptions,
  ): Promise<{ success: boolean } | ServerError>

  getUserList(
    options: UserListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<UserListRawResponse | ServerError>
  getUserList(
    options?: UserListOptions,
    callOptions?: CallOptions,
  ): Promise<UserListResponse | ServerError>

  getUserDetails(
    userId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError>
  getUserDetails(
    userId: string,
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError>
}

/**
 * Hook for interacting with EMD Cloud user management features.
 * Provides social account management, activity tracking, and user administration.
 *
 * @example
 * ```tsx
 * const { attachSocialAccount, ping, getUserList } = useUserInteraction();
 *
 * // Attach a Steam account
 * const response = await attachSocialAccount({
 *   provider: SocialProvider.STEAM,
 *   redirectUrl: 'https://myapp.com/profile'
 * });
 * window.location.href = response.url;
 *
 * // Track user activity
 * await ping();
 *
 * // Get user list (staff only)
 * const users = await getUserList({ limit: 20, page: 0 });
 * ```
 */
const useUserInteraction = (): UseUserInteractionReturn => {
  const appData = useContext(ApplicationContext)

  const sdkUser = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return appData.sdkInstance.user
  }, [appData.sdkInstance])

  const attachSocialAccount = useCallback(
    async (
      params: { provider: SocialProvider; redirectUrl: string },
      callOptions: CallOptions = {},
    ): Promise<SocialAttachRawResponse | SocialAttachResponse | ServerError> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.attachSocialAccount(params, callOptions)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const detachSocialAccount = useCallback(
    async (
      provider: SocialProvider,
      callOptions: CallOptions = {},
    ): Promise<SimpleSuccessResponse | { success: boolean } | ServerError> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.detachSocialAccount(provider, callOptions)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const ping = useCallback(
    async (
      callOptions: CallOptions = {},
    ): Promise<SimpleSuccessResponse | { success: boolean } | ServerError> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.ping(callOptions)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const getUserList = useCallback(
    async (
      options: UserListOptions = {},
      callOptions: CallOptions = {},
    ): Promise<UserListRawResponse | UserListResponse | ServerError> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.getUserList(options, callOptions)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const getUserDetails = useCallback(
    async (
      userId: string,
      callOptions: CallOptions = {},
    ): Promise<AuthUserResponse | UserData | ServerError> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.getUserDetails(userId, callOptions)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  return {
    attachSocialAccount: attachSocialAccount as UseUserInteractionReturn['attachSocialAccount'],
    detachSocialAccount: detachSocialAccount as UseUserInteractionReturn['detachSocialAccount'],
    ping: ping as UseUserInteractionReturn['ping'],
    getUserList: getUserList as UseUserInteractionReturn['getUserList'],
    getUserDetails: getUserDetails as UseUserInteractionReturn['getUserDetails'],
  }
}

export default useUserInteraction

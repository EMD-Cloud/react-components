// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import { ApplicationContext } from 'src/components/ApplicationProvider/context'

// ** Types
import type {
  UserData,
  SocialProvider,
  SocialAttachResponse,
  UserListOptions,
  UserListResponse,
} from '@emd-cloud/sdk'
import type { EmdCloud } from '@emd-cloud/sdk'

// Reuse SDK method parameter types to stay in sync with @emd-cloud/sdk
type SDKUserInteraction = EmdCloud['user']

export interface UseUserInteractionReturn {
  /**
   * Attaches a social network account to the current user.
   *
   * Generates an authorization URL for the specified social provider
   * (Steam, VK, or Twitch) that the user should be redirected to.
   *
   * @param params - Social account attachment parameters
   * @returns Promise resolving to authorization URL
   */
  attachSocialAccount: (params: {
    provider: SocialProvider
    redirectUrl: string
  }) => ReturnType<SDKUserInteraction['attachSocialAccount']>

  /**
   * Detaches a social network account from the current user.
   *
   * Removes the connection between the user's account and the
   * specified social provider.
   *
   * @param provider - The social provider to detach
   * @returns Promise resolving to success status
   */
  detachSocialAccount: (
    provider: SocialProvider
  ) => ReturnType<SDKUserInteraction['detachSocialAccount']>

  /**
   * Updates the current user's last activity timestamp.
   *
   * Used to track user presence and activity for determining
   * online status or last seen time.
   *
   * @returns Promise resolving to success status
   */
  ping: () => ReturnType<SDKUserInteraction['ping']>

  /**
   * Retrieves a paginated list of users in the application.
   *
   * Typically available only to staff members with appropriate permissions.
   * Supports searching, filtering, sorting, and pagination.
   *
   * @param options - Optional filtering and pagination parameters
   * @returns Promise resolving to user list with total count
   */
  getUserList: (
    options?: UserListOptions
  ) => ReturnType<SDKUserInteraction['getUserList']>

  /**
   * Retrieves detailed information about a specific user by ID.
   *
   * Available to staff members or users requesting their own information.
   *
   * @param userId - The unique identifier of the user
   * @returns Promise resolving to user details
   */
  getUserDetails: (
    userId: string
  ) => ReturnType<SDKUserInteraction['getUserDetails']>
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
    async (params: {
      provider: SocialProvider
      redirectUrl: string
    }): ReturnType<SDKUserInteraction['attachSocialAccount']> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.attachSocialAccount(params)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const detachSocialAccount = useCallback(
    async (
      provider: SocialProvider,
    ): ReturnType<SDKUserInteraction['detachSocialAccount']> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.detachSocialAccount(provider)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const ping = useCallback(
    async (): ReturnType<SDKUserInteraction['ping']> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.ping()
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const getUserList = useCallback(
    async (
      options: UserListOptions = {},
    ): ReturnType<SDKUserInteraction['getUserList']> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.getUserList(options)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  const getUserDetails = useCallback(
    async (userId: string): ReturnType<SDKUserInteraction['getUserDetails']> => {
      if (!sdkUser) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.',
        )
      }

      try {
        return await sdkUser.getUserDetails(userId)
      } catch (error) {
        throw error
      }
    },
    [sdkUser],
  )

  return {
    attachSocialAccount,
    detachSocialAccount,
    ping,
    getUserList,
    getUserDetails,
  }
}

export default useUserInteraction
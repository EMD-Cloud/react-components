import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SocialProvider, AccountStatus } from '@emd-cloud/sdk'

import { ApplicationProvider } from 'src/components'
import { useUserInteraction } from 'src/hooks'
import config from '../../config'

// Mock the SDK
const mockSDK = {
  auth: {
    login: vi.fn(),
    registration: vi.fn(),
    authorization: vi.fn(),
    socialLogin: vi.fn(),
    exchangeOAuthToken: vi.fn(),
    forgotPassword: vi.fn(),
    forgotPasswordCheckCode: vi.fn(),
    forgotPasswordChange: vi.fn(),
  },
  user: {
    attachSocialAccount: vi.fn(),
    detachSocialAccount: vi.fn(),
    ping: vi.fn(),
    getUserList: vi.fn(),
    getUserDetails: vi.fn(),
  },
  setAuthToken: vi.fn(),
}

// Mock the SDK module
vi.mock('@emd-cloud/sdk', () => ({
  EmdCloud: vi.fn(() => mockSDK),
  AppEnvironment: {
    Client: 'client',
    Server: 'server',
  },
  SocialProvider: {
    VK: 'vk',
    YANDEX: 'yandex',
    STEAM: 'steam',
    TWITCH: 'twitch',
  },
  AccountStatus: {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected',
  },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ApplicationProvider
    app={config.app}
    apiUrl={config.apiUrl}
    authToken={config.authToken}
  >
    {children}
  </ApplicationProvider>
)

describe('useUserInteraction Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser = {
    _id: 'user-123',
    login: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    token: 'mock-token-123',
    space: 'test-space',
    accountVerified: true,
    accountStatus: 'approved' as const,
    external: false,
    patronymicName: '',
    avatarUrl: '',
    level: 1,
    points: 0,
    quotaFreeSpaces: 5,
    passwordRecoveryRequest: null,
    ping: null,
    linkedAccounts: {
      steam: 'steam-123',
    },
    customFields: {},
    lastActivityInMinutes: null,
    pingStatus: 'online' as const,
  }

  it('should attach social account successfully', async () => {
    const mockResponse = { url: 'https://steamcommunity.com/openid/login?...' }
    mockSDK.user.attachSocialAccount.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.attachSocialAccount({
        provider: SocialProvider.STEAM,
        redirectUrl: 'https://myapp.com/profile',
      })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.attachSocialAccount).toHaveBeenCalledWith({
      provider: 'steam',
      redirectUrl: 'https://myapp.com/profile',
    })
  })

  it('should attach VK account successfully', async () => {
    const mockResponse = { url: 'https://oauth.vk.com/authorize?...' }
    mockSDK.user.attachSocialAccount.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.attachSocialAccount({
        provider: SocialProvider.VK,
        redirectUrl: 'https://myapp.com/callback',
      })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.attachSocialAccount).toHaveBeenCalledWith({
      provider: 'vk',
      redirectUrl: 'https://myapp.com/callback',
    })
  })

  it('should attach Twitch account successfully', async () => {
    const mockResponse = { url: 'https://id.twitch.tv/oauth2/authorize?...' }
    mockSDK.user.attachSocialAccount.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.attachSocialAccount({
        provider: SocialProvider.TWITCH,
        redirectUrl: 'https://myapp.com/twitch-callback',
      })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.attachSocialAccount).toHaveBeenCalledWith({
      provider: 'twitch',
      redirectUrl: 'https://myapp.com/twitch-callback',
    })
  })

  it('should detach social account successfully', async () => {
    const mockResponse = { success: true }
    mockSDK.user.detachSocialAccount.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.detachSocialAccount(
        SocialProvider.STEAM,
      )
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.detachSocialAccount).toHaveBeenCalledWith('steam')
  })

  it('should detach VK account successfully', async () => {
    const mockResponse = { success: true }
    mockSDK.user.detachSocialAccount.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.detachSocialAccount(
        SocialProvider.VK,
      )
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.detachSocialAccount).toHaveBeenCalledWith('vk')
  })

  it('should ping user activity successfully', async () => {
    const mockResponse = { success: true }
    mockSDK.user.ping.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.ping()
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.ping).toHaveBeenCalled()
  })

  it('should get user list successfully', async () => {
    const mockResponse = {
      data: [mockUser, { ...mockUser, _id: 'user-456' }],
      total: 2,
    }
    mockSDK.user.getUserList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.getUserList({
        limit: 20,
        page: 0,
        orderBy: 'createdAt',
        sort: 'DESC',
      })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.getUserList).toHaveBeenCalledWith({
      limit: 20,
      page: 0,
      orderBy: 'createdAt',
      sort: 'DESC',
    })
  })

  it('should get user list with search successfully', async () => {
    const mockResponse = {
      data: [mockUser],
      total: 1,
    }
    mockSDK.user.getUserList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.getUserList({
        search: 'john',
        limit: 10,
      })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.getUserList).toHaveBeenCalledWith({
      search: 'john',
      limit: 10,
    })
  })

  it('should get user list with account status filter', async () => {
    const mockResponse = {
      data: [mockUser],
      total: 1,
    }
    mockSDK.user.getUserList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.getUserList({
        accountStatus: AccountStatus.Approved,
      })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.getUserList).toHaveBeenCalledWith({
      accountStatus: 'approved',
    })
  })

  it('should get user list without options', async () => {
    const mockResponse = {
      data: [mockUser],
      total: 1,
    }
    mockSDK.user.getUserList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.getUserList()
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.user.getUserList).toHaveBeenCalledWith({})
  })

  it('should get user details successfully', async () => {
    mockSDK.user.getUserDetails.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await act(async () => {
      const response = await result.current.getUserDetails('user-123')
      expect(response).toEqual(mockUser)
    })

    expect(mockSDK.user.getUserDetails).toHaveBeenCalledWith('user-123')
  })

  it('should have all methods available when SDK is properly initialized', () => {
    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    expect(typeof result.current.attachSocialAccount).toBe('function')
    expect(typeof result.current.detachSocialAccount).toBe('function')
    expect(typeof result.current.ping).toBe('function')
    expect(typeof result.current.getUserList).toBe('function')
    expect(typeof result.current.getUserDetails).toBe('function')
  })

  it('should handle attachSocialAccount errors gracefully', async () => {
    const mockError = new Error('Failed to attach social account')
    mockSDK.user.attachSocialAccount.mockRejectedValue(mockError)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await expect(async () => {
      await result.current.attachSocialAccount({
        provider: SocialProvider.STEAM,
        redirectUrl: 'https://myapp.com/profile',
      })
    }).rejects.toThrow('Failed to attach social account')
  })

  it('should handle detachSocialAccount errors gracefully', async () => {
    const mockError = new Error('Failed to detach social account')
    mockSDK.user.detachSocialAccount.mockRejectedValue(mockError)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await expect(async () => {
      await result.current.detachSocialAccount(SocialProvider.STEAM)
    }).rejects.toThrow('Failed to detach social account')
  })

  it('should handle ping errors gracefully', async () => {
    const mockError = new Error('Failed to ping')
    mockSDK.user.ping.mockRejectedValue(mockError)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await expect(async () => {
      await result.current.ping()
    }).rejects.toThrow('Failed to ping')
  })

  it('should handle getUserList errors gracefully', async () => {
    const mockError = new Error('Failed to get user list')
    mockSDK.user.getUserList.mockRejectedValue(mockError)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await expect(async () => {
      await result.current.getUserList()
    }).rejects.toThrow('Failed to get user list')
  })

  it('should handle getUserDetails errors gracefully', async () => {
    const mockError = new Error('User not found')
    mockSDK.user.getUserDetails.mockRejectedValue(mockError)

    const { result } = renderHook(() => useUserInteraction(), { wrapper })

    await expect(async () => {
      await result.current.getUserDetails('invalid-user-id')
    }).rejects.toThrow('User not found')
  })

})
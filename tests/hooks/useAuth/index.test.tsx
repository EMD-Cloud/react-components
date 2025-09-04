import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { ApplicationProvider } from '../../../src/components'
import { useAuth } from '../../../src/hooks'
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

describe('useAuth Hook Tests', () => {
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
    linkedAccounts: {},
    customFields: {},
    lastActivityInMinutes: null,
    pingStatus: 'online' as const,
  }

  it('should login user successfully', async () => {
    mockSDK.auth.login.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const userData = await result.current.logInUser({
        login: 'test@example.com',
        password: 'password123'
      })
      expect(userData).toEqual(mockUser)
    })

    expect(mockSDK.auth.login).toHaveBeenCalledWith({
      login: 'test@example.com',
      password: 'password123'
    })
    expect(result.current.userInfo).toEqual(mockUser)
  })

  it('should register user successfully', async () => {
    mockSDK.auth.registration.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const userData = await result.current.signUpUser({
        login: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        captchaToken: 'captcha-token'
      })
      expect(userData).toEqual(mockUser)
    })

    expect(mockSDK.auth.registration).toHaveBeenCalledWith({
      login: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      captchaToken: 'captcha-token'
    })
    expect(result.current.userInfo).toEqual(mockUser)
  })

  it('should authorize user successfully', async () => {
    mockSDK.auth.authorization.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const userData = await result.current.authorization('test-token')
      expect(userData).toEqual(mockUser)
    })

    expect(mockSDK.setAuthToken).toHaveBeenCalledWith('test-token')
    expect(mockSDK.auth.authorization).toHaveBeenCalled()
    expect(result.current.userInfo).toEqual(mockUser)
  })

  it('should initiate social login successfully', async () => {
    const mockOAuthResponse = { url: 'https://oauth.vk.com/authorize?...' }
    mockSDK.auth.socialLogin.mockResolvedValue(mockOAuthResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const response = await result.current.socialLogin({
        provider: 'vk',
        redirectUrl: 'https://myapp.com/callback'
      })
      expect(response).toEqual(mockOAuthResponse)
    })

    expect(mockSDK.auth.socialLogin).toHaveBeenCalledWith({
      provider: 'vk',
      redirectUrl: 'https://myapp.com/callback'
    })
  })

  it('should exchange OAuth token successfully', async () => {
    mockSDK.auth.exchangeOAuthToken.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const userData = await result.current.exchangeOAuthToken('oauth-secret')
      expect(userData).toEqual(mockUser)
    })

    expect(mockSDK.auth.exchangeOAuthToken).toHaveBeenCalledWith('oauth-secret')
    expect(result.current.userInfo).toEqual(mockUser)
  })

  it('should initiate password recovery successfully', async () => {
    const mockResponse = { requestId: 'recovery-123' }
    mockSDK.auth.forgotPassword.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const response = await result.current.forgotPassword({ email: 'test@example.com' })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.auth.forgotPassword).toHaveBeenCalledWith('test@example.com')
  })

  it('should check password recovery code successfully', async () => {
    const mockResponse = { _id: 'verification-123', requestStatus: 'open' }
    mockSDK.auth.forgotPasswordCheckCode.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const response = await result.current.forgotPasswordCheckCode({
        requestId: 'recovery-123',
        code: '123456'
      })
      expect(response).toEqual(mockResponse)
    })

    expect(mockSDK.auth.forgotPasswordCheckCode).toHaveBeenCalledWith({
      requestId: 'recovery-123',
      code: '123456'
    })
  })

  it('should change password successfully', async () => {
    mockSDK.auth.forgotPasswordChange.mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const userData = await result.current.forgotPasswordChange({
        requestId: 'recovery-123',
        newPassword: 'newpassword123',
        newPasswordRepeat: 'newpassword123'
      })
      expect(userData).toEqual(mockUser)
    })

    expect(mockSDK.auth.forgotPasswordChange).toHaveBeenCalledWith({
      requestId: 'recovery-123',
      newPassword: 'newpassword123',
      newPasswordRepeat: 'newpassword123'
    })
    expect(result.current.userInfo).toEqual(mockUser)
  })

  it('should logout user successfully', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logOutUser()
    })

    expect(mockSDK.setAuthToken).toHaveBeenCalledWith(null)
    expect(result.current.userInfo).toBeNull()
  })

  it('should have userInfo available when SDK is properly initialized', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Test that userInfo is accessible (should be null initially)
    expect(result.current.userInfo).toBeNull()
    
    // Test that all auth methods are available
    expect(typeof result.current.logInUser).toBe('function')
    expect(typeof result.current.signUpUser).toBe('function')
    expect(typeof result.current.authorization).toBe('function')
    expect(typeof result.current.socialLogin).toBe('function')
    expect(typeof result.current.exchangeOAuthToken).toBe('function')
    expect(typeof result.current.forgotPassword).toBe('function')
    expect(typeof result.current.forgotPasswordCheckCode).toBe('function')
    expect(typeof result.current.forgotPasswordChange).toBe('function')
    expect(typeof result.current.logOutUser).toBe('function')
  })

  it('should handle SDK method errors gracefully', async () => {
    const mockError = new Error('Network error')
    mockSDK.auth.login.mockRejectedValue(mockError)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(async () => {
      await result.current.logInUser({
        login: 'test@example.com',
        password: 'password123'
      })
    }).rejects.toThrow('Network error')
  })
})

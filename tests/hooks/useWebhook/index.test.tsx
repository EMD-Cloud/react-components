import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { ApplicationProvider } from 'src/components'
import { useWebhook } from 'src/hooks'
import config from '../../config'

// Mock the SDK
const mockWebhook = {
  call: vi.fn(),
}

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
  database: vi.fn(),
  webhook: mockWebhook,
}

// Mock the SDK module
vi.mock('@emd-cloud/sdk', () => ({
  EmdCloud: vi.fn(() => mockSDK),
  AppEnvironment: {
    Client: 'client',
    Server: 'server',
  },
  AuthType: {
    AuthToken: 'auth-token',
    ApiToken: 'api-token',
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

describe('useWebhook Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockWebhookResponse = {
    success: true,
    data: { message: 'Webhook executed successfully', id: 'webhook-123' },
    timestamp: '2023-01-01T00:00:00Z',
  }

  it('should call webhook with custom request options successfully', async () => {
    mockWebhook.call.mockResolvedValue(mockWebhookResponse)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '123', action: 'create' }),
    }

    await act(async () => {
      const response = await result.current.callWebhook(
        'user-created',
        requestOptions,
        { authType: 'auth-token' }
      )
      expect(response).toEqual(mockWebhookResponse)
    })

    expect(mockWebhook.call).toHaveBeenCalledWith(
      'user-created',
      requestOptions,
      { authType: 'auth-token' }
    )
  })

  it('should call webhook with POST and JSON data successfully', async () => {
    mockWebhook.call.mockResolvedValue(mockWebhookResponse)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    const webhookData = {
      orderId: 'order-456',
      customerId: 'customer-123',
      total: 99.99,
      status: 'completed',
    }

    await act(async () => {
      const response = await result.current.callWebhook(
        'order-completed',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        }
      )
      expect(response).toEqual(mockWebhookResponse)
    })

    expect(mockWebhook.call).toHaveBeenCalledWith(
      'order-completed',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      },
      {},
    )
  })

  it('should call webhook with POST and authentication options', async () => {
    mockWebhook.call.mockResolvedValue(mockWebhookResponse)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    const webhookData = { event: 'test', data: { id: 1 } }

    await act(async () => {
      const response = await result.current.callWebhook(
        'test-webhook',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        },
        { authType: 'api-token' }
      )
      expect(response).toEqual(mockWebhookResponse)
    })

    expect(mockWebhook.call).toHaveBeenCalledWith(
      'test-webhook',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      },
      { authType: 'api-token' }
    )
  })

  it('should call webhook with GET method successfully', async () => {
    const getResponse = { status: 'healthy', uptime: 3600, version: '1.0.0' }
    mockWebhook.call.mockResolvedValue(getResponse)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    await act(async () => {
      const response = await result.current.callWebhook('health-check', { method: 'GET' })
      expect(response).toEqual(getResponse)
    })

    expect(mockWebhook.call).toHaveBeenCalledWith(
      'health-check',
      { method: 'GET' },
      {},
    )
  })

  it('should call webhook with GET and authentication options', async () => {
    const getResponse = { config: { timeout: 30 }, metrics: { calls: 100 } }
    mockWebhook.call.mockResolvedValue(getResponse)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    await act(async () => {
      const response = await result.current.callWebhook(
        'config-webhook',
        { method: 'GET' },
        { authType: 'api-token' }
      )
      expect(response).toEqual(getResponse)
    })

    expect(mockWebhook.call).toHaveBeenCalledWith(
      'config-webhook',
      { method: 'GET' },
      { authType: 'api-token' }
    )
  })

  it('should return webhook instance when SDK is available', () => {
    const { result } = renderHook(() => useWebhook(), { wrapper })
    
    expect(result.current.webhook).toBe(mockWebhook)
  })

  it('should handle server errors properly', async () => {
    const serverError = {
      success: false,
      error: 'Webhook not found',
      status: 404,
    }

    mockWebhook.call.mockResolvedValue(serverError)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    await act(async () => {
      const response = await result.current.callWebhook('non-existent', { method: 'GET' })
      expect(response).toEqual(serverError)
    })
  })

  it('should handle webhook call errors gracefully', async () => {
    const error = new Error('Network error')
    mockWebhook.call.mockRejectedValue(error)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    await act(async () => {
      await expect(
        result.current.callWebhook('failing-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: 'data' })
        })
      ).rejects.toThrow('Network error')
    })
  })

  it('should handle complex webhook payloads with POST call', async () => {
    mockWebhook.call.mockResolvedValue(mockWebhookResponse)

    const { result } = renderHook(() => useWebhook(), { wrapper })

    const complexPayload = {
      event: 'user_activity',
      timestamp: new Date().toISOString(),
      user: {
        id: 'user-123',
        email: 'user@example.com',
        metadata: {
          source: 'web',
          sessionId: 'session-456',
        },
      },
      actions: [
        { type: 'page_view', page: '/dashboard' },
        { type: 'click', element: 'export-button' },
      ],
    }

    await act(async () => {
      const response = await result.current.callWebhook(
        'user-activity',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complexPayload)
        }
      )
      expect(response).toEqual(mockWebhookResponse)
    })

    expect(mockWebhook.call).toHaveBeenCalledWith(
      'user-activity',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complexPayload),
      },
      {},
    )
  })
})

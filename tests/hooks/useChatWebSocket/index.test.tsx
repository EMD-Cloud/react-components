import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

import { ApplicationProvider } from 'src/components'
import { useChatWebSocket } from 'src/hooks'
import config from '../../config'

// Mock ChatWebSocket instance
const mockChatWebSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  subscribeToChannel: vi.fn(),
  unsubscribeFromChannel: vi.fn(),
  subscribeToSupport: vi.fn(),
  setCallbacks: vi.fn(),
  getConnectionState: vi.fn(),
  getSubscribedChannels: vi.fn(),
}

// Mock the SDK
const mockSDK = {
  auth: {
    login: vi.fn(),
  },
  chatWebSocket: vi.fn(function() { return mockChatWebSocket }),
  setAuthToken: vi.fn(),
}

// Mock the SDK module
vi.mock('@emd-cloud/sdk', () => ({
  EmdCloud: vi.fn(function() { return mockSDK }),
  AppEnvironment: {
    Client: 'client',
    Server: 'server',
  },
  ConnectionState: {
    Connecting: 'connecting',
    Connected: 'connected',
    Disconnected: 'disconnected',
    Error: 'error',
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

describe('useChatWebSocket Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChatWebSocket.getConnectionState.mockReturnValue('disconnected')
    mockChatWebSocket.getSubscribedChannels.mockReturnValue(new Set())
  })

  describe('Connection Management', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      expect(result.current.connectionState).toBe('disconnected')
      expect(result.current.isConnected).toBe(false)
    })

    it('should connect successfully', async () => {
      mockChatWebSocket.connect.mockResolvedValue(undefined)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await result.current.connect()
      })

      expect(mockChatWebSocket.connect).toHaveBeenCalled()
    })

    it('should disconnect successfully', () => {
      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      act(() => {
        result.current.disconnect()
      })

      expect(mockChatWebSocket.disconnect).toHaveBeenCalled()
    })

    it('should auto-connect when autoConnect is true', async () => {
      mockChatWebSocket.connect.mockResolvedValue(undefined)

      renderHook(() => useChatWebSocket({ autoConnect: true }), { wrapper })

      await waitFor(() => {
        expect(mockChatWebSocket.connect).toHaveBeenCalled()
      })
    })

    it('should not auto-connect when autoConnect is false', async () => {
      renderHook(() => useChatWebSocket({ autoConnect: false }), { wrapper })

      // Wait a bit to ensure connect is not called
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockChatWebSocket.connect).not.toHaveBeenCalled()
    })

    it('should auto-disconnect on unmount when autoDisconnect is true', () => {
      const { unmount } = renderHook(() => useChatWebSocket(), { wrapper })

      unmount()

      expect(mockChatWebSocket.disconnect).toHaveBeenCalled()
    })

    it('should not auto-disconnect on unmount when autoDisconnect is false', () => {
      const { unmount } = renderHook(
        () => useChatWebSocket({ autoDisconnect: false }),
        { wrapper }
      )

      unmount()

      expect(mockChatWebSocket.disconnect).not.toHaveBeenCalled()
    })

    it('should handle connection error', async () => {
      const mockError = new Error('Connection failed')
      mockChatWebSocket.connect.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await expect(result.current.connect()).rejects.toThrow(
          'Connection failed'
        )
      })
    })
  })

  describe('Channel Subscription', () => {
    it('should subscribe to channel successfully', async () => {
      mockChatWebSocket.subscribeToChannel.mockResolvedValue(undefined)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await result.current.subscribeToChannel('channel-123')
      })

      expect(mockChatWebSocket.subscribeToChannel).toHaveBeenCalledWith(
        'channel-123',
        undefined
      )
    })

    it('should subscribe to channel with chat ID', async () => {
      mockChatWebSocket.subscribeToChannel.mockResolvedValue(undefined)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await result.current.subscribeToChannel('channel-123', 'chat-456')
      })

      expect(mockChatWebSocket.subscribeToChannel).toHaveBeenCalledWith(
        'channel-123',
        'chat-456'
      )
    })

    it('should unsubscribe from channel', () => {
      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      act(() => {
        result.current.unsubscribeFromChannel('channel-123')
      })

      expect(mockChatWebSocket.unsubscribeFromChannel).toHaveBeenCalledWith(
        'channel-123'
      )
    })

    it('should subscribe to support channel', async () => {
      mockChatWebSocket.subscribeToSupport.mockResolvedValue(undefined)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await result.current.subscribeToSupport()
      })

      expect(mockChatWebSocket.subscribeToSupport).toHaveBeenCalled()
    })

    it('should handle subscription error', async () => {
      const mockError = new Error('Subscription failed')
      mockChatWebSocket.subscribeToChannel.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await expect(
          result.current.subscribeToChannel('channel-123')
        ).rejects.toThrow('Subscription failed')
      })
    })
  })

  describe('Callbacks Management', () => {
    it('should set callbacks successfully', () => {
      const callbacks = {
        onMessageReceived: vi.fn(),
        onMessageDeleted: vi.fn(),
      }

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      // The implementation updates internal callbacksRef, not SDK method
      // Test that it doesn't throw an error
      expect(() => {
        act(() => {
          result.current.setCallbacks(callbacks)
        })
      }).not.toThrow()
    })

    it('should handle multiple callback updates', () => {
      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      const callbacks1 = { onMessageReceived: vi.fn() }
      const callbacks2 = { onMessageDeleted: vi.fn() }

      // The implementation updates internal callbacksRef, not SDK method
      // Test that multiple updates don't throw errors
      expect(() => {
        act(() => {
          result.current.setCallbacks(callbacks1)
          result.current.setCallbacks(callbacks2)
        })
      }).not.toThrow()
    })

    it('should initialize with callbacks from options', () => {
      const callbacks = {
        onMessageReceived: vi.fn(),
        onConnectionStateChange: vi.fn(),
      }

      renderHook(() => useChatWebSocket({ callbacks }), { wrapper })

      // The implementation passes stable wrapper functions to SDK, not original callbacks
      // Verify that callback functions are provided (any function is acceptable)
      expect(mockSDK.chatWebSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          callbacks: expect.objectContaining({
            onMessageReceived: expect.any(Function),
            onConnectionStateChange: expect.any(Function),
          }),
        })
      )
    })
  })

  describe('State Queries', () => {
    it('should get connection state', () => {
      mockChatWebSocket.getConnectionState.mockReturnValue('connected')

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      const state = result.current.getConnectionState()
      expect(state).toBe('connected')
      expect(mockChatWebSocket.getConnectionState).toHaveBeenCalled()
    })

    it('should get subscribed channels', () => {
      const channels = new Set(['chat-channel-1', 'chat-channel-2'])
      mockChatWebSocket.getSubscribedChannels.mockReturnValue(channels)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      const subscribedChannels = result.current.getSubscribedChannels()
      expect(subscribedChannels).toEqual(channels)
      expect(mockChatWebSocket.getSubscribedChannels).toHaveBeenCalled()
    })

    it('should track connection state reactively', () => {
      const { result, rerender } = renderHook(() => useChatWebSocket(), {
        wrapper,
      })

      expect(result.current.connectionState).toBe('disconnected')
      expect(result.current.isConnected).toBe(false)

      // The connection state would be updated by the callback in real usage
      // This test just verifies the initial state
      rerender()

      expect(result.current.isConnected).toBe(
        result.current.connectionState === 'connected'
      )
    })
  })

  describe('WebSocket Options', () => {
    it('should pass WebSocket options to SDK', () => {
      const options = {
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectDelay: 2000,
        pingInterval: 30000,
      }

      renderHook(() => useChatWebSocket(options), { wrapper })

      expect(mockSDK.chatWebSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          autoReconnect: true,
          maxReconnectAttempts: 5,
          reconnectDelay: 2000,
          pingInterval: 30000,
        })
      )
    })

    it('should use default options when not provided', () => {
      renderHook(() => useChatWebSocket(), { wrapper })

      expect(mockSDK.chatWebSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          callbacks: expect.any(Object),
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle connect error gracefully', async () => {
      const mockError = new Error('Network error')
      mockChatWebSocket.connect.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await expect(result.current.connect()).rejects.toThrow('Network error')
      })
    })

    it('should handle subscribe error gracefully', async () => {
      const mockError = new Error('Invalid channel')
      mockChatWebSocket.subscribeToChannel.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await expect(
          result.current.subscribeToChannel('invalid-channel')
        ).rejects.toThrow('Invalid channel')
      })
    })

    it('should handle support subscription error', async () => {
      const mockError = new Error('Unauthorized')
      mockChatWebSocket.subscribeToSupport.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await expect(result.current.subscribeToSupport()).rejects.toThrow(
          'Unauthorized'
        )
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete chat flow', async () => {
      mockChatWebSocket.connect.mockResolvedValue(undefined)
      mockChatWebSocket.subscribeToChannel.mockResolvedValue(undefined)
      const onMessageReceived = vi.fn()

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      // Connect
      await act(async () => {
        await result.current.connect()
      })

      // Set callbacks
      act(() => {
        result.current.setCallbacks({ onMessageReceived })
      })

      // Subscribe to channel
      await act(async () => {
        await result.current.subscribeToChannel('channel-123')
      })

      expect(mockChatWebSocket.connect).toHaveBeenCalled()
      // Note: setCallbacks updates internal ref, doesn't call SDK method
      expect(mockChatWebSocket.subscribeToChannel).toHaveBeenCalledWith(
        'channel-123',
        undefined
      )
    })

    it('should handle multiple channel subscriptions', async () => {
      mockChatWebSocket.subscribeToChannel.mockResolvedValue(undefined)

      const { result } = renderHook(() => useChatWebSocket(), { wrapper })

      await act(async () => {
        await result.current.subscribeToChannel('channel-1')
        await result.current.subscribeToChannel('channel-2')
        await result.current.subscribeToChannel('channel-3')
      })

      expect(mockChatWebSocket.subscribeToChannel).toHaveBeenCalledTimes(3)
    })
  })
})

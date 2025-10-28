// ** React Imports
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// ** Source code Imports
import { ApplicationContext } from 'src/components/ApplicationProvider/context'

import type { ChatWebSocketCallbacks, ChatWebSocketOptions, } from '@emd-cloud/sdk'
// ** Types
import { ConnectionState } from '@emd-cloud/sdk'

export interface UseChatWebSocketReturn {
  /**
   * Connects to the WebSocket server.
   * @returns Promise that resolves when connected
   */
  connect: () => Promise<void>

  /**
   * Disconnects from the WebSocket server.
   */
  disconnect: () => void

  /**
   * Subscribes to a chat channel for real-time updates.
   * @param channelId - Chat channel ID
   * @param chatId - Optional chat ID for authentication
   * @returns Promise that resolves when subscription succeeds
   */
  subscribeToChannel: (channelId: string, chatId?: string) => Promise<void>

  /**
   * Unsubscribes from a chat channel.
   * @param channelId - Chat channel ID
   */
  unsubscribeFromChannel: (channelId: string) => void

  /**
   * Subscribes to support channel (private-space).
   * For staff members to receive support updates.
   * @returns Promise that resolves when subscription succeeds
   */
  subscribeToSupport: () => Promise<void>

  /**
   * Sets event callbacks (merges with existing callbacks).
   * @param callbacks - Event callbacks
   */
  setCallbacks: (callbacks: ChatWebSocketCallbacks) => void

  /**
   * Gets the current connection state.
   * @returns Current connection state
   */
  getConnectionState: () => ConnectionState

  /**
   * Gets list of subscribed channels.
   * @returns Set of subscribed channel names
   */
  getSubscribedChannels: () => Set<string>

  /**
   * Current connection state (reactive)
   */
  connectionState: ConnectionState

  /**
   * Whether the WebSocket is currently connected
   */
  isConnected: boolean
}

export interface UseChatWebSocketOptions extends Partial<ChatWebSocketOptions> {
  /**
   * Automatically connect when component mounts
   * @default false
   */
  autoConnect?: boolean

  /**
   * Automatically disconnect when component unmounts
   * @default true
   */
  autoDisconnect?: boolean
}

/**
 * Hook for managing real-time chat via WebSocket.
 * Provides connection management, channel subscriptions, and event handling.
 *
 * @param options - WebSocket configuration options
 *
 * @example
 * ```tsx
 * const MyChat = () => {
 *   const {
 *     connect,
 *     disconnect,
 *     subscribeToChannel,
 *     setCallbacks,
 *     connectionState,
 *     isConnected
 *   } = useChatWebSocket({
 *     autoConnect: true,
 *     callbacks: {
 *       onMessageReceived: (message) => {
 *         console.log('New message:', message)
 *       },
 *       onConnectionStateChange: (state) => {
 *         console.log('Connection state:', state)
 *       }
 *     }
 *   });
 *
 *   useEffect(() => {
 *     if (isConnected) {
 *       subscribeToChannel('channel-id');
 *     }
 *   }, [isConnected]);
 *
 *   return (
 *     <div>
 *       <p>Status: {connectionState}</p>
 *       {!isConnected && <button onClick={connect}>Connect</button>}
 *       {isConnected && <button onClick={disconnect}>Disconnect</button>}
 *     </div>
 *   );
 * };
 * ```
 */
const useChatWebSocket = (
  options: UseChatWebSocketOptions = {}
): UseChatWebSocketReturn => {
  const appData = useContext(ApplicationContext)
  const {
    autoConnect = false,
    autoDisconnect = true,
    callbacks,
    authToken,
    userData,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    maxReconnectDelay,
    pingInterval,
  } = options

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  )

  const callbacksRef = useRef<ChatWebSocketCallbacks | undefined>(callbacks)

  callbacksRef.current = callbacks

  const chatWebSocket = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }

    const stableCallbacks: ChatWebSocketCallbacks = {
      onMessageReceived: (message) => {
        callbacksRef.current?.onMessageReceived?.(message)
      },
      onMessageDeleted: (data) => {
        callbacksRef.current?.onMessageDeleted?.(data)
      },
      onSupportCountUpdated: (data) => {
        callbacksRef.current?.onSupportCountUpdated?.(data)
      },
      onSupportChannelUpdated: (channel) => {
        callbacksRef.current?.onSupportChannelUpdated?.(channel)
      },
      onConnectionStateChange: (state) => {
        setConnectionState(state)
        callbacksRef.current?.onConnectionStateChange?.(state)
      },
      onError: (error) => {
        callbacksRef.current?.onError?.(error)
      },
    }

    return appData.sdkInstance.chatWebSocket({
      authToken,
      userData,
      autoReconnect,
      maxReconnectAttempts,
      reconnectDelay,
      maxReconnectDelay,
      pingInterval,
      callbacks: stableCallbacks,
    })
  }, [
    appData.sdkInstance,
    authToken,
    userData,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    maxReconnectDelay,
    pingInterval,
  ])

  const connect = useCallback(async (): Promise<void> => {
    if (!chatWebSocket) {
      throw new Error(
        'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
      )
    }

    await chatWebSocket.connect()
  }, [chatWebSocket])

  const disconnect = useCallback((): void => {
    if (!chatWebSocket) {
      throw new Error(
        'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
      )
    }

    chatWebSocket.disconnect()
  }, [chatWebSocket])

  const subscribeToChannel = useCallback(
    async (channelId: string, chatId?: string): Promise<void> => {
      if (!chatWebSocket) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      await chatWebSocket.subscribeToChannel(channelId, chatId)
    },
    [chatWebSocket]
  )

  const unsubscribeFromChannel = useCallback(
    (channelId: string): void => {
      if (!chatWebSocket) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      chatWebSocket.unsubscribeFromChannel(channelId)
    },
    [chatWebSocket]
  )

  const subscribeToSupport = useCallback(async (): Promise<void> => {
    if (!chatWebSocket) {
      throw new Error(
        'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
      )
    }

    await chatWebSocket.subscribeToSupport()
  }, [chatWebSocket])

  const setCallbacks = useCallback(
    (callbacks: ChatWebSocketCallbacks): void => {
      if (!chatWebSocket) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      callbacksRef.current = callbacks
    },
    [chatWebSocket]
  )

  const getConnectionState = useCallback((): ConnectionState => {
    if (!chatWebSocket) {
      return ConnectionState.Disconnected
    }

    return chatWebSocket.getConnectionState()
  }, [chatWebSocket])

  const getSubscribedChannels = useCallback((): Set<string> => {
    if (!chatWebSocket) {
      return new Set()
    }

    return chatWebSocket.getSubscribedChannels()
  }, [chatWebSocket])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && chatWebSocket) {
      connect().catch((error) => {
        console.error('[useChatWebSocket] Auto-connect failed:', error)
      })
    }
  }, [autoConnect, chatWebSocket, connect])

  // Auto-disconnect on unmount if enabled
  useEffect(() => {
    return () => {
      if (autoDisconnect && chatWebSocket) {
        chatWebSocket.disconnect()
      }
    }
  }, [autoDisconnect, chatWebSocket])

  const isConnected = useMemo(() => {
    return connectionState === ConnectionState.Connected
  }, [connectionState])

  return {
    connect,
    disconnect,
    subscribeToChannel,
    unsubscribeFromChannel,
    subscribeToSupport,
    setCallbacks,
    getConnectionState,
    getSubscribedChannels,
    connectionState,
    isConnected,
  }
}

export default useChatWebSocket

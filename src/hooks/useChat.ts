// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import { ApplicationContext } from 'src/components/ApplicationProvider/context'

// ** Types
import type {
  ChatListOptions,
  ChatChannelType,
  CreateChannelByTypeOptions,
  UpsertChannelOptions,
  GetChannelOptions,
  SendMessageOptions,
  ChatMessageListOptions,
  GetUnreadCountOptions,
} from '@emd-cloud/sdk'
import type { EmdCloud } from '@emd-cloud/sdk'

// Reuse SDK method parameter types to stay in sync with @emd-cloud/sdk
type SDKChat = EmdCloud['chat']

export interface UseChatReturn {
  /**
   * Lists chat channels with filtering and pagination.
   *
   * @param options - List options including filters and pagination
   * @returns Promise resolving to channel list with pagination info
   *
   * @example
   * // Get all public channels
   * const channels = await listChannels({ type: ChatChannelType.Public, limit: 20 });
   *
   * // Get unread staff-to-user chats
   * const unread = await listChannels({
   *   type: ChatChannelType.StaffToUser,
   *   unreadedChats: true
   * });
   */
  listChannels: (
    options?: ChatListOptions
  ) => ReturnType<SDKChat['listChannels']>

  /**
   * Creates or gets existing chat channel by type.
   *
   * @param type - Channel type (staff-to-user, peer-to-peer, staff)
   * @param options - Options including userId or accesses list
   * @returns Promise resolving to the channel
   *
   * @example
   * // Create staff-to-user chat
   * const channel = await createChannelByType(ChatChannelType.StaffToUser, {
   *   userId: 'user-uuid'
   * });
   *
   * // Create peer-to-peer chat
   * const dmChannel = await createChannelByType(ChatChannelType.PeerToPeer, {
   *   accesses: ['user-uuid-1', 'user-uuid-2']
   * });
   */
  createChannelByType: (
    type: ChatChannelType,
    options?: CreateChannelByTypeOptions
  ) => ReturnType<SDKChat['createChannelByType']>

  /**
   * Creates or updates a chat channel.
   *
   * @param data - Channel data (include _id to update)
   * @returns Promise resolving to the channel
   *
   * @example
   * // Create new channel
   * const channel = await upsertChannel({
   *   id: 'my-channel',
   *   type: ChatChannelType.Public
   * });
   *
   * // Update existing channel
   * const updated = await upsertChannel({
   *   _id: 'channel-id',
   *   resolved: true
   * });
   */
  upsertChannel: (
    data: UpsertChannelOptions
  ) => ReturnType<SDKChat['upsertChannel']>

  /**
   * Gets chat channel details.
   *
   * @param id - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @returns Promise resolving to the channel details
   *
   * @example
   * const channel = await getChannel('staff-to-user-user-uuid');
   */
  getChannel: (
    id: string,
    options?: GetChannelOptions
  ) => ReturnType<SDKChat['getChannel']>

  /**
   * Deletes a chat channel.
   *
   * @param channelId - Channel _id to delete
   * @returns Promise resolving to success status
   *
   * @example
   * await deleteChannel('channel-mongo-id');
   */
  deleteChannel: (
    channelId: string
  ) => ReturnType<SDKChat['deleteChannel']>

  /**
   * Sends a message to a chat channel.
   *
   * @param channelId - Channel ID to send message to
   * @param options - Message options including text and attachments
   * @returns Promise resolving to the created message
   *
   * @example
   * // Send text message
   * const msg = await sendMessage('channel-id', {
   *   message: 'Hello world!'
   * });
   *
   * // Send message with attachments
   * const msgWithFiles = await sendMessage('channel-id', {
   *   message: 'Check out these files',
   *   attaches: [
   *     { type: 'image', attach: 'image-id', name: 'photo.jpg' },
   *     { type: 'file', attach: 'file-id', name: 'document.pdf' }
   *   ]
   * });
   */
  sendMessage: (
    channelId: string,
    options: SendMessageOptions
  ) => ReturnType<SDKChat['sendMessage']>

  /**
   * Lists messages in a chat channel.
   *
   * @param channelId - Channel ID
   * @param options - List options including search and pagination
   * @returns Promise resolving to message list with pagination info
   *
   * @example
   * // Get recent messages
   * const messages = await listMessages('channel-id', {
   *   limit: 50,
   *   page: 0,
   *   orderBy: 'createdAt',
   *   sort: 'DESC'
   * });
   *
   * // Search messages
   * const searchResults = await listMessages('channel-id', {
   *   search: 'hello'
   * });
   */
  listMessages: (
    channelId: string,
    options?: ChatMessageListOptions
  ) => ReturnType<SDKChat['listMessages']>

  /**
   * Deletes a message.
   *
   * @param channelId - Channel ID
   * @param messageId - Message _id to delete
   * @returns Promise resolving to success status
   *
   * @example
   * await deleteMessage('channel-id', 'message-mongo-id');
   */
  deleteMessage: (
    channelId: string,
    messageId: string
  ) => ReturnType<SDKChat['deleteMessage']>

  /**
   * Gets unread message count for a channel (staff-to-user chats).
   *
   * @param channelId - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @returns Promise resolving to unread counts for creator and recipient
   *
   * @example
   * const counts = await getUnreadCount('channel-id');
   * console.log(`Creator: ${counts.creator}, Recipient: ${counts.recipient}`);
   */
  getUnreadCount: (
    channelId: string,
    options?: GetUnreadCountOptions
  ) => ReturnType<SDKChat['getUnreadCount']>
}

/**
 * Hook for interacting with EMD Cloud chat functionality.
 * Provides REST API operations for managing channels and messages.
 *
 * @example
 * ```tsx
 * const { listChannels, sendMessage, createChannelByType } = useChat();
 *
 * // List public channels
 * const channels = await listChannels({
 *   type: ChatChannelType.Public,
 *   limit: 20
 * });
 *
 * // Create a support channel
 * const channel = await createChannelByType(ChatChannelType.StaffToUser, {
 *   userId: 'user-uuid'
 * });
 *
 * // Send a message
 * await sendMessage(channel.id, {
 *   message: 'Hello! How can we help you?'
 * });
 * ```
 */
const useChat = (): UseChatReturn => {
  const appData = useContext(ApplicationContext)

  const sdkChat = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return appData.sdkInstance.chat
  }, [appData.sdkInstance])

  const listChannels = useCallback(
    async (
      options: ChatListOptions = {}
    ): ReturnType<SDKChat['listChannels']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.listChannels(options)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const createChannelByType = useCallback(
    async (
      type: ChatChannelType,
      options: CreateChannelByTypeOptions = {}
    ): ReturnType<SDKChat['createChannelByType']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.createChannelByType(type, options)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const upsertChannel = useCallback(
    async (
      data: UpsertChannelOptions
    ): ReturnType<SDKChat['upsertChannel']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.upsertChannel(data)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const getChannel = useCallback(
    async (
      id: string,
      options: GetChannelOptions = {}
    ): ReturnType<SDKChat['getChannel']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.getChannel(id, options)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const deleteChannel = useCallback(
    async (channelId: string): ReturnType<SDKChat['deleteChannel']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.deleteChannel(channelId)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const sendMessage = useCallback(
    async (
      channelId: string,
      options: SendMessageOptions
    ): ReturnType<SDKChat['sendMessage']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.sendMessage(channelId, options)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const listMessages = useCallback(
    async (
      channelId: string,
      options: ChatMessageListOptions = {}
    ): ReturnType<SDKChat['listMessages']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.listMessages(channelId, options)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const deleteMessage = useCallback(
    async (
      channelId: string,
      messageId: string
    ): ReturnType<SDKChat['deleteMessage']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.deleteMessage(channelId, messageId)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  const getUnreadCount = useCallback(
    async (
      channelId: string,
      options: GetUnreadCountOptions = {}
    ): ReturnType<SDKChat['getUnreadCount']> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      try {
        return await sdkChat.getUnreadCount(channelId, options)
      } catch (error) {
        throw error
      }
    },
    [sdkChat]
  )

  return {
    listChannels,
    createChannelByType,
    upsertChannel,
    getChannel,
    deleteChannel,
    sendMessage,
    listMessages,
    deleteMessage,
    getUnreadCount,
  }
}

export default useChat

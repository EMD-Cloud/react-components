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
  ChatListResponse,
  ChatChannelResponse,
  ChatMessageResponse,
  ChatDeleteResponse,
  ChatMessageListResponse,
  UnreadCountResponse,
  CallOptions,
  ServerError,
} from '@emd-cloud/sdk'

export interface UseChatReturn {
  /**
   * Lists chat channels with filtering and pagination.
   *
   * @param options - List options including filters and pagination
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to channel list with pagination info or ServerError
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
   *
   * // Use with API token for server-side
   * const serverChannels = await listChannels(
   *   { limit: 50 },
   *   { authType: 'api-token' }
   * );
   *
   * // Get full response object
   * const response = await listChannels(
   *   { limit: 20 },
   *   { ignoreFormatResponse: true }
   * );
   */
  listChannels(
    options: ChatListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatListResponse | ServerError>
  listChannels(
    options?: ChatListOptions,
    callOptions?: CallOptions,
  ): Promise<ChatListResponse['data'] | ServerError>

  /**
   * Creates or gets existing chat channel by type.
   *
   * @param type - Channel type (staff-to-user, peer-to-peer, staff)
   * @param options - Options including userId or accesses list
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to the channel or ServerError
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
   *
   * // Get full response object
   * const response = await createChannelByType(
   *   ChatChannelType.StaffToUser,
   *   { userId: 'user-uuid' },
   *   { ignoreFormatResponse: true }
   * );
   */
  createChannelByType(
    type: ChatChannelType,
    options: CreateChannelByTypeOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatChannelResponse | ServerError>
  createChannelByType(
    type: ChatChannelType,
    options?: CreateChannelByTypeOptions,
    callOptions?: CallOptions,
  ): Promise<ChatChannelResponse['data'] | ServerError>

  /**
   * Creates or updates a chat channel.
   *
   * @param data - Channel data (include _id to update)
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to the channel or ServerError
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
  upsertChannel(
    data: UpsertChannelOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatChannelResponse | ServerError>
  upsertChannel(
    data: UpsertChannelOptions,
    callOptions?: CallOptions,
  ): Promise<ChatChannelResponse['data'] | ServerError>

  /**
   * Gets chat channel details.
   *
   * @param id - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to the channel details or ServerError
   *
   * @example
   * const channel = await getChannel('staff-to-user-user-uuid');
   *
   * // Mark messages as read
   * const channel = await getChannel('channel-id', { cleanupUnreaded: true });
   */
  getChannel(
    id: string,
    options: GetChannelOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatChannelResponse | ServerError>
  getChannel(
    id: string,
    options?: GetChannelOptions,
    callOptions?: CallOptions,
  ): Promise<ChatChannelResponse['data'] | ServerError>

  /**
   * Deletes a chat channel.
   *
   * @param channelId - Channel _id to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to success status or ServerError
   *
   * @example
   * await deleteChannel('channel-mongo-id');
   */
  deleteChannel(
    channelId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatDeleteResponse | ServerError>
  deleteChannel(
    channelId: string,
    callOptions?: CallOptions,
  ): Promise<ChatDeleteResponse['data'] | ServerError>

  /**
   * Sends a message to a chat channel.
   *
   * @param channelId - Channel ID to send message to
   * @param options - Message options including text and attachments
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to the created message or ServerError
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
  sendMessage(
    channelId: string,
    options: SendMessageOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatMessageResponse | ServerError>
  sendMessage(
    channelId: string,
    options: SendMessageOptions,
    callOptions?: CallOptions,
  ): Promise<ChatMessageResponse['data'] | ServerError>

  /**
   * Lists messages in a chat channel.
   *
   * @param channelId - Channel ID
   * @param options - List options including search and pagination
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to message list with pagination info or ServerError
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
  listMessages(
    channelId: string,
    options: ChatMessageListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatListResponse | ServerError>
  listMessages(
    channelId: string,
    options?: ChatMessageListOptions,
    callOptions?: CallOptions,
  ): Promise<ChatListResponse['data'] | ServerError>

  /**
   * Deletes a message.
   *
   * @param channelId - Channel ID
   * @param messageId - Message _id to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to success status or ServerError
   *
   * @example
   * await deleteMessage('channel-id', 'message-mongo-id');
   */
  deleteMessage(
    channelId: string,
    messageId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatDeleteResponse | ServerError>
  deleteMessage(
    channelId: string,
    messageId: string,
    callOptions?: CallOptions,
  ): Promise<ChatDeleteResponse['data'] | ServerError>

  /**
   * Gets unread message count for a channel (staff-to-user chats).
   *
   * @param channelId - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to unread counts for creator and recipient or ServerError
   *
   * @example
   * const counts = await getUnreadCount('channel-id');
   * console.log(`Creator: ${counts.creator}, Recipient: ${counts.recipient}`);
   *
   * // Mark as read
   * const counts = await getUnreadCount('channel-id', { cleanupUnreaded: true });
   */
  getUnreadCount(
    channelId: string,
    options: GetUnreadCountOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<UnreadCountResponse | ServerError>
  getUnreadCount(
    channelId: string,
    options?: GetUnreadCountOptions,
    callOptions?: CallOptions,
  ): Promise<UnreadCountResponse['data'] | ServerError>
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
 *
 * // Use with API token for server-side operation
 * const serverChannels = await listChannels(
 *   { limit: 50 },
 *   { authType: 'api-token' }
 * );
 *
 * // Get full response object
 * const response = await sendMessage(
 *   'channel-id',
 *   { message: 'Hello' },
 *   { ignoreFormatResponse: true }
 * );
 * if ('success' in response && response.success) {
 *   console.log('Message:', response.data);
 * }
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
      options: ChatListOptions = {},
      callOptions: CallOptions = {},
    ): Promise<ChatListResponse | ChatListResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.listChannels(options, callOptions)
    },
    [sdkChat]
  )

  const createChannelByType = useCallback(
    async (
      type: ChatChannelType,
      options: CreateChannelByTypeOptions = {},
      callOptions: CallOptions = {},
    ): Promise<ChatChannelResponse | ChatChannelResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.createChannelByType(type, options, callOptions)
    },
    [sdkChat]
  )

  const upsertChannel = useCallback(
    async (
      data: UpsertChannelOptions,
      callOptions: CallOptions = {},
    ): Promise<ChatChannelResponse | ChatChannelResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.upsertChannel(data, callOptions)
    },
    [sdkChat]
  )

  const getChannel = useCallback(
    async (
      id: string,
      options: GetChannelOptions = {},
      callOptions: CallOptions = {},
    ): Promise<ChatChannelResponse | ChatChannelResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.getChannel(id, options, callOptions)
    },
    [sdkChat]
  )

  const deleteChannel = useCallback(
    async (
      channelId: string,
      callOptions: CallOptions = {},
    ): Promise<ChatDeleteResponse | ChatDeleteResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.deleteChannel(channelId, callOptions)
    },
    [sdkChat]
  )

  const sendMessage = useCallback(
    async (
      channelId: string,
      options: SendMessageOptions,
      callOptions: CallOptions = {},
    ): Promise<ChatMessageResponse | ChatMessageResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.sendMessage(channelId, options, callOptions)
    },
    [sdkChat]
  )

  const listMessages = useCallback(
    async (
      channelId: string,
      options: ChatMessageListOptions = {},
      callOptions: CallOptions = {},
    ): Promise<ChatMessageListResponse | ChatMessageListResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.listMessages(channelId, options, callOptions)
    },
    [sdkChat]
  )

  const deleteMessage = useCallback(
    async (
      channelId: string,
      messageId: string,
      callOptions: CallOptions = {},
    ): Promise<ChatDeleteResponse | ChatDeleteResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.deleteMessage(channelId, messageId, callOptions)
    },
    [sdkChat]
  )

  const getUnreadCount = useCallback(
    async (
      channelId: string,
      options: GetUnreadCountOptions = {},
      callOptions: CallOptions = {},
    ): Promise<UnreadCountResponse | UnreadCountResponse['data'] | ServerError> => {
      if (!sdkChat) {
        throw new Error(
          'SDK not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency.'
        )
      }

      return await sdkChat.getUnreadCount(channelId, options, callOptions)
    },
    [sdkChat]
  )

  return {
    listChannels: listChannels as UseChatReturn['listChannels'],
    createChannelByType: createChannelByType as UseChatReturn['createChannelByType'],
    upsertChannel: upsertChannel as UseChatReturn['upsertChannel'],
    getChannel: getChannel as UseChatReturn['getChannel'],
    deleteChannel: deleteChannel as UseChatReturn['deleteChannel'],
    sendMessage: sendMessage as UseChatReturn['sendMessage'],
    listMessages: listMessages as UseChatReturn['listMessages'],
    deleteMessage: deleteMessage as UseChatReturn['deleteMessage'],
    getUnreadCount: getUnreadCount as UseChatReturn['getUnreadCount'],
  }
}

export default useChat

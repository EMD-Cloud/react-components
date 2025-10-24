import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ChatChannelType } from '@emd-cloud/sdk'

import { ApplicationProvider } from 'src/components'
import { useChat } from 'src/hooks'
import config from '../../config'

// Mock the SDK
const mockSDK = {
  auth: {
    login: vi.fn(),
    registration: vi.fn(),
    authorization: vi.fn(),
  },
  chat: {
    listChannels: vi.fn(),
    createChannelByType: vi.fn(),
    upsertChannel: vi.fn(),
    getChannel: vi.fn(),
    deleteChannel: vi.fn(),
    sendMessage: vi.fn(),
    listMessages: vi.fn(),
    deleteMessage: vi.fn(),
    getUnreadCount: vi.fn(),
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
  ChatChannelType: {
    Public: 'public',
    StaffToUser: 'staff-to-user',
    PeerToPeer: 'peer-to-peer',
    Staff: 'staff',
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

describe('useChat Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockChannel = {
    _id: 'channel-123',
    space: 'test-space',
    id: 'public-general',
    type: 'public' as const,
    lastMessageAt: new Date('2025-01-01'),
    lastMessageUser: 'user-123',
    resolved: false,
  }

  const mockMessage = {
    _id: 'message-123',
    channel: 'channel-123',
    message: 'Hello world!',
    user: 'user-123',
    createdAt: new Date('2025-01-01'),
  }

  describe('Channel Management', () => {
    it('should list channels successfully', async () => {
      const mockResponse = {
        data: [mockChannel],
        count: 1,
        pages: 1,
      }
      mockSDK.chat.listChannels.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.listChannels({
          type: ChatChannelType.Public,
          limit: 20,
        })
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.listChannels).toHaveBeenCalledWith({
        type: ChatChannelType.Public,
        limit: 20,
      })
    })

    it('should list channels with search filter', async () => {
      const mockResponse = {
        data: [mockChannel],
        count: 1,
        pages: 1,
      }
      mockSDK.chat.listChannels.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        await result.current.listChannels({
          type: ChatChannelType.Public,
          search: 'general',
          unreadedChats: true,
        })
      })

      expect(mockSDK.chat.listChannels).toHaveBeenCalledWith({
        type: ChatChannelType.Public,
        search: 'general',
        unreadedChats: true,
      })
    })

    it('should create channel by type (staff-to-user)', async () => {
      const mockResponse = { ...mockChannel, type: 'staff-to-user' as const }
      mockSDK.chat.createChannelByType.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.createChannelByType(
          ChatChannelType.StaffToUser,
          { userId: 'user-456' }
        )
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.createChannelByType).toHaveBeenCalledWith(
        ChatChannelType.StaffToUser,
        { userId: 'user-456' }
      )
    })

    it('should create channel by type (peer-to-peer)', async () => {
      const mockResponse = { ...mockChannel, type: 'peer-to-peer' as const }
      mockSDK.chat.createChannelByType.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.createChannelByType(
          ChatChannelType.PeerToPeer,
          { accesses: ['user-1', 'user-2'] }
        )
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.createChannelByType).toHaveBeenCalledWith(
        ChatChannelType.PeerToPeer,
        { accesses: ['user-1', 'user-2'] }
      )
    })

    it('should upsert channel (create)', async () => {
      mockSDK.chat.upsertChannel.mockResolvedValue(mockChannel)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.upsertChannel({
          id: 'new-channel',
          type: ChatChannelType.Public,
        })
        expect(response).toEqual(mockChannel)
      })

      expect(mockSDK.chat.upsertChannel).toHaveBeenCalledWith({
        id: 'new-channel',
        type: ChatChannelType.Public,
      })
    })

    it('should upsert channel (update)', async () => {
      const updatedChannel = { ...mockChannel, resolved: true }
      mockSDK.chat.upsertChannel.mockResolvedValue(updatedChannel)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.upsertChannel({
          _id: 'channel-123',
          resolved: true,
        })
        expect(response).toEqual(updatedChannel)
      })

      expect(mockSDK.chat.upsertChannel).toHaveBeenCalledWith({
        _id: 'channel-123',
        resolved: true,
      })
    })

    it('should get channel details', async () => {
      mockSDK.chat.getChannel.mockResolvedValue(mockChannel)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.getChannel('public-general')
        expect(response).toEqual(mockChannel)
      })

      expect(mockSDK.chat.getChannel).toHaveBeenCalledWith('public-general', {})
    })

    it('should get channel with cleanup unreaded', async () => {
      mockSDK.chat.getChannel.mockResolvedValue(mockChannel)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        await result.current.getChannel('public-general', {
          cleanupUnreaded: true,
        })
      })

      expect(mockSDK.chat.getChannel).toHaveBeenCalledWith('public-general', {
        cleanupUnreaded: true,
      })
    })

    it('should delete channel successfully', async () => {
      const mockResponse = { success: true }
      mockSDK.chat.deleteChannel.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.deleteChannel('channel-123')
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.deleteChannel).toHaveBeenCalledWith('channel-123')
    })
  })

  describe('Message Management', () => {
    it('should send text message successfully', async () => {
      mockSDK.chat.sendMessage.mockResolvedValue(mockMessage)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.sendMessage('channel-123', {
          message: 'Hello world!',
        })
        expect(response).toEqual(mockMessage)
      })

      expect(mockSDK.chat.sendMessage).toHaveBeenCalledWith('channel-123', {
        message: 'Hello world!',
      })
    })

    it('should send message with attachments', async () => {
      const messageWithAttachments = {
        ...mockMessage,
        attaches: [
          { type: 'image', attach: 'image-id', name: 'photo.jpg' },
          { type: 'file', attach: 'file-id', name: 'document.pdf' },
        ],
      }
      mockSDK.chat.sendMessage.mockResolvedValue(messageWithAttachments)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.sendMessage('channel-123', {
          message: 'Check out these files',
          attaches: [
            { type: 'image', attach: 'image-id', name: 'photo.jpg' },
            { type: 'file', attach: 'file-id', name: 'document.pdf' },
          ],
        })
        expect(response).toEqual(messageWithAttachments)
      })

      expect(mockSDK.chat.sendMessage).toHaveBeenCalledWith('channel-123', {
        message: 'Check out these files',
        attaches: [
          { type: 'image', attach: 'image-id', name: 'photo.jpg' },
          { type: 'file', attach: 'file-id', name: 'document.pdf' },
        ],
      })
    })

    it('should list messages successfully', async () => {
      const mockResponse = {
        data: [mockMessage],
        count: 1,
        pages: 1,
      }
      mockSDK.chat.listMessages.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.listMessages('channel-123', {
          limit: 50,
          page: 0,
          orderBy: 'createdAt',
          sort: 'DESC',
        })
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.listMessages).toHaveBeenCalledWith('channel-123', {
        limit: 50,
        page: 0,
        orderBy: 'createdAt',
        sort: 'DESC',
      })
    })

    it('should search messages', async () => {
      const mockResponse = {
        data: [mockMessage],
        count: 1,
        pages: 1,
      }
      mockSDK.chat.listMessages.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        await result.current.listMessages('channel-123', {
          search: 'hello',
        })
      })

      expect(mockSDK.chat.listMessages).toHaveBeenCalledWith('channel-123', {
        search: 'hello',
      })
    })

    it('should delete message successfully', async () => {
      const mockResponse = { success: true }
      mockSDK.chat.deleteMessage.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.deleteMessage(
          'channel-123',
          'message-123'
        )
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.deleteMessage).toHaveBeenCalledWith(
        'channel-123',
        'message-123'
      )
    })
  })

  describe('Unread Count', () => {
    it('should get unread count successfully', async () => {
      const mockResponse = { creator: 5, recipient: 3 }
      mockSDK.chat.getUnreadCount.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.getUnreadCount('channel-123')
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.getUnreadCount).toHaveBeenCalledWith(
        'channel-123',
        {}
      )
    })

    it('should get unread count with cleanup', async () => {
      const mockResponse = { creator: 0, recipient: 0 }
      mockSDK.chat.getUnreadCount.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        const response = await result.current.getUnreadCount('channel-123', {
          cleanupUnreaded: true,
        })
        expect(response).toEqual(mockResponse)
      })

      expect(mockSDK.chat.getUnreadCount).toHaveBeenCalledWith('channel-123', {
        cleanupUnreaded: true,
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle channel creation error', async () => {
      const mockError = new Error('Failed to create channel')
      mockSDK.chat.createChannelByType.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        await expect(
          result.current.createChannelByType(ChatChannelType.Public)
        ).rejects.toThrow('Failed to create channel')
      })
    })

    it('should handle send message error', async () => {
      const mockError = new Error('Failed to send message')
      mockSDK.chat.sendMessage.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        await expect(
          result.current.sendMessage('channel-123', {
            message: 'Hello',
          })
        ).rejects.toThrow('Failed to send message')
      })
    })

    it('should handle list channels error', async () => {
      const mockError = new Error('Failed to list channels')
      mockSDK.chat.listChannels.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChat(), { wrapper })

      await act(async () => {
        await expect(result.current.listChannels()).rejects.toThrow(
          'Failed to list channels'
        )
      })
    })
  })
})

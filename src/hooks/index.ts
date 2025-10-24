import useUploader, { ReadPermissionsType, FileType } from './useUploader'
import useDropzone from './useDropzone'
import useAuth from './useAuth'
import useDatabase from './useDatabase'
import useWebhook from './useWebhook'
import useUserInteraction from './useUserInteraction'
import useChat from './useChat'
import useChatWebSocket from './useChatWebSocket'

export {
  useUploader,
  useDropzone,
  useAuth,
  useDatabase,
  useWebhook,
  useUserInteraction,
  useChat,
  useChatWebSocket
}
export type { ReadPermissionsType, FileType }

// Re-export SDK uploader types for convenience
export type {
  ReadPermission,
  UploadStatus,
  UploadOptions,
  UploadProgress,
  UploadFile,
  UploadCallbacks,
} from '@emd-cloud/sdk'

// Re-export SDK chat types for convenience
export type {
  ChatChannelType,
  ChatReadPermission,
  ChatWritePermission,
  ChatChannel,
  ChatMessage,
  ChatAttachment,
  ChatListOptions,
  ChatListResponse,
  CreateChannelByTypeOptions,
  UpsertChannelOptions,
  GetChannelOptions,
  ChatMessageListOptions,
  ChatMessageListResponse,
  SendMessageOptions,
  GetUnreadCountOptions,
  UnreadCountResponse,
  ConnectionState,
  WebSocketEvent,
  ChatWebSocketOptions,
  ChatWebSocketCallbacks,
} from '@emd-cloud/sdk'

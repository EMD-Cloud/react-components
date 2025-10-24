# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React component library (`@emd-cloud/react-components`) that provides hooks and components for interacting with the EMD Cloud platform. The library is built with TypeScript and provides a React wrapper around the EMD Cloud SDK, offering authentication, file upload functionality, database operations, webhook integration, and comprehensive EMD Cloud services integration.

## Build and Development Commands

### Core Commands
- `npm install` - Install dependencies
- `npm run build` - Build the library (cleans dist/, compiles TypeScript, and bundles with Rollup)
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build Storybook for production
- `npm run prettier:formating` - Format code in src/ directory

### Testing
- Tests use Vitest with Happy DOM environment
- Test files are located in `tests/` directory with `.test.tsx` extensions
- Run a single test file: `npm test [filename]`
- Comprehensive test coverage for authentication methods and components
- Mock SDK integration for testing without external dependencies

## Architecture

### Project Structure
- `src/` - Source code
  - `components/` - React components (ApplicationProvider)
  - `hooks/` - Custom React hooks (useAuth, useUploader, useDropzone, useDatabase, useWebhook, useUserInteraction, useChat, useChatWebSocket)
  - `tools/` - Utility modules (uploader.ts)
  - `stories/` - Storybook stories
- `tests/` - Test files organized by feature
- `dist/` - Built output (gitignored)

### Build System
- **TypeScript**: Compiles to ES2018, outputs to `out-tsc/`
- **Rollup**: Creates three builds:
  1. Minified ES module bundle
  2. ES modules with source maps (preserves module structure)
  3. TypeScript declarations (.d.ts files)
- **Vite**: Used for testing and Storybook

### Key Dependencies
- `@emd-cloud/sdk` - Peer dependency providing core EMD Cloud functionality (v1.11.0+ for chat support)
- `tus-js-client` - Peer dependency for resumable file upload protocol
- `uuid` - Peer dependency for generating unique identifiers
- `react` & `react-dom` - Peer dependencies (v16.8+ through v19)
- Semantic Release for automated versioning and publishing

### Main Exports
The library exports:
- **Hooks**: `useAuth` (comprehensive auth with SDK integration), `useUploader`, `useDropzone`, `useDatabase` (database CRUD operations), `useWebhook` (webhook integration), `useUserInteraction` (social accounts, user management, activity tracking), `useChat` (chat REST API operations), `useChatWebSocket` (real-time chat messaging)
- **Components**: `ApplicationProvider` (manages SDK instance and application state)
- **Types**: All database, webhook, user interaction, and chat types from @emd-cloud/sdk

### SDK Integration Architecture
- **ApplicationProvider** automatically initializes and manages the EMD Cloud SDK instance
- **useAuth** hook uses SDK methods instead of direct API calls
- **useUploader** hook uses SDK's uploader instance for file uploads with TUS protocol
- **useDatabase**, **useWebhook**, **useUserInteraction**, and **useChat** all delegate to SDK
- **useChatWebSocket** creates WebSocket instances via SDK for real-time messaging
- Graceful fallback when SDK is not installed
- Dynamic SDK loading to avoid runtime errors
- Centralized token management through SDK

### Authentication Methods Available
- **Basic Auth**: Email/password login and registration
- **Social Auth**: OAuth integration with VK and Yandex
- **Password Recovery**: Complete forgot password flow with email verification
- **Token Management**: Automatic token handling through SDK
- **Authorization**: Token-based authentication verification

### File Upload Features Available
- **Resumable Uploads**: Uses TUS protocol for reliable, resumable file uploads via SDK
- **Multiple File Support**: Upload multiple files simultaneously with progress tracking
- **Progress Tracking**: Real-time progress updates with bytes uploaded and percentage
- **Batch Completion Callbacks**: `onSuccess` fires once when all files succeed, `onFailed` fires once when any file fails
- **Callback Management**: `onUpdate` fires periodically during upload and stops when batch completes
- **State Management**: `resetUploader()` method to clear internal state and file references, preventing memory leaks
- **Permission Control**: Flexible read permissions (public, authenticated users, staff, specific users)
- **Chunked Upload**: Large file support with configurable chunk sizes
- **Automatic Retry**: Configurable retry delays for failed upload chunks
- **Upload Control**: Ability to stop/abort individual file uploads
- **Authentication**: Automatic authentication via SDK token management
- **Type Safety**: Full TypeScript support with SDK types

### Database Operations Available
- **CRUD Operations**: Create, read, update, delete database records
- **Query & Filter**: Advanced filtering with MongoDB-style queries ($and, $or, etc.)
- **Sorting & Pagination**: Sort by columns, limit results, pagination support
- **Bulk Operations**: Bulk updates and multi-row deletions
- **Button Triggers**: Execute button actions on database rows
- **Type Safety**: Full TypeScript support with generics for data types
- **Authentication**: Support for both user auth-token and server api-token modes

### Webhook Integration Available
- **Custom Requests**: Full control over HTTP method, headers, and body
- **Simple JSON Sending**: Easy POST requests with JSON payloads
- **GET Requests**: Fetch data from webhook endpoints
- **Error Handling**: Comprehensive error handling and response validation
- **Authentication**: Support for different authentication types
- **Type Safety**: Full TypeScript support for webhook responses

### User Interaction Features Available
- **Social Account Management**: Attach/detach social accounts (Steam, VK, Twitch) to user profiles
- **Activity Tracking**: Track user presence with ping functionality for online/offline status
- **User Administration**: List and retrieve detailed user information (staff/admin features)
- **Pagination & Filtering**: Search, filter by status, and paginate through user lists
- **Type Safety**: Full TypeScript support with proper typing for all operations

### Chat Features Available
- **REST API Operations**: Complete chat channel and message management via `useChat` hook
- **Channel Management**: Create, list, update, and delete chat channels
- **Channel Types**: Support for public, staff-to-user, peer-to-peer, and staff channels
- **Message Operations**: Send, list, and delete messages with attachment support
- **Unread Tracking**: Get and clear unread message counts for channels
- **Real-time Messaging**: WebSocket integration via `useChatWebSocket` hook
- **WebSocket Features**: Auto-reconnect, connection state tracking, event callbacks
- **Channel Subscriptions**: Subscribe/unsubscribe to channels for live updates
- **Support Integration**: Subscribe to support channel for staff notifications
- **Event Handling**: Callbacks for message received, deleted, connection state changes
- **Type Safety**: Full TypeScript support for all chat operations

### Testing Coverage
- Complete test coverage for all hooks (115+ tests passing)
- Chat REST API: 19 test cases covering all channel and message operations
- Chat WebSocket: 21 test cases covering connection, subscriptions, and event handling
- User interaction: 19 test cases covering social accounts, ping, and user management
- Database operations: 14 test cases covering all CRUD operations
- Webhook operations: 13 test cases covering all HTTP methods
- Authentication: 11 test cases covering all auth methods
- File uploader: 10 test cases covering upload flow, callbacks, batch completion, and state reset
- Mock SDK integration prevents external API dependencies
- Error handling and edge case coverage

### Release Process
- Uses semantic-release with conventional commits
- Automatically triggered on push to main branch via GitHub Actions
- Publishes to npm with public access
- Creates GitHub releases with notes

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Module resolution: Node with ESNext modules
- JSX: React mode
- Base URL set to `src/` for imports
- All authentication logic delegates to SDK for consistency

### Integration Notes
- Always check SDK availability before calling methods
- Use proper error handling for SDK method failures
- Maintain backward compatibility with existing API
- Test SDK integration with mocks to avoid external dependencies

## Usage Examples

### useUploader Hook
```tsx
import { useUploader, ReadPermission } from '@emd-cloud/react-components'
import { useState } from 'react'

const MyComponent = () => {
  const [files, setFiles] = useState([])
  const [uploadStatus, setUploadStatus] = useState('')

  const { uploadFiles, isProccess, resetUploader } = useUploader({
    readPermission: ReadPermission.OnlyAuthUser,
    integration: 'default',
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
    onBeforeUpload: (files) => {
      // Validate files before upload
      const validFiles = files.filter(f => f.size < 100 * 1024 * 1024) // Max 100MB
      if (validFiles.length !== files.length) {
        alert('Some files are too large')
        return false
      }
      return true
    },
    onUpdate: (updatedFiles) => {
      // Fires periodically during upload with progress updates
      setFiles(updatedFiles)
      console.log('Upload progress:', updatedFiles)
    },
    onSuccess: (completedFiles) => {
      // Fires once when all files succeed
      console.log('All files uploaded successfully!')
      setUploadStatus('success')
      completedFiles.forEach(file => {
        console.log(`Uploaded: ${file.fileUrl}`)
      })
      // Clear internal state after showing success for 2 seconds
      setTimeout(() => {
        resetUploader()
        setFiles([])
      }, 2000)
    },
    onFailed: (completedFiles) => {
      // Fires once when any file fails
      console.error('Upload batch failed!')
      setUploadStatus('failed')
      completedFiles.forEach(file => {
        if (file.status === 'failed') {
          console.error(`Failed: ${file.fileName} - ${file.error?.message}`)
        }
      })
      // Clear internal state after showing error for 2 seconds
      setTimeout(() => {
        resetUploader()
        setFiles([])
      }, 2000)
    }
  })

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    setUploadStatus('')
    uploadFiles(selectedFiles)
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={isProccess}
      />
      {isProccess && <p>Uploading files...</p>}
      {uploadStatus === 'success' && <p>All files uploaded successfully!</p>}
      {uploadStatus === 'failed' && <p>Some files failed to upload</p>}
      <div>
        {files.map((file) => (
          <div key={file.id}>
            <span>{file.fileName}</span>
            <span>{file.status}</span>
            {file.progress && <span>{file.progress}%</span>}
            {file.fileUrl && <a href={file.fileUrl}>Download</a>}
            {file.methods?.stop && (
              <button onClick={file.methods.stop}>Cancel</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### useDatabase Hook
```tsx
import { useDatabase } from '@emd-cloud/react-components'

const MyComponent = () => {
  const { getRows, createRow, updateRow, deleteRow } = useDatabase()
  
  // Get rows with filtering and sorting
  const loadUsers = async () => {
    const users = await getRows('users', {
      query: { "$and": [{ "data.status": { "$eq": "active" } }] },
      limit: 20,
      sort: [{ column: "createdAt", sort: "desc" }]
    })
    console.log('Users:', users.data)
  }
  
  // Create a new user
  const createUser = async () => {
    const newUser = await createRow('users', {
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active'
    })
    console.log('Created:', newUser.data)
  }
  
  return <div>Database operations component</div>
}
```

### useWebhook Hook
```tsx
import { useWebhook } from '@emd-cloud/react-components'

const MyComponent = () => {
  const { sendWebhook, callWebhook, getWebhook } = useWebhook()
  
  // Send JSON notification
  const notifyUserCreated = async (userId: string) => {
    await sendWebhook('user-created', {
      userId,
      timestamp: new Date().toISOString(),
      source: 'my-app'
    })
  }
  
  // Custom webhook request
  const processData = async (data: any) => {
    const result = await callWebhook('process-endpoint', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return result
  }
  
  return <div>Webhook integration component</div>
}
```

### useUserInteraction Hook
```tsx
import { useUserInteraction, SocialProvider, AccountStatus } from '@emd-cloud/react-components'

const MyComponent = () => {
  const { attachSocialAccount, detachSocialAccount, ping, getUserList, getUserDetails } = useUserInteraction()

  // Attach a Steam account to current user
  const connectSteam = async () => {
    const response = await attachSocialAccount({
      provider: SocialProvider.STEAM,
      redirectUrl: 'https://myapp.com/profile'
    })
    // Redirect user to Steam login
    window.location.href = response.url
  }

  // Detach a social account
  const disconnectSteam = async () => {
    const result = await detachSocialAccount(SocialProvider.STEAM)
    if (result.success) {
      console.log('Steam account disconnected')
    }
  }

  // Track user activity (call periodically)
  const updateActivity = async () => {
    await ping()
  }

  // Get paginated user list (staff only)
  const loadUsers = async () => {
    const users = await getUserList({
      search: 'john',
      limit: 20,
      page: 0,
      orderBy: 'createdAt',
      sort: 'DESC',
      accountStatus: AccountStatus.Approved
    })
    console.log(`Found ${users.total} users:`, users.data)
  }

  // Get specific user details
  const loadUserProfile = async (userId: string) => {
    const user = await getUserDetails(userId)
    console.log('User details:', user)
  }

  return <div>User interaction component</div>
}
```

### useChat Hook
```tsx
import { useChat, ChatChannelType } from '@emd-cloud/react-components'

const MyComponent = () => {
  const {
    listChannels,
    createChannelByType,
    sendMessage,
    listMessages,
    getUnreadCount
  } = useChat()

  // List public channels
  const loadChannels = async () => {
    const channels = await listChannels({
      type: ChatChannelType.Public,
      limit: 20,
      search: 'general'
    })
    console.log('Channels:', channels.data)
  }

  // Create a support channel
  const createSupportChannel = async (userId: string) => {
    const channel = await createChannelByType(ChatChannelType.StaffToUser, {
      userId
    })
    console.log('Created channel:', channel.id)
  }

  // Create a peer-to-peer chat
  const createDirectMessage = async (userIds: string[]) => {
    const channel = await createChannelByType(ChatChannelType.PeerToPeer, {
      accesses: userIds
    })
    return channel
  }

  // Send a text message
  const sendTextMessage = async (channelId: string, text: string) => {
    const message = await sendMessage(channelId, {
      message: text
    })
    console.log('Message sent:', message._id)
  }

  // Send a message with attachments
  const sendMessageWithFiles = async (channelId: string) => {
    const message = await sendMessage(channelId, {
      message: 'Check out these files!',
      attaches: [
        { type: 'image', attach: 'image-id', name: 'screenshot.png' },
        { type: 'file', attach: 'file-id', name: 'report.pdf' }
      ]
    })
    return message
  }

  // Load messages
  const loadMessages = async (channelId: string) => {
    const messages = await listMessages(channelId, {
      limit: 50,
      page: 0,
      orderBy: 'createdAt',
      sort: 'DESC'
    })
    console.log(`${messages.count} messages:`, messages.data)
  }

  // Get unread counts
  const checkUnread = async (channelId: string) => {
    const counts = await getUnreadCount(channelId, {
      cleanupUnreaded: true // Mark as read
    })
    console.log(`Creator: ${counts.creator}, Recipient: ${counts.recipient}`)
  }

  return <div>Chat operations component</div>
}
```

### useChatWebSocket Hook
```tsx
import { useChatWebSocket, ConnectionState } from '@emd-cloud/react-components'
import { useEffect, useState } from 'react'

const MyChat = () => {
  const [messages, setMessages] = useState([])
  const [channels, setChannels] = useState([])

  const {
    connect,
    disconnect,
    subscribeToChannel,
    unsubscribeFromChannel,
    subscribeToSupport,
    setCallbacks,
    connectionState,
    isConnected
  } = useChatWebSocket({
    autoConnect: true, // Connect automatically on mount
    autoReconnect: true,
    maxReconnectAttempts: 10,
    callbacks: {
      onMessageReceived: (message) => {
        console.log('New message:', message)
        setMessages(prev => [...prev, message])
      },
      onMessageDeleted: (data) => {
        console.log('Message deleted:', data._id)
        setMessages(prev => prev.filter(m => m._id !== data._id))
      },
      onSupportCountUpdated: (data) => {
        console.log('Support unread count:', data.count)
      },
      onSupportChannelUpdated: (channel) => {
        console.log('Support channel updated:', channel)
      },
      onConnectionStateChange: (state) => {
        console.log('Connection state:', state)
      },
      onError: (error) => {
        console.error('WebSocket error:', error)
      }
    }
  })

  // Subscribe to channels when connected
  useEffect(() => {
    if (isConnected && channels.length > 0) {
      channels.forEach(channelId => {
        subscribeToChannel(channelId).catch(console.error)
      })
    }
  }, [isConnected, channels])

  // Join a channel
  const joinChannel = async (channelId: string) => {
    if (!isConnected) {
      await connect()
    }
    await subscribeToChannel(channelId)
    setChannels(prev => [...prev, channelId])
  }

  // Leave a channel
  const leaveChannel = (channelId: string) => {
    unsubscribeFromChannel(channelId)
    setChannels(prev => prev.filter(id => id !== channelId))
  }

  // Enable support notifications (staff only)
  const enableSupportNotifications = async () => {
    if (!isConnected) {
      await connect()
    }
    await subscribeToSupport()
  }

  // Update callbacks dynamically
  const addMessageHandler = (handler: (msg: any) => void) => {
    setCallbacks({
      onMessageReceived: handler
    })
  }

  return (
    <div>
      <div>
        <p>Connection: {connectionState}</p>
        {!isConnected && <button onClick={connect}>Connect</button>}
        {isConnected && <button onClick={disconnect}>Disconnect</button>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Channel ID"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              joinChannel(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
        />
        <button onClick={enableSupportNotifications}>
          Enable Support Notifications
        </button>
      </div>

      <div>
        <h3>Active Channels</h3>
        {channels.map(channelId => (
          <div key={channelId}>
            <span>{channelId}</span>
            <button onClick={() => leaveChannel(channelId)}>Leave</button>
          </div>
        ))}
      </div>

      <div>
        <h3>Messages</h3>
        {messages.map(msg => (
          <div key={msg._id}>
            <strong>{msg.user}:</strong> {msg.message}
          </div>
        ))}
      </div>
    </div>
  )
}
```

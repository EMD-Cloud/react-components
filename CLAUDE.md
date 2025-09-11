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
  - `hooks/` - Custom React hooks (useAuth, useUploader, useDropzone, useDatabase, useWebhook)
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
- `@emd-cloud/sdk` - Peer dependency providing core EMD Cloud functionality (v1.7.1+)
- `tus-js-client` - Resumable file upload protocol
- `react` & `react-dom` - Peer dependencies (v16.8+ through v19)
- Semantic Release for automated versioning and publishing

### Main Exports
The library exports:
- **Hooks**: `useAuth` (comprehensive auth with SDK integration), `useUploader`, `useDropzone`, `useDatabase` (database CRUD operations), `useWebhook` (webhook integration)
- **Components**: `ApplicationProvider` (manages SDK instance and application state)
- **Types**: All database and webhook types from @emd-cloud/sdk

### SDK Integration Architecture
- **ApplicationProvider** automatically initializes and manages the EMD Cloud SDK instance
- **useAuth** hook uses SDK methods instead of direct API calls
- Graceful fallback when SDK is not installed
- Dynamic SDK loading to avoid runtime errors
- Centralized token management through SDK

### Authentication Methods Available
- **Basic Auth**: Email/password login and registration
- **Social Auth**: OAuth integration with VK and Yandex
- **Password Recovery**: Complete forgot password flow with email verification
- **Token Management**: Automatic token handling through SDK
- **Authorization**: Token-based authentication verification

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

### Testing Coverage
- Complete test coverage for all hooks (49 tests passing)
- Database operations: 14 test cases covering all CRUD operations
- Webhook operations: 13 test cases covering all HTTP methods
- Authentication: 11 test cases covering all auth methods
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

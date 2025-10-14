import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { ApplicationProvider } from 'src/components'
import { useDatabase } from 'src/hooks'
import config from '../../config'

// Mock the SDK
const mockDatabase = {
  getRows: vi.fn(),
  countRows: vi.fn(),
  getRow: vi.fn(),
  createRow: vi.fn(),
  updateRow: vi.fn(),
  bulkUpdate: vi.fn(),
  deleteRow: vi.fn(),
  deleteRows: vi.fn(),
  triggerButton: vi.fn(),
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
  database: vi.fn(() => mockDatabase),
  webhook: {
    call: vi.fn(),
  },
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
  DatabaseSaveMode: {
    SYNC: 'SYNC',
    ASYNC: 'ASYNC',
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

describe('useDatabase Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockRowsResponse = {
    success: true,
    data: [
      {
        _id: 'row1',
        data: { name: 'John Doe', email: 'john@example.com' },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        _id: 'row2',
        data: { name: 'Jane Smith', email: 'jane@example.com' },
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ],
    count: 2,
  }

  const mockRowResponse = {
    success: true,
    data: {
      _id: 'row1',
      data: { name: 'John Doe', email: 'john@example.com' },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  }

  const mockCountResponse = {
    success: true,
    data: { count: 42 },
  }

  const mockBulkResponse = {
    success: true,
    data: { modifiedCount: 3, matchedCount: 5 },
  }

  const mockDeleteResponse = {
    success: true,
    data: { deletedCount: 1 },
  }

  const mockTriggerResponse = {
    success: true,
    data: { result: 'Button triggered successfully' },
  }

  it('should get rows from database successfully', async () => {
    mockDatabase.getRows.mockResolvedValue(mockRowsResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      const response = await result.current.getRows('users', {
        query: { "$and": [{ "data.status": { "$eq": "active" } }] },
        limit: 20,
        sort: [{ column: "createdAt", sort: "desc" }],
      })
      expect(response).toEqual(mockRowsResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('users')
    expect(mockDatabase.getRows).toHaveBeenCalledWith(
      {
        query: { "$and": [{ "data.status": { "$eq": "active" } }] },
        limit: 20,
        sort: [{ column: "createdAt", sort: "desc" }],
      },
      { ignoreFormatResponse: true }
    )
  })

  it('should count rows successfully', async () => {
    mockDatabase.countRows.mockResolvedValue(mockCountResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      const response = await result.current.countRows('users', {
        query: { "$and": [{ "data.status": { "$eq": "active" } }] },
      })
      expect(response).toEqual(mockCountResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('users')
    expect(mockDatabase.countRows).toHaveBeenCalledWith(
      {
        query: { "$and": [{ "data.status": { "$eq": "active" } }] },
      },
      { ignoreFormatResponse: true }
    )
  })

  it('should get a single row successfully', async () => {
    mockDatabase.getRow.mockResolvedValue(mockRowResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      const response = await result.current.getRow('users', 'row1', {
        useHumanReadableNames: true,
      })
      expect(response).toEqual(mockRowResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('users')
    expect(mockDatabase.getRow).toHaveBeenCalledWith(
      'row1',
      { useHumanReadableNames: true },
      { ignoreFormatResponse: true }
    )
  })

  it('should create a new row successfully', async () => {
    mockDatabase.createRow.mockResolvedValue(mockRowResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    const newRowData = { name: 'John Doe', email: 'john@example.com' }

    await act(async () => {
      const response = await result.current.createRow('users', newRowData, {
        notice: 'Created via API',
      })
      expect(response).toEqual(mockRowResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('users')
    expect(mockDatabase.createRow).toHaveBeenCalledWith(
      newRowData,
      { notice: 'Created via API' },
      { ignoreFormatResponse: true }
    )
  })

  it('should update a row successfully', async () => {
    mockDatabase.updateRow.mockResolvedValue(mockRowResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    const updateData = { email: 'john.doe.updated@example.com' }

    await act(async () => {
      const response = await result.current.updateRow('users', 'row1', updateData, {
        notice: 'Updated via API',
      })
      expect(response).toEqual(mockRowResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('users')
    expect(mockDatabase.updateRow).toHaveBeenCalledWith(
      'row1',
      updateData,
      { notice: 'Updated via API' },
      { ignoreFormatResponse: true }
    )
  })

  it('should perform bulk update successfully', async () => {
    mockDatabase.bulkUpdate.mockResolvedValue(mockBulkResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    const bulkPayload = {
      query: { "$and": [{ "data.status": { "$eq": "pending" } }] },
      data: { status: "in-progress" },
      notice: "Bulk status update",
    }

    await act(async () => {
      const response = await result.current.bulkUpdate('tasks', bulkPayload)
      expect(response).toEqual(mockBulkResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('tasks')
    expect(mockDatabase.bulkUpdate).toHaveBeenCalledWith(bulkPayload, { ignoreFormatResponse: true })
  })

  it('should delete a single row successfully', async () => {
    mockDatabase.deleteRow.mockResolvedValue(mockDeleteResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      const response = await result.current.deleteRow('users', 'row1')
      expect(response).toEqual(mockDeleteResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('users')
    expect(mockDatabase.deleteRow).toHaveBeenCalledWith('row1', { ignoreFormatResponse: true })
  })

  it('should delete multiple rows successfully', async () => {
    mockDatabase.deleteRows.mockResolvedValue(mockDeleteResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    const rowIds = ['row1', 'row2', 'row3']

    await act(async () => {
      const response = await result.current.deleteRows('users', rowIds)
      expect(response).toEqual(mockDeleteResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('users')
    expect(mockDatabase.deleteRows).toHaveBeenCalledWith(rowIds, { ignoreFormatResponse: true })
  })

  it('should trigger button successfully', async () => {
    mockDatabase.triggerButton.mockResolvedValue(mockTriggerResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      const response = await result.current.triggerButton('tasks', 'row1', 'approve-button')
      expect(response).toEqual(mockTriggerResponse)
    })

    expect(mockSDK.database).toHaveBeenCalledWith('tasks')
    expect(mockDatabase.triggerButton).toHaveBeenCalledWith('row1', 'approve-button', { ignoreFormatResponse: true })
  })

  it('should handle authentication type in call options', async () => {
    mockDatabase.getRows.mockResolvedValue(mockRowsResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      await result.current.getRows('users', {}, { authType: 'api-token' })
    })

    expect(mockDatabase.getRows).toHaveBeenCalledWith({}, { authType: 'api-token', ignoreFormatResponse: true })
  })

  it('should handle server errors properly', async () => {
    const serverError = {
      success: false,
      error: 'Database connection failed',
      status: 500,
    }

    mockDatabase.getRows.mockResolvedValue(serverError)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      const response = await result.current.getRows('users')
      expect(response).toEqual(serverError)
    })
  })

  it('should return null for database instance initially', () => {
    const { result } = renderHook(() => useDatabase(), { wrapper })
    
    expect(result.current.database).toBeNull()
  })

  it('should work with typed generic responses', async () => {
    interface User {
      name: string
      email: string
      age: number
    }

    const typedResponse = {
      success: true,
      data: {
        _id: 'user1',
        data: { name: 'John Doe', email: 'john@example.com', age: 30 },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    }

    mockDatabase.getRow.mockResolvedValue(typedResponse)

    const { result } = renderHook(() => useDatabase(), { wrapper })

    await act(async () => {
      const response = await result.current.getRow<User>('users', 'user1')
      expect(response).toEqual(typedResponse)
      expect(response.data.data.name).toBe('John Doe')
      expect(response.data.data.age).toBe(30)
    })
  })
})

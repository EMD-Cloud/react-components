import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

import { ApplicationProvider } from 'src/components'
import { useDatabase } from 'src/hooks'

const meta: Meta = {
  title: 'Hooks/useDatabase',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The useDatabase hook provides comprehensive database operations for EMD Cloud collections.
It includes CRUD operations, querying, sorting, filtering, and advanced features like bulk updates and button triggers.

## Features:
- **Query Operations**: Get rows with complex filtering and sorting
- **CRUD Operations**: Create, read, update, and delete operations
- **Bulk Operations**: Bulk updates and multi-row deletions
- **Button Triggers**: Execute button actions on database rows
- **Type Safety**: Full TypeScript support with generics
- **Error Handling**: Comprehensive error handling and validation

## Authentication:
Supports both 'auth-token' (user authentication) and 'api-token' (server authentication) modes.
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

// Mock collection ID for stories
const COLLECTION_ID = 'users'

// Example User interface for type safety
interface User {
  name: string
  email: string
  status: 'active' | 'inactive'
  role: 'admin' | 'user' | 'guest'
  joinedAt: string
}

// Database Operations Component
const DatabaseOperations: React.FC = () => {
  const {
    getRows,
    countRows,
    getRow,
    createRow,
    updateRow,
    bulkUpdate,
    deleteRow,
    triggerButton,
  } = useDatabase()

  const [rows, setRows] = useState<any[]>([])
  const [count, setCount] = useState<number>(0)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleError = (err: any) => {
    console.error('Database operation failed:', err)
    setError(err.message || 'An error occurred')
    setLoading(false)
  }

  const loadRows = async () => {
    try {
      setLoading(true)
      setError(null)

      const options: any = {
        limit: 10,
        page: 0,
        sort: [{ column: 'createdAt', sort: 'desc' }],
      }

      // Add search query if provided
      if (searchQuery.trim()) {
        options.query = {
          "$or": [
            { "data.name": { "$regex": searchQuery, "$options": "i" } },
            { "data.email": { "$regex": searchQuery, "$options": "i" } }
          ]
        }
      }

      const result = await getRows<User>(COLLECTION_ID, options)
      setRows(result.data || [])

      // Get count
      const countResult = await countRows(COLLECTION_ID, {
        query: options.query || {}
      })
      setCount(countResult.data?.count || 0)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setError('Name and email are required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const userData: User = {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        status: 'active',
        role: 'user',
        joinedAt: new Date().toISOString(),
      }

      await createRow<User>(COLLECTION_ID, userData, {
        notice: 'User created via Storybook demo'
      })

      setNewUserName('')
      setNewUserEmail('')
      await loadRows() // Refresh the list
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (rowId: string, updates: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)

      await updateRow<User>(COLLECTION_ID, rowId, updates, {
        notice: 'User updated via Storybook demo'
      })

      await loadRows() // Refresh the list
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (rowId: string) => {
    try {
      setLoading(true)
      setError(null)

      await deleteRow(COLLECTION_ID, rowId)
      await loadRows() // Refresh the list
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkStatusUpdate = async (status: 'active' | 'inactive') => {
    try {
      setLoading(true)
      setError(null)

      await bulkUpdate(COLLECTION_ID, {
        query: { "data.role": { "$eq": "user" } }, // Update all regular users
        data: { status },
        notice: `Bulk status update to ${status}`
      })

      await loadRows() // Refresh the list
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetSingleRow = async (rowId: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await getRow<User>(COLLECTION_ID, rowId, {
        useHumanReadableNames: true
      })
      
      setSelectedRow(result.data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadRows()
  }, [searchQuery])

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>Database Operations Demo</h2>

      {error && (
        <div style={{ 
          background: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          color: '#c33'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Search Section */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3>Search Users</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={loadRows}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
          Total records: {count}
        </p>
      </div>

      {/* Create User Section */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Create New User</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Full Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />
          <button
            onClick={handleCreateUser}
            disabled={loading || !newUserName.trim() || !newUserEmail.trim()}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>

      {/* Bulk Operations Section */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#fff8e1', borderRadius: '8px' }}>
        <h3>Bulk Operations</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Update all regular users to:</span>
          <button
            onClick={() => handleBulkStatusUpdate('active')}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Active
          </button>
          <button
            onClick={() => handleBulkStatusUpdate('inactive')}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Users List */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Users List</h3>
        {loading && <p>Loading...</p>}
        
        <div style={{ display: 'grid', gap: '10px' }}>
          {rows.map((row) => (
            <div
              key={row._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                background: 'white',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 8px 0' }}>
                  {row.data?.name || 'Unknown User'}
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    background: row.data?.status === 'active' ? '#d4edda' : '#f8d7da',
                    color: row.data?.status === 'active' ? '#155724' : '#721c24',
                    borderRadius: '12px'
                  }}>
                    {row.data?.status || 'unknown'}
                  </span>
                </h4>
                <p style={{ margin: '4px 0', color: '#666' }}>
                  {row.data?.email || 'No email'}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>
                  Role: {row.data?.role || 'unknown'} | 
                  ID: {row._id} |
                  Created: {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button
                  onClick={() => handleGetSingleRow(row._id)}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleUpdateUser(row._id, { 
                    status: row.data?.status === 'active' ? 'inactive' : 'active' 
                  })}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    background: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Toggle Status
                </button>
                <button
                  onClick={() => handleDeleteUser(row._id)}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {rows.length === 0 && !loading && (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No users found. Try creating a new user or adjusting your search.
            </p>
          )}
        </div>
      </div>

      {/* Selected Row Details */}
      {selectedRow && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Selected User Details</h3>
          <pre style={{ background: 'white', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(selectedRow, null, 2)}
          </pre>
          <button
            onClick={() => setSelectedRow(null)}
            style={{
              marginTop: '10px',
              padding: '6px 12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  )
}

const DatabaseWrapper: React.FC = () => (
  <ApplicationProvider
    app="demo-app"
    apiUrl="https://api.emd.one"
    authToken="demo-token"
  >
    <DatabaseOperations />
  </ApplicationProvider>
)

export const Interactive: Story = {
  render: () => <DatabaseWrapper />,
  parameters: {
    docs: {
      description: {
        story: `
Interactive demo of the useDatabase hook with all major operations:

**Available Operations:**
- **Search & Filter**: Search users by name or email with real-time filtering
- **Create**: Add new users with validation
- **Read**: View individual user details with full data structure
- **Update**: Toggle user status and modify data
- **Delete**: Remove users from the collection
- **Bulk Update**: Update multiple records based on query criteria
- **Count**: Get total number of matching records

**Features Demonstrated:**
- TypeScript generics for type safety
- Error handling and loading states
- Real-time data updates
- Complex query operations
- Authentication options
- Human-readable field names

**Note:** This demo uses mock data. In a real application, replace the collection ID and ensure your EMD Cloud app has the appropriate permissions.
        `,
      },
    },
  },
}

export const BasicUsage: Story = {
  render: () => {
    const BasicExample: React.FC = () => {
      const { getRows, createRow, countRows } = useDatabase()
      const [status, setStatus] = useState<string>('Ready')

      const handleBasicOperations = async () => {
        try {
          setStatus('Running operations...')

          // Count total records
          const countResult = await countRows('users')
          console.log('Total users:', countResult.data.count)

          // Get recent users
          const usersResult = await getRows('users', {
            limit: 5,
            sort: [{ column: 'createdAt', sort: 'desc' }]
          })
          console.log('Recent users:', usersResult.data)

          // Create a new user
          const newUser = await createRow('users', {
            name: 'Demo User',
            email: 'demo@example.com',
            status: 'active'
          })
          console.log('Created user:', newUser.data)

          setStatus('Operations completed - check console for results')
        } catch (error) {
          console.error('Operation failed:', error)
          setStatus('Error: ' + (error as Error).message)
        }
      }

      return (
        <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
          <h3>Basic useDatabase Operations</h3>
          <p>Status: <strong>{status}</strong></p>
          <button
            onClick={handleBasicOperations}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Run Basic Operations
          </button>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <p>This example demonstrates:</p>
            <ul>
              <li>Counting records in a collection</li>
              <li>Querying with sorting and limits</li>
              <li>Creating new records</li>
            </ul>
            <p><em>Check the browser console for detailed results.</em></p>
          </div>
        </div>
      )
    }

    return (
      <ApplicationProvider app="demo-app" apiUrl="https://api.emd.one">
        <BasicExample />
      </ApplicationProvider>
    )
  },
}
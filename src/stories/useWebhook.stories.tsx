import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { ApplicationProvider } from 'src/components'
import { useWebhook } from 'src/hooks'

const meta: Meta = {
  title: 'Hooks/useWebhook',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The useWebhook hook provides easy integration with EMD Cloud webhook endpoints.
It offers convenient methods for calling webhooks with different HTTP methods and payload formats.

## Features:
- **Custom Requests**: Full control over HTTP method, headers, and body
- **Simple JSON Sending**: Easy POST requests with JSON payloads
- **GET Requests**: Fetch data from webhook endpoints
- **Authentication**: Support for different authentication types
- **Error Handling**: Comprehensive error handling and response validation

## Authentication:
Supports both 'auth-token' (user authentication) and 'api-token' (server authentication) modes.

## Common Use Cases:
- Sending notifications and events
- Triggering external processes
- Fetching configuration or status data
- Integration with third-party services
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

// Webhook Operations Component
const WebhookOperations: React.FC = () => {
  const { callWebhook } = useWebhook()

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [responses, setResponses] = useState<Array<{ id: string, data: any, timestamp: string }>>([])

  // Form states
  const [webhookId, setWebhookId] = useState('user-activity')
  const [jsonPayload, setJsonPayload] = useState(`{
  "event": "page_view",
  "userId": "user-123",
  "page": "/dashboard",
  "timestamp": "${new Date().toISOString()}"
}`)

  const [customMethod, setCustomMethod] = useState<string>('POST')
  const [customHeaders, setCustomHeaders] = useState(`{
  "Content-Type": "application/json",
  "X-Source": "storybook-demo"
}`)
  const [customBody, setCustomBody] = useState(`{
  "message": "Hello from Storybook",
  "data": {
    "demo": true,
    "timestamp": "${new Date().toISOString()}"
  }
}`)

  const addResponse = (id: string, data: any) => {
    setResponses(prev => [
      { id, data, timestamp: new Date().toISOString() },
      ...prev.slice(0, 9) // Keep last 10 responses
    ])
  }

  const handleError = (err: any) => {
    console.error('Webhook operation failed:', err)
    setError(err.message || 'An error occurred')
    setLoading(false)
  }

  const handleSendWebhook = async () => {
    if (!webhookId.trim()) {
      setError('Webhook ID is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const payload = JSON.parse(jsonPayload)
      const result = await callWebhook(webhookId.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      addResponse(`callWebhook(${webhookId}, POST)`, result)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON payload: ' + err.message)
      } else {
        handleError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGetWebhook = async () => {
    if (!webhookId.trim()) {
      setError('Webhook ID is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await callWebhook(webhookId.trim(), { method: 'GET' })
      addResponse(`callWebhook(${webhookId}, GET)`, result)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomCall = async () => {
    if (!webhookId.trim()) {
      setError('Webhook ID is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const headers = JSON.parse(customHeaders)
      const body = customMethod !== 'GET' ? customBody : undefined

      const requestOptions: RequestInit = {
        method: customMethod,
        headers,
        ...(body && { body })
      }

      const result = await callWebhook(webhookId.trim(), requestOptions)
      addResponse(`callWebhook(${webhookId}, ${customMethod})`, result)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON in headers or body: ' + err.message)
      } else {
        handleError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  const clearResponses = () => {
    setResponses([])
    setError(null)
  }

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>Webhook Operations Demo</h2>

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

      {/* Webhook ID Input */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3>Webhook Configuration</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', minWidth: '100px' }}>Webhook ID:</label>
          <input
            type="text"
            placeholder="e.g., user-activity, order-completed"
            value={webhookId}
            onChange={(e) => setWebhookId(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
          Enter the ID of your webhook endpoint configured in EMD Cloud
        </p>
      </div>

      {/* Send JSON Webhook */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Send JSON Webhook (POST)</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          Send a JSON payload to the webhook endpoint using a POST call.
        </p>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
            JSON Payload:
          </label>
          <textarea
            value={jsonPayload}
            onChange={(e) => setJsonPayload(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </div>

        <button
          onClick={handleSendWebhook}
          disabled={loading || !webhookId.trim()}
          style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send JSON Webhook'}
        </button>
      </div>

      {/* Get Webhook Data */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#fff8e1', borderRadius: '8px' }}>
        <h3>Get Webhook Data (GET)</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          Retrieve data from the webhook endpoint using a GET request.
        </p>

        <button
          onClick={handleGetWebhook}
          disabled={loading || !webhookId.trim()}
          style={{
            padding: '8px 16px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Getting...' : 'Get Webhook Data'}
        </button>
      </div>

      {/* Custom Webhook Call */}
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Custom Webhook Call</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          Make a custom webhook call with full control over method, headers, and body.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Method Selection */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
              HTTP Method:
            </label>
            <select
              value={customMethod}
              onChange={(e) => setCustomMethod(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Headers */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
              Headers (JSON):
            </label>
            <textarea
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
          </div>

          {/* Body (for non-GET methods) */}
          {customMethod !== 'GET' && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                Request Body:
              </label>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCustomCall}
          disabled={loading || !webhookId.trim()}
          style={{
            padding: '8px 16px',
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          {loading ? 'Calling...' : `Make ${customMethod} Request`}
        </button>
      </div>

      {/* Response History */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Response History</h3>
          {responses.length > 0 && (
            <button
              onClick={clearResponses}
              style={{
                padding: '4px 12px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear History
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {responses.map((response, index) => (
            <div
              key={`${response.id}-${index}`}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                background: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#007bff' }}>{response.id}</h4>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <pre style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          ))}

          {responses.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No webhook responses yet. Try making a webhook call above.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const WebhookWrapper: React.FC = () => (
  <ApplicationProvider
    app="demo-app"
    apiUrl="https://api.emd.one"
    authToken="demo-token"
  >
    <WebhookOperations />
  </ApplicationProvider>
)

export const Interactive: Story = {
  render: () => <WebhookWrapper />,
  parameters: {
    docs: {
      description: {
        story: `
Interactive demo of the useWebhook hook with all major operations:

**Available Operations:**
- **Send JSON Webhook**: Quick POST requests with JSON payloads using the \`callWebhook\` method
- **Get Webhook Data**: Retrieve data using GET requests with the \`callWebhook\` method  
- **Custom Webhook Call**: Full control over HTTP method, headers, and body using \`callWebhook\`

**Features Demonstrated:**
- Different HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Custom headers and authentication
- JSON payload handling
- Response history and debugging
- Error handling and validation
- Real-time response display

**Use Cases:**
- Sending event notifications
- Triggering external processes  
- Fetching configuration data
- Integration with third-party APIs
- Real-time data synchronization

**Note:** This demo uses mock webhook IDs. In a real application, configure your webhook endpoints in the EMD Cloud dashboard and use the actual webhook IDs.
        `,
      },
    },
  },
}

export const BasicUsage: Story = {
  render: () => {
    const BasicExample: React.FC = () => {
      const { callWebhook } = useWebhook()
      const [status, setStatus] = useState<string>('Ready')

      const handleBasicOperations = async () => {
        try {
          setStatus('Running webhook operations...')

          // Send a simple notification
          const notificationResult = await callWebhook('user-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            userId: 'user-123',
              timestamp: new Date().toISOString(),
              source: 'storybook-demo'
            })
          })
          console.log('Notification sent:', notificationResult)

          // Get webhook status
          const statusResult = await callWebhook('health-check', { method: 'GET' })
          console.log('Webhook status:', statusResult)

          // Custom webhook call
          const customResult = await callWebhook('process-data', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': crypto.randomUUID()
            },
            body: JSON.stringify({
              action: 'process',
              data: { demo: true, timestamp: Date.now() }
            })
          })
          console.log('Custom call result:', customResult)

          setStatus('All operations completed - check console for results')
        } catch (error) {
          console.error('Webhook operation failed:', error)
          setStatus('Error: ' + (error as Error).message)
        }
      }

      return (
        <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
          <h3>Basic useWebhook Operations</h3>
          <p>Status: <strong>{status}</strong></p>
          <button
            onClick={handleBasicOperations}
            style={{
              padding: '10px 20px',
              background: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Run Webhook Operations
          </button>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <p>This example demonstrates:</p>
            <ul>
              <li>Sending JSON notifications to webhooks</li>
              <li>Getting data from webhook endpoints</li>
              <li>Making custom webhook calls with full control</li>
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
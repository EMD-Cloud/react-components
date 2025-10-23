import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { useContext } from 'react'

import { ApplicationProvider } from 'src/components'
import { ApplicationContext } from 'src/components/ApplicationProvider/context'
import * as EMDCloudSDK from '@emd-cloud/sdk'

// Get reference to mocked constructor
const mockEmdCloudConstructor = vi.mocked(EMDCloudSDK.EmdCloud)

vi.mock('@emd-cloud/sdk', () => {
  const mockSDK = {
    auth: {
      login: vi.fn(),
      registration: vi.fn(),
      authorization: vi.fn(),
    },
    setAuthToken: vi.fn(),
  }
  
  const mockConstructor = vi.fn(() => mockSDK)
  
  return {
    EmdCloud: mockConstructor,
    AppEnvironment: {
      Client: 'client',
      Server: 'server',
    },
  }
})

// Test component to access context
const TestComponent = () => {
  const context = useContext(ApplicationContext)
  return (
    <div>
      <div data-testid="app">{context.app}</div>
      <div data-testid="apiUrl">{context.apiUrl}</div>
      <div data-testid="tokenType">{context.tokenType}</div>
      <div data-testid="sdkInitialized">{context.sdkInstance ? 'true' : 'false'}</div>
    </div>
  )
}

describe('ApplicationProvider Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide default context values', () => {
    const { getByTestId } = render(
      <ApplicationProvider app="test-app">
        <TestComponent />
      </ApplicationProvider>
    )

    expect(getByTestId('app').textContent).toBe('test-app')
    expect(getByTestId('apiUrl').textContent).toBe('https://api.emd.one')
    expect(getByTestId('tokenType').textContent).toBe('token')
  })

  it('should use custom props when provided', () => {
    const { getByTestId } = render(
      <ApplicationProvider 
        app="custom-app" 
        apiUrl="https://custom.api.com"
        tokenType="bearer"
        authToken="custom-token"
      >
        <TestComponent />
      </ApplicationProvider>
    )

    expect(getByTestId('app').textContent).toBe('custom-app')
    expect(getByTestId('apiUrl').textContent).toBe('https://custom.api.com')
    expect(getByTestId('tokenType').textContent).toBe('bearer')
  })

  it('should initialize SDK instance', async () => {
    const { getByTestId } = render(
      <ApplicationProvider 
        app="test-app" 
        apiUrl="https://api.emd.one"
        authToken="test-token"
      >
        <TestComponent />
      </ApplicationProvider>
    )

    // Wait for SDK to be initialized
    await waitFor(() => {
      expect(getByTestId('sdkInitialized').textContent).toBe('true')
    }, { timeout: 1000 })

    expect(mockEmdCloudConstructor).toHaveBeenCalledWith({
      environment: 'client',
      appId: 'test-app',
      apiUrl: 'https://api.emd.one',
      apiToken: 'test-token'
    })
  })

  it('should initialize SDK without auth token', async () => {
    const { getByTestId } = render(
      <ApplicationProvider app="test-app">
        <TestComponent />
      </ApplicationProvider>
    )

    await waitFor(() => {
      expect(getByTestId('sdkInitialized').textContent).toBe('true')
    }, { timeout: 1000 })

    expect(mockEmdCloudConstructor).toHaveBeenCalledWith({
      environment: 'client',
      appId: 'test-app',
      apiUrl: 'https://api.emd.one'
    })
  })

  it('should handle SDK initialization error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock the EmdCloud constructor to throw an error
    mockEmdCloudConstructor.mockImplementationOnce(() => {
      throw new Error('SDK initialization failed')
    })

    const { getByTestId } = render(
      <ApplicationProvider app="test-app">
        <TestComponent />
      </ApplicationProvider>
    )

    // Children should still render even when SDK fails to initialize
    await waitFor(() => {
      expect(getByTestId('sdkInitialized').textContent).toBe('false')
    })
    expect(consoleSpy).toHaveBeenCalledWith('@emd-cloud/sdk initialization failed:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should handle missing SDK dependency gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock the constructor to throw an error simulating missing dependency
    mockEmdCloudConstructor.mockImplementationOnce(() => {
      throw new Error('Module not found')
    })

    const { getByTestId } = render(
      <ApplicationProvider app="test-app">
        <TestComponent />
      </ApplicationProvider>
    )

    // Children should still render even when SDK dependency is missing
    await waitFor(() => {
      expect(getByTestId('sdkInitialized').textContent).toBe('false')
    })
    expect(consoleSpy).toHaveBeenCalledWith('@emd-cloud/sdk initialization failed:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should re-initialize SDK when dependencies change', async () => {
    const { getByTestId, rerender } = render(
      <ApplicationProvider app="test-app" authToken="token1">
        <TestComponent />
      </ApplicationProvider>
    )

    await waitFor(() => {
      expect(getByTestId('sdkInitialized').textContent).toBe('true')
    })

    expect(mockEmdCloudConstructor).toHaveBeenCalledWith({
      environment: 'client',
      appId: 'test-app',
      apiUrl: 'https://api.emd.one',
      apiToken: 'token1'
    })

    // Change auth token
    rerender(
      <ApplicationProvider app="test-app" authToken="token2">
        <TestComponent />
      </ApplicationProvider>
    )

    await waitFor(() => {
      expect(mockEmdCloudConstructor).toHaveBeenCalledWith({
        environment: 'client',
        appId: 'test-app',
        apiUrl: 'https://api.emd.one',
        apiToken: 'token2'
      })
    })
  })
})

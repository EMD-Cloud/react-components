// component.test.ts
import { describe, beforeAll, it, vi, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

import config from '../../config'

import { ApplicationProvider } from '../../../src/components'
import { useUploader } from '../../../src/hooks'
import { FileType } from '../../../src/hooks/useUploader'

// Mock the SDK uploader
const mockUploadFile = vi.fn()
const mockUploader = {
  uploadFile: mockUploadFile,
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
  database: vi.fn(),
  webhook: {
    call: vi.fn(),
  },
  uploader: mockUploader,
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

describe('Test useUploader', () => {
  const testFiles: File[] = []

  beforeAll(() => {
    testFiles.push(new File(['Text for test file!'], 'example.txt', { type: 'text/plain' }))
    testFiles.push(new File(['Text for test file!'], 'example2.txt', { type: 'text/plain' }))

    // Setup mock uploader behavior
    mockUploadFile.mockImplementation((file, options, callbacks) => {
      const uploadId = `upload-${Date.now()}-${Math.random()}`

      // Simulate upload progress
      setTimeout(() => {
        callbacks.onProgress({ percentage: 50, bytesUploaded: 500, bytesTotal: 1000 })
      }, 10)

      // Simulate success
      setTimeout(() => {
        callbacks.onSuccess('file-id-123', 'https://example.com/file.txt')
      }, 20)

      return {
        uploadId,
        file: {
          abort: vi.fn(),
        },
      }
    })
  })

  it('Uploading file is started', async () => {
    const maxNumberOfFiles = 5

    const files: FileType[] = await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
        onUpdate: (files) => {
          if (!files.length) return

          res(files)
        }
      }), { wrapper })

      uploadFiles(testFiles)
    })

    const expectedValues = ['started', 'progress', 'success', 'failed']

    expect(expectedValues.includes(files[0].status)).toBe(true)
    expect(files[0].fileName).toBe('example.txt')
  })

  it('Prevalidation test before loading success', async () => {
    const maxNumberOfFiles = 5
    const onUpdate = vi.fn()

    await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
        onUpdate
      }), { wrapper })

      uploadFiles(testFiles)

      setTimeout(res, 100)
    })

    expect(onUpdate).toHaveBeenCalled()
  })

  it('Prevalidation test before loading failed', async () => {
    const maxNumberOfFiles = 1
    const onUpdate = vi.fn()

    await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
        onUpdate
      }), { wrapper })

      uploadFiles(testFiles)

      setTimeout(res, 100)
    })

    expect(onUpdate).not.toHaveBeenCalled()
  })
})

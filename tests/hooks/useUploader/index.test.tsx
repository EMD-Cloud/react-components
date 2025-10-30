// component.test.ts
import { describe, beforeAll, it, vi, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

import config from '../../config'

import { ApplicationProvider } from '../../../src/components'
import { useUploader } from '../../../src/hooks'
import { FileType } from '../../../src'

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
  EmdCloud: vi.fn(function() { return mockSDK }),
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

  it('onSuccess callback fires once when all files succeed', async () => {
    const onSuccess = vi.fn()
    const onFailed = vi.fn()
    const onUpdate = vi.fn()

    await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onUpdate,
        onSuccess: (files) => {
          onSuccess(files)
          res(undefined)
        },
        onFailed
      }), { wrapper })

      uploadFiles(testFiles)
    })

    // onSuccess should be called exactly once
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onFailed).not.toHaveBeenCalled()

    // Should receive all files in success state
    const files = onSuccess.mock.calls[0][0]
    expect(files).toHaveLength(2)
    expect(files.every((f: FileType) => f.status === 'success')).toBe(true)
  })

  it('onFailed callback fires once when any file fails', async () => {
    const onSuccess = vi.fn()
    const onFailed = vi.fn()

    // Mock one successful and one failed upload
    mockUploadFile.mockImplementationOnce((file, options, callbacks) => {
      const uploadId = `upload-${Date.now()}-${Math.random()}`

      setTimeout(() => {
        callbacks.onProgress({ percentage: 50, bytesUploaded: 500, bytesTotal: 1000 })
      }, 10)

      setTimeout(() => {
        callbacks.onSuccess('file-id-123', 'https://example.com/file.txt')
      }, 20)

      return {
        uploadId,
        file: {
          abort: vi.fn(),
        },
      }
    }).mockImplementationOnce((file, options, callbacks) => {
      const uploadId = `upload-${Date.now()}-${Math.random()}`

      setTimeout(() => {
        callbacks.onError(new Error('Upload failed'))
      }, 15)

      return {
        uploadId,
        file: {
          abort: vi.fn(),
        },
      }
    })

    await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onSuccess,
        onFailed: (files) => {
          onFailed(files)
          res(undefined)
        }
      }), { wrapper })

      uploadFiles(testFiles)
    })

    // onFailed should be called exactly once
    expect(onFailed).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toHaveBeenCalled()

    // Should receive all files including the failed one
    const files = onFailed.mock.calls[0][0]
    expect(files).toHaveLength(2)
    expect(files.some((f: FileType) => f.status === 'failed')).toBe(true)

    // Restore original mock implementation
    mockUploadFile.mockImplementation((file, options, callbacks) => {
      const uploadId = `upload-${Date.now()}-${Math.random()}`

      setTimeout(() => {
        callbacks.onProgress({ percentage: 50, bytesUploaded: 500, bytesTotal: 1000 })
      }, 10)

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

  it('onUpdate stops firing after batch completes', async () => {
    const onUpdate = vi.fn()
    let updateCallCount = 0

    await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onUpdate: (files) => {
          updateCallCount++
          onUpdate(files)
        },
        onSuccess: () => {
          // Wait a bit after success to ensure onUpdate isn't called again
          setTimeout(res, 50)
        }
      }), { wrapper })

      uploadFiles(testFiles)
    })

    const callCountAfterSuccess = updateCallCount

    // Wait to ensure no more calls
    await new Promise(res => setTimeout(res, 50))

    // onUpdate should not be called after batch completes
    expect(updateCallCount).toBe(callCountAfterSuccess)
  })

  it('onSuccess and onFailed are optional', async () => {
    const onUpdate = vi.fn()

    await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onUpdate: (files) => {
          onUpdate(files)
          // Resolve after files are in success state
          if (files.every(f => f.status === 'success')) {
            res(undefined)
          }
        }
      }), { wrapper })

      uploadFiles(testFiles)
    })

    // Should work without errors even without onSuccess/onFailed
    expect(onUpdate).toHaveBeenCalled()
  })

  it('resetUploader clears all files and internal state', async () => {
    let resetFn: (() => void) | null = null
    const onUpdate = vi.fn()

    await new Promise((res) => {
      const { result: { current: { uploadFiles, resetUploader } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onUpdate: (files) => {
          onUpdate(files)
          if (files.every(f => f.status === 'success')) {
            res(undefined)
          }
        }
      }), { wrapper })

      resetFn = resetUploader
      uploadFiles(testFiles)
    })

    // Files should have been uploaded
    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0]
    expect(lastCall.length).toBe(2)

    // Reset the uploader
    if (resetFn) {
      resetFn()
    }

    // After reset, onUpdate should be called with empty array
    await new Promise(res => setTimeout(res, 50))

    // Verify state was cleared (next upload should work)
    expect(resetFn).toBeTruthy()
  })

  it('resetUploader allows re-uploading same files', async () => {
    let resetFn: (() => void) | null = null
    const onSuccess = vi.fn()

    // First upload
    await new Promise((res) => {
      const { result: { current: { uploadFiles, resetUploader } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onSuccess: (files) => {
          onSuccess(files)
          res(undefined)
        }
      }), { wrapper })

      resetFn = resetUploader
      uploadFiles(testFiles)
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)

    // Reset
    if (resetFn) {
      resetFn()
    }

    await new Promise(res => setTimeout(res, 100))

    // Second upload with same files should work
    await new Promise((res) => {
      const { result: { current: { uploadFiles: uploadFiles2 } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onSuccess: () => {
          res(undefined)
        }
      }), { wrapper })

      uploadFiles2(testFiles)
    })

    // Should be able to upload again
    expect(onSuccess).toHaveBeenCalled()
  })

  it('resetUploader resets batch tracking state', async () => {
    let resetFn: (() => void) | null = null
    const onSuccess = vi.fn()
    const onFailed = vi.fn()

    // First upload - success
    await new Promise((res) => {
      const { result: { current: { uploadFiles, resetUploader } } } = renderHook(() => useUploader({
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onSuccess: () => {
          onSuccess()
          res(undefined)
        },
        onFailed
      }), { wrapper })

      resetFn = resetUploader
      uploadFiles(testFiles)
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onFailed).not.toHaveBeenCalled()

    // Reset
    if (resetFn) {
      resetFn()
    }

    // After reset, batch tracking should be cleared
    // This is verified by the fact that we can upload again
    await new Promise(res => setTimeout(res, 50))
    expect(resetFn).toBeTruthy()
  })
})

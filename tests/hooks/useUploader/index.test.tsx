import { describe, beforeAll, beforeEach, afterEach, it, vi, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import config from '../../config'

import { ApplicationProvider } from '../../../src/components'
import { useUploader } from '../../../src/hooks'
import { FileType } from '../../../src'
import { AccessPolicyType } from '@emd-cloud/sdk'

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

vi.mock('@emd-cloud/sdk', () => ({
  EmdCloud: vi.fn(function () {
    return mockSDK
  }),
  AppEnvironment: {
    Client: 'client',
    Server: 'server',
  },
  AuthType: {
    AuthToken: 'auth-token',
    ApiToken: 'api-token',
  },
  AccessPolicyType: {
    Public: 'public',
    OnlyAuthUser: 'onlyAuthUser',
    Private: 'private',
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

const setupSuccessfulUploadMock = () => {
  mockUploadFile.mockImplementation((file: File, options: unknown, callbacks: {
    onProgress: (progress: { percentage: number, bytesUploaded: number, bytesTotal: number }) => void
    onSuccess: (fileId: string, fileUrl: string) => void
    onError: (error: Error) => void
  }) => {
    const uploadId = `upload-${Date.now()}-${Math.random()}`

    setTimeout(() => {
      callbacks.onProgress({ percentage: 50, bytesUploaded: 500, bytesTotal: 1000 })
    }, 10)

    setTimeout(() => {
      callbacks.onSuccess('file-id-123', `https://example.com/${file.name}`)
    }, 20)

    return {
      uploadId,
      file: {
        abort: vi.fn(),
      },
    }
  })
}

const flushUploadCycle = async (ms = 400) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('Test useUploader', () => {
  const testFiles: File[] = []

  beforeAll(() => {
    testFiles.push(new File(['Text for test file!'], 'example.txt', { type: 'text/plain' }))
    testFiles.push(new File(['Text for test file!'], 'example2.txt', { type: 'text/plain' }))
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUploadFile.mockReset()
    setupSuccessfulUploadMock()
  })

  afterEach(async () => {
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    vi.useRealTimers()
  })

  it('Uploading file is started', async () => {
    const maxNumberOfFiles = 5
    const onUpdate = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
          onUpdate,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    const calls = onUpdate.mock.calls
    expect(calls.length).toBeGreaterThan(0)

    const files = calls[calls.length - 1][0] as FileType[]
    expect(files[0].fileName).toBe('example.txt')
    expect(['started', 'progress', 'success', 'failed']).toContain(files[0].status)
  })

  it('Prevalidation test before loading success', async () => {
    const maxNumberOfFiles = 5
    const onUpdate = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
          onUpdate,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    expect(onUpdate).toHaveBeenCalled()
  })

  it('Prevalidation test before loading failed', async () => {
    const maxNumberOfFiles = 1
    const onUpdate = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
          onUpdate,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('onSuccess callback fires once when all files succeed', async () => {
    const onSuccess = vi.fn()
    const onFailed = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onSuccess,
          onFailed,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onFailed).not.toHaveBeenCalled()

    const files = onSuccess.mock.calls[0][0] as FileType[]
    expect(files).toHaveLength(2)
    expect(files.every((f) => f.status === 'success')).toBe(true)
  })

  it('onFailed callback fires once when any file fails', async () => {
    const onSuccess = vi.fn()
    const onFailed = vi.fn()

    mockUploadFile
      .mockImplementationOnce((file: File, options: unknown, callbacks: {
        onProgress: (progress: { percentage: number, bytesUploaded: number, bytesTotal: number }) => void
        onSuccess: (fileId: string, fileUrl: string) => void
        onError: (error: Error) => void
      }) => {
        const uploadId = `upload-${Date.now()}-${Math.random()}`

        setTimeout(() => {
          callbacks.onProgress({ percentage: 50, bytesUploaded: 500, bytesTotal: 1000 })
        }, 10)

        setTimeout(() => {
          callbacks.onSuccess('file-id-123', `https://example.com/${file.name}`)
        }, 20)

        return {
          uploadId,
          file: {
            abort: vi.fn(),
          },
        }
      })
      .mockImplementationOnce((file: File, options: unknown, callbacks: {
        onProgress: (progress: { percentage: number, bytesUploaded: number, bytesTotal: number }) => void
        onSuccess: (fileId: string, fileUrl: string) => void
        onError: (error: Error) => void
      }) => {
        const uploadId = `upload-${Date.now()}-${Math.random()}`

        setTimeout(() => {
          callbacks.onError(new Error(`Upload failed for ${file.name}`))
        }, 15)

        return {
          uploadId,
          file: {
            abort: vi.fn(),
          },
        }
      })

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onSuccess,
          onFailed,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    expect(onFailed).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toHaveBeenCalled()

    const files = onFailed.mock.calls[0][0] as FileType[]
    expect(files).toHaveLength(2)
    expect(files.some((f) => f.status === 'failed')).toBe(true)
  })

  it('onUpdate stops firing after batch completes', async () => {
    const onUpdate = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onUpdate,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    const callCountAfterSuccess = onUpdate.mock.calls.length

    await flushUploadCycle(300)

    expect(onUpdate.mock.calls.length).toBe(callCountAfterSuccess)
  })

  it('onSuccess and onFailed are optional', async () => {
    const onUpdate = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onUpdate,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    expect(onUpdate).toHaveBeenCalled()
  })

  it('resetUploader clears all files and internal state', async () => {
    const onUpdate = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onUpdate,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    expect(onUpdate).toHaveBeenCalled()

    act(() => {
      result.current.resetUploader()
    })

    await flushUploadCycle(150)

    expect(result.current.isProcess).toBe(false)
  })

  it('resetUploader allows re-uploading same files', async () => {
    const onSuccess = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onSuccess,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })
    await flushUploadCycle()

    expect(onSuccess).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.resetUploader()
    })
    await flushUploadCycle(150)

    act(() => {
      result.current.uploadFiles(testFiles)
    })
    await flushUploadCycle()

    expect(onSuccess).toHaveBeenCalledTimes(2)
  })

  it('resetUploader resets batch tracking state', async () => {
    const onSuccess = vi.fn()
    const onFailed = vi.fn()

    const { result } = renderHook(
      () =>
        useUploader({
          headers: {
            Authorization: `token ${config.authToken}`,
          },
          onSuccess,
          onFailed,
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })
    await flushUploadCycle()

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onFailed).not.toHaveBeenCalled()

    act(() => {
      result.current.resetUploader()
    })
    await flushUploadCycle(150)

    act(() => {
      result.current.uploadFiles(testFiles)
    })
    await flushUploadCycle()

    expect(onSuccess).toHaveBeenCalledTimes(2)
    expect(onFailed).not.toHaveBeenCalled()
  })

  it('passes accessPolicy to SDK when provided (no readPermission)', async () => {
    const accessPolicy = { type: AccessPolicyType.Private, allowStaff: true }

    const { result } = renderHook(
      () =>
        useUploader({
          accessPolicy,
          onUpdate: vi.fn(),
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    const options = mockUploadFile.mock.calls[0][1]
    expect(options.accessPolicy).toEqual(accessPolicy)
    expect(options.readPermission).toBeUndefined()
  })

  it('uses readPermission as fallback when accessPolicy is absent', async () => {
    const { result } = renderHook(
      () =>
        useUploader({
          readPermission: 'public' as any,
          onUpdate: vi.fn(),
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    const options = mockUploadFile.mock.calls[0][1]
    expect(options.readPermission).toBe('public')
    expect(options.accessPolicy).toBeUndefined()
  })

  it('accessPolicy takes precedence when both are provided', async () => {
    const accessPolicy = { type: AccessPolicyType.OnlyAuthUser }

    const { result } = renderHook(
      () =>
        useUploader({
          readPermission: 'public' as any,
          accessPolicy,
          onUpdate: vi.fn(),
        }),
      { wrapper },
    )

    act(() => {
      result.current.uploadFiles(testFiles)
    })

    await flushUploadCycle()

    const options = mockUploadFile.mock.calls[0][1]
    expect(options.accessPolicy).toEqual(accessPolicy)
    expect(options.readPermission).toBeUndefined()
  })
})

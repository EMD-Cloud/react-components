import { describe, beforeEach, it, vi, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

import config from '../../config'

import { ApplicationProvider } from '../../../src/components'
import { useFileUtils } from '../../../src/hooks'

const mockGetFileUrl = vi.fn().mockReturnValue('https://api.emd.one/api/app/uploader/chunk/default/file/abc123')
const mockGetMetaUrl = vi.fn().mockReturnValue('https://api.emd.one/api/app/uploader/chunk/default/meta/abc123')
const mockIsEMDLink = vi.fn().mockReturnValue(true)
const mockFormatFileLink = vi.fn().mockReturnValue('https://api.emd.one/api/app/uploader/chunk/default/file/abc123?cd=inline')
const mockCreateFileAccessToken = vi.fn().mockResolvedValue('token-123')

const mockUploader = {
  uploadFile: vi.fn(),
  getFileUrl: mockGetFileUrl,
  getMetaUrl: mockGetMetaUrl,
  isEMDLink: mockIsEMDLink,
  formatFileLink: mockFormatFileLink,
  createFileAccessToken: mockCreateFileAccessToken,
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

describe('Test useFileUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getFileUrl delegates to SDK uploader', () => {
    const { result } = renderHook(() => useFileUtils(), { wrapper })

    const url = result.current.getFileUrl('default', 'abc123')

    expect(mockGetFileUrl).toHaveBeenCalledWith('default', 'abc123')
    expect(url).toBe('https://api.emd.one/api/app/uploader/chunk/default/file/abc123')
  })

  it('getMetaUrl delegates to SDK uploader', () => {
    const { result } = renderHook(() => useFileUtils(), { wrapper })

    const url = result.current.getMetaUrl('default', 'abc123')

    expect(mockGetMetaUrl).toHaveBeenCalledWith('default', 'abc123')
    expect(url).toBe('https://api.emd.one/api/app/uploader/chunk/default/meta/abc123')
  })

  it('isEMDLink delegates to SDK uploader', () => {
    const { result } = renderHook(() => useFileUtils(), { wrapper })

    const isLink = result.current.isEMDLink('https://api.emd.one/api/app/uploader/chunk/default/file/abc123')

    expect(mockIsEMDLink).toHaveBeenCalledWith('https://api.emd.one/api/app/uploader/chunk/default/file/abc123')
    expect(isLink).toBe(true)
  })

  it('formatFileLink delegates to SDK uploader', () => {
    const { result } = renderHook(() => useFileUtils(), { wrapper })

    const url = result.current.formatFileLink('https://api.emd.one/file/abc123', 'inline' as any, 'token-xyz')

    expect(mockFormatFileLink).toHaveBeenCalledWith('https://api.emd.one/file/abc123', 'inline', 'token-xyz')
    expect(url).toBe('https://api.emd.one/api/app/uploader/chunk/default/file/abc123?cd=inline')
  })

  it('createFileAccessToken delegates to SDK uploader', async () => {
    const { result } = renderHook(() => useFileUtils(), { wrapper })

    const token = await result.current.createFileAccessToken(30, { authType: 'api-token' as any })

    expect(mockCreateFileAccessToken).toHaveBeenCalledWith(30, { authType: 'api-token' })
    expect(token).toBe('token-123')
  })

  it('createFileAccessToken works without arguments', async () => {
    const { result } = renderHook(() => useFileUtils(), { wrapper })

    await result.current.createFileAccessToken()

    expect(mockCreateFileAccessToken).toHaveBeenCalledWith(undefined, undefined)
  })
})

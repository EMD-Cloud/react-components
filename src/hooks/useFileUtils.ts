// ** React Imports
import { useContext, useMemo, useCallback } from 'react'

// ** Source code Imports
import { ApplicationContext } from 'src/components/ApplicationProvider/context'

// ** Types
import type { ContentDisposition, CallOptions } from '@emd-cloud/sdk'

export interface UseFileUtilsReturn {
  /**
   * Constructs the URL to access an uploaded file.
   *
   * @param integration - The integration ID used during upload.
   * @param fileId - The file identifier (base64url encoded).
   * @returns The complete URL to access the file.
   */
  getFileUrl: (integration: string, fileId: string) => string

  /**
   * Constructs the URL to access file metadata.
   *
   * @param integration - The integration ID used during upload.
   * @param fileId - The file identifier (base64url encoded).
   * @returns The complete URL to access file metadata.
   */
  getMetaUrl: (integration: string, fileId: string) => string

  /**
   * Checks whether a URL points to an EMD Cloud uploaded file.
   *
   * @param url - The URL to check.
   * @returns True if the URL is an EMD Cloud file link.
   */
  isEMDLink: (url: string) => boolean

  /**
   * Formats an EMD Cloud file URL with optional access token and content disposition.
   *
   * @param url - The file URL to format.
   * @param contentDisposition - How the browser should handle the file.
   * @param token - File access token for protected files.
   * @returns The formatted URL with query parameters.
   */
  formatFileLink: (url: string, contentDisposition?: ContentDisposition, token?: string) => string

  /**
   * Creates a short-lived file access token for accessing protected files.
   *
   * @param ttlMinutes - Token time-to-live in minutes.
   * @param callOptions - Optional authentication override.
   * @returns A promise resolving to the file access token.
   */
  createFileAccessToken: (ttlMinutes?: number, callOptions?: CallOptions) => Promise<string | number>
}

const useFileUtils = (): UseFileUtilsReturn => {
  const appData = useContext(ApplicationContext)

  const sdkUploader = useMemo(() => {
    if (!appData.sdkInstance) {
      return null
    }
    return appData.sdkInstance.uploader
  }, [appData.sdkInstance])

  const ensureUploader = useCallback(() => {
    if (!sdkUploader) {
      throw new Error(
        'SDK uploader is not initialized. Make sure @emd-cloud/sdk is installed as a peer dependency and ApplicationProvider is properly configured.',
      )
    }
    return sdkUploader
  }, [sdkUploader])

  const getFileUrl = useCallback(
    (integration: string, fileId: string): string => {
      return ensureUploader().getFileUrl(integration, fileId)
    },
    [ensureUploader],
  )

  const getMetaUrl = useCallback(
    (integration: string, fileId: string): string => {
      return ensureUploader().getMetaUrl(integration, fileId)
    },
    [ensureUploader],
  )

  const isEMDLink = useCallback(
    (url: string): boolean => {
      return ensureUploader().isEMDLink(url)
    },
    [ensureUploader],
  )

  const formatFileLink = useCallback(
    (url: string, contentDisposition?: ContentDisposition, token?: string): string => {
      return ensureUploader().formatFileLink(url, contentDisposition, token)
    },
    [ensureUploader],
  )

  const createFileAccessToken = useCallback(
    (ttlMinutes?: number, callOptions?: CallOptions): Promise<string | number> => {
      return ensureUploader().createFileAccessToken(ttlMinutes, callOptions)
    },
    [ensureUploader],
  )

  return {
    getFileUrl,
    getMetaUrl,
    isEMDLink,
    formatFileLink,
    createFileAccessToken,
  }
}

export default useFileUtils

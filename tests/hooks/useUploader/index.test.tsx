// component.test.ts
import { describe, beforeAll, it, vi, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

import config from '../../config'

import { useUploader } from '../../../src/hooks'
import { FileType } from '../../../src/hooks/useUploader'

describe('Test useUploader', () => {
  const testFiles: File[] = []

  beforeAll(() => {
    testFiles.push(new File(['Text for test file!'], 'example.txt', { type: 'text/plain' }))
    testFiles.push(new File(['Text for test file!'], 'example2.txt', { type: 'text/plain' }))
  })

  it('Uploading file is started', async () => {
    const maxNumberOfFiles = 5
 
    const files: FileType[] = await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        options: {
          apiUrl: config.apiUrl,
          app: config.app,
        },
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
        onUpdate: (files) => {
          if (!files.length) return
  
          res(files)
        }
      }))
  
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
        options: {
          apiUrl: config.apiUrl,
          app: config.app,
        },
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
        onUpdate
      }))

      uploadFiles(testFiles)

      setTimeout(res, 5000)
    })

    expect(onUpdate).toHaveBeenCalled()
  })

  it('Prevalidation test before loading failed', async () => {
    const maxNumberOfFiles = 1
    const onUpdate = vi.fn()

    await new Promise((res) => {
      const { result: { current: { uploadFiles } } } = renderHook(() => useUploader({
        options: {
          apiUrl: config.apiUrl,
          app: config.app,
        },
        headers: {
          Authorization: `token ${config.authToken}`
        },
        onBeforeUpload: (files) => !(maxNumberOfFiles < files.length),
        onUpdate
      }))

      uploadFiles(testFiles)

      setTimeout(res, 5000)
    })

    expect(onUpdate).not.toHaveBeenCalled()
  })
}, 30000)

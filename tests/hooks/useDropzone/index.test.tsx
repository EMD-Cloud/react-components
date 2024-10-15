// component.test.ts
import React from 'react'
import { describe, beforeEach, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import App from './App'

describe('Test useDropzone', () => {
  let testFile: File

  beforeEach(() => {
    testFile = new File(['(⌐□_□)'], 'example.png', { type: 'image/png' })
  })

  it('Get file to uploading', async () => {
    render(<App multiple accept={{ '*': [] }} />)

    const uploader = screen.getByTestId('add-file')

    await waitFor(() =>
      fireEvent.change(uploader, {
        target: { files: [testFile] },
      }),
    )

    const files = screen.getByTestId<HTMLInputElement>('add-file').files

    expect(files?.length).toBe(1)
    expect(files?.[0] instanceof File).toBe(true)
    expect(files?.[0].name).toBe('example.png')
    expect(files?.[0].type).toBe('image/png')
  })
}, 30000)
const isDefined = (value: Record<string, string[]>) => {
  return value !== undefined && value !== null
}

export const isMIMEType = (v: string) => {
  return (
    v === 'audio/*' ||
    v === 'video/*' ||
    v === 'image/*' ||
    v === 'text/*' ||
    /\w+\/[-+.\w]+/g.test(v)
  )
}

export const isExt = (v: string) => {
  return /^.*\.[\w]+$/.test(v)
}

export const acceptPropAsAcceptAttr = (accept: Record<string, string[]>) => {
  if (isDefined(accept)) {
    return Object.entries(accept)
      .reduce((a: string[], [mimeType, ext]) => [...a, mimeType, ...ext], [])
      .filter((v) => isMIMEType(v) || isExt(v))
      .join(',')
  }

  return undefined
}

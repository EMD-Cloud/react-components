export interface ApplicationDataType {
  apiUrl: string
  app: string
  tokenType: string
  token?: string
}

interface ApplicationPayloadType {
  apiUrl?: string
  app?: string
  tokenType?: string
  token?: string
}

export interface ApplicationctionType {
  type: string
  payload: ApplicationPayloadType
}

const reducer = (
  state: ApplicationDataType,
  { type, payload }: ApplicationctionType,
) => {
  if (type === 'login') {
    return { ...state, ...payload }
  }

  throw Error('Unknown action.')
}

export default reducer

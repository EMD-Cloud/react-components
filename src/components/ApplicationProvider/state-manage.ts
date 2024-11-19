export interface UserType {
  _id: string
  space: string
  login: string
  accountVerified: boolean
  accountStatus: 'pending' | 'approved' | 'rejected'
  external: boolean
  firstName: string
  lastName: string
  patronymicName: string
  avatarUrl: string
  level: number
  points: number
  quotaFreeSpaces: number
  passwordRecoveryRequest: string | null
  ping: string | null
  linkedAccounts: Record<string, any>
  customFields: Record<string, any>
  lastActivityInMinutes: null | number
  pingStatus: 'online' | 'offline'
  token: string
}

export interface ApplicationDataType {
  apiUrl: string
  app: string
  tokenType: string
  user: UserType | null
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

  if (type === 'registration') {
    return { ...state, ...payload }
  }

  throw Error('Unknown action.')
}

export default reducer

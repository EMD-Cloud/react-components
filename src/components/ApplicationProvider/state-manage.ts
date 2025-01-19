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
  app: string
  tokenType?: string
  user?: UserType | null
  apiUrl?: string
}

export enum ACTION {
  SET_USER = 1,
  SET_APP = 2,
}

export interface ApplicationctionType {
  type: ACTION
  payload: any
}

const reducer = (
  state: ApplicationDataType,
  { type, payload }: ApplicationctionType,
) => {
  if (type === ACTION.SET_USER) {
    return { ...state, user: payload }
  }

  throw Error('Unknown action.')
}

export default reducer

// Import types from SDK instead of duplicating
import type { EmdCloud, UserData, AppOptionsType } from '@emd-cloud/sdk'

export type UserType = UserData

export interface ApplicationDataType {
  app: string
  tokenType?: string
  user?: UserType | null
  apiUrl?: string
  websocketUrl?: string
  sdkInstance?: EmdCloud | null
  authInited?: boolean
}

export enum ACTION {
  SET_USER = 1,
  SET_APP = 2,
  SET_SDK_INSTANCE = 3,
  AUTH_INITED = 4,
}

export interface ApplicationActionType {
  type: ACTION
  payload: any
}

const reducer = (
  state: ApplicationDataType,
  { type, payload }: ApplicationActionType,
) => {
  if (type === ACTION.SET_USER) {
    return { ...state, user: payload }
  }

  if (type === ACTION.SET_SDK_INSTANCE) {
    return { ...state, sdkInstance: payload }
  }

  if (type === ACTION.AUTH_INITED) {
    return { ...state, authInited: payload }
  }

  throw Error('Unknown action.')
}

export default reducer

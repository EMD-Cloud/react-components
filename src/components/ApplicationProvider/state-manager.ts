// Import types from SDK instead of duplicating
import type { UserData } from '@emd-cloud/sdk'

export type UserType = UserData

export interface ApplicationDataType {
  app: string
  tokenType?: string
  user?: UserType | null
  apiUrl?: string
  sdkInstance?: any | null
}

export enum ACTION {
  SET_USER = 1,
  SET_APP = 2,
  SET_SDK_INSTANCE = 3,
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

  throw Error('Unknown action.')
}

export default reducer

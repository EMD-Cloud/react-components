// ** React Importsi
import { useContext, useMemo } from 'react'

// ** Source code Imports
import {
  ApplicationContext,
  DispatchContext,
} from '../components/ApplicationProvider/context'
import {
  ACTION,
  UserType,
} from '../components/ApplicationProvider/state-manage'

// ** Types
export type LogInUserType = {
  login: string
  password: string
}

export type SignUpUserType = {
  login: string
  password: string
}

const useAuth = () => {
  const appData = useContext(ApplicationContext)
  const dispatch = useContext(DispatchContext)

  const authorization = (
    token: UserType['token'],
  ): Promise<UserType | Error> => {
    return new Promise((resolve, reject) => {
      fetch(`${appData.apiUrl}/api/${appData.app}/auth/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${appData.tokenType} ${token}`,
        },
        body: JSON.stringify({}),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }

          return response.json()
        })
        .then((response) => {
          const { data } = response

          dispatch({
            type: ACTION.SET_USER,
            payload: data,
          })

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const logInUser = (params: LogInUserType): Promise<UserType | Error> => {
    return new Promise((resolve, reject) => {
      fetch(`${appData.apiUrl}/api/${appData.app}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }

          return response.json()
        })
        .then((response) => {
          const { data } = response

          dispatch({
            type: ACTION.SET_USER,
            payload: data,
          })

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const signUpUser = (params: SignUpUserType): Promise<UserType | Error> => {
    return new Promise((resolve, reject) => {
      fetch(`${appData.apiUrl}/api/${appData.app}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }

          return response.json()
        })
        .then((response) => {
          const { data } = response

          dispatch({
            type: ACTION.SET_USER,
            payload: data,
          })

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const userInfo = useMemo(() => {
    return appData.user
  }, [appData.user])

  return { authorization, logInUser, signUpUser, userInfo }
}

export default useAuth

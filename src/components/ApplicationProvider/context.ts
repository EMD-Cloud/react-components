// ** React Imports
import { createContext } from 'react'

// ** Source code Imports
import { ApplicationDataType } from './state-manage'

const ApplicationContext = createContext<ApplicationDataType>({
  apiUrl: '',
  app: '',
  tokenType: '',
  user: null,
  dispatch: () => {},
})

export default ApplicationContext

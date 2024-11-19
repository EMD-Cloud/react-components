// ** React Imports
import { createContext } from 'react';
const ApplicationContext = createContext({
    apiUrl: '',
    app: '',
    tokenType: '',
    user: null
});
export default ApplicationContext;

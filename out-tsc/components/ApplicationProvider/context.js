// ** React Imports
import { createContext } from 'react';
const ApplicationContext = createContext({
    apiUrl: '',
    app: '',
    tokenType: ''
});
export default ApplicationContext;

// ** React Imports
import { createContext } from 'react';
export const ApplicationContext = createContext({
    apiUrl: '',
    app: '',
    tokenType: '',
    user: null,
});
export const DispatchContext = createContext(() => { });

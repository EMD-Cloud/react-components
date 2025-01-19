// ** React Imports
import * as React from 'react';
// ** Source code Imports
import { ApplicationContext, DispatchContext } from './context';
import reducer from './state-manage';
const ApplicationProvider = ({ app, apiUrl = 'https://api.emd.one', tokenType = 'token', children, }) => {
    const [value, dispatch] = React.useReducer(reducer, {
        apiUrl,
        app,
        tokenType,
        user: null,
    });
    return (React.createElement(ApplicationContext.Provider, { value: value },
        React.createElement(DispatchContext.Provider, { value: dispatch }, children)));
};
export default ApplicationProvider;

// ** React Imports
import * as React from 'react';
// ** Source code Imports
import ApplicationContext from './context';
import reducer from './state-manage';
const ApplicationProvider = ({ apiUrl = 'api.emd.one', app, tokenType = 'token', children, }) => {
    const [value] = React.useReducer(reducer, {
        apiUrl,
        app,
        tokenType,
    });
    return (React.createElement(ApplicationContext.Provider, { value: value }, children));
};
export default ApplicationProvider;

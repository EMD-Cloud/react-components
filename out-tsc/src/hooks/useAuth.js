// ** React Importsi
import { useContext, useMemo } from 'react';
// ** Source code Imports
import { ApplicationContext, DispatchContext, } from '../components/ApplicationProvider/context';
import { ACTION, } from '../components/ApplicationProvider/state-manage';
const useAuth = () => {
    const appData = useContext(ApplicationContext);
    const dispatch = useContext(DispatchContext);
    const authorization = (token) => {
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
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then((response) => {
                const { data } = response;
                dispatch({
                    type: ACTION.SET_USER,
                    payload: data,
                });
                resolve(data);
            })
                .catch((error) => {
                reject(error);
            });
        });
    };
    const logInUser = (params) => {
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
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then((response) => {
                const { data } = response;
                dispatch({
                    type: ACTION.SET_USER,
                    payload: data,
                });
                resolve(data);
            })
                .catch((error) => {
                reject(error);
            });
        });
    };
    const signUpUser = (params) => {
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
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then((response) => {
                const { data } = response;
                dispatch({
                    type: ACTION.SET_USER,
                    payload: data,
                });
                resolve(data);
            })
                .catch((error) => {
                reject(error);
            });
        });
    };
    const logOutUser = () => {
        dispatch({
            type: ACTION.SET_USER,
            payload: null,
        });
    };
    const userInfo = useMemo(() => {
        return appData.user;
    }, [appData.user]);
    return { authorization, logInUser, logOutUser, signUpUser, userInfo };
};
export default useAuth;

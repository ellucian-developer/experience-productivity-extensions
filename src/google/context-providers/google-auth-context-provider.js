import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useCardInfo } from '@ellucian/experience-extension-hooks';

import { Context } from '../../context-hooks/auth-context-hooks';

function loadGapiScript() {
    return new Promise(resolve => {
        const element = document.getElementsByTagName('script')[0];
        const js = document.createElement('script');
        js.id = 'google-platform';
        js.src = '//apis.google.com/js/platform.js';
        js.async = true;
        js.defer = true;
        element.parentNode.insertBefore(js, element);
        js.onload = () => {
            resolve(window.gapi);
        }
    });
}

function loadGapi(clientId, setApiState, setLoggedIn, setError) {
    const { gapi } = window;
    gapi.load('client:auth2', async () => {
        const discoveryDocs = [
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            'https://gmail.googleapis.com/$discovery/rest?version=v1'
        ];
        const scope = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly';

        try {
            await gapi.client.init({
                clientId: clientId,
                discoveryDocs,
                scope
            });

            gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => setLoggedIn(isSignedIn));

            // Handle the initial sign-in state.
            const signedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

            unstable_batchedUpdates(() => {
                setLoggedIn(signedIn);
                setApiState('ready');
            });
        } catch (error) {
            if (setError) {
                setError(error);
            }
            console.error('gapi failed', error);
        }
    });
}

export function AuthProvider({ children }) {
    const { configuration: { googleOAuthClientId } } = useCardInfo();

    const [email, setEmail] = useState();
    const [error, setError] = useState(false);
    // eslint-disable-next-line no-empty-function
    // const [login, setLogin] = useState(() => {});
    const [loggedIn, setLoggedIn] = useState();
    const [state, setState] = useState('initializing');

    const [apiState, setApiState] = useState('init');

    function login(scope) {
        const { gapi } = window;
        if (gapi) {
            // gapi.auth2.getAuthInstance().signIn();
            const options = {
                prompt: 'select_account',
                'ux_mode': 'popup'
            };
            if (typeof scope === 'string') {
                options.scope = scope;
            }
            gapi.auth2.getAuthInstance().signIn(options);
        }
    }

    function logout() {
        const { gapi } = window;
        if (gapi) {
            gapi.auth2.getAuthInstance().signOut();
        }
    }

    const contextValue = useMemo(() => {
        return {
            email,
            error,
            login,
            logout,
            loggedIn,
            setLoggedIn,
            state
        }
    }, [email, error, loggedIn, login, state]);

    useEffect(() => {
        if (apiState === 'init') {
            const { gapi } = window;

            if (!gapi) {
                ( async() => {
                    setApiState('script-loading');
                    await loadGapiScript();
                    setApiState('script-loaded');
                })();
            } else {
                setApiState('script-loaded');
            }
        } else if (apiState === 'script-loaded') {
            loadGapi(googleOAuthClientId, setApiState, setLoggedIn, setError);
        }
    }, [apiState, setApiState, setLoggedIn, setError]);

    useEffect(() => {
        if (apiState === 'ready') {
            setState('ready');
        }
    }, [apiState, setState]);

    useEffect(() => {
        if (loggedIn) {
            const { gapi } = window;
            const user = gapi.auth2.getAuthInstance().currentUser.get();
            const email = user.getBasicProfile().getEmail();
            setEmail(email);
        }
    }, [loggedIn]);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('AuthProvider mounted');

            return () => {
                console.log('AuthProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.object.isRequired
}
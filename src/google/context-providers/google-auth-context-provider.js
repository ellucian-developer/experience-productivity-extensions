import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useCache, useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';

const cacheScope = 'google-productivity';
const lastUserIdCacheKey = 'last-user-id';
const cacheOptions = {
    scope: cacheScope,
    key: lastUserIdCacheKey
}

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

function loadGapi(clientId, setApiState, setLoggedIn, setError, cacheGetItem) {
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

            const googleAuth = gapi.auth2.getAuthInstance();

            googleAuth.isSignedIn.listen(isSignedIn => setLoggedIn(isSignedIn));

            // Handle the initial sign-in state.
            const signedIn = googleAuth.isSignedIn.get();

            if (signedIn) {
                // if user is signed in,
                // verify that the same user was stored in in cache
                // if not do a logout
                const {data: lastUserId} = cacheGetItem(cacheOptions);

                const googleUserId = googleAuth.currentUser.get().getId();

                if (lastUserId !== googleUserId) {
                    unstable_batchedUpdates(() => {
                        setLoggedIn(false);
                        setApiState('do-logout');
                    });
                } else {
                    unstable_batchedUpdates(() => {
                        setLoggedIn(signedIn);
                        setApiState('ready');
                    });
                }
            } else {
                unstable_batchedUpdates(() => {
                    setLoggedIn(signedIn);
                    setApiState('ready');
                });
            }
        } catch (error) {
            if (setError) {
                setError(error);
            }
            console.error('gapi failed', error);
        }
    });
}

export function AuthProvider({ children }) {
    const { getItem: cacheGetItem, storeItem: cacheStoreItem } = useCache();
    const { configuration: { googleOAuthClientId } } = useCardInfo();

    const [email, setEmail] = useState();
    const [error, setError] = useState(false);
    const [loggedIn, setLoggedIn] = useState();
    const [state, setState] = useState('initializing');

    const [apiState, setApiState] = useState('init');

    function login(scope) {
        const { gapi } = window;
        if (gapi) {
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
            loadGapi(googleOAuthClientId, setApiState, setLoggedIn, setError, cacheGetItem);
        }
    }, [apiState, setLoggedIn, setError]);

    useEffect(() => {
        if (apiState === 'ready') {
            setState('ready');
        } else if (apiState === 'do-logout') {
            logout();
            setApiState('ready');
        }
    }, [apiState]);

    useEffect(() => {
        if (loggedIn) {
            const { gapi } = window;
            const user = gapi.auth2.getAuthInstance().currentUser.get();
            const email = user.getBasicProfile().getEmail();
            setEmail(email);

            // store user in cache to detect user changes
            const googleUserId = gapi.auth2.getAuthInstance().currentUser.get().getId();
            cacheStoreItem({...cacheOptions, data: googleUserId})
        }
    }, [loggedIn]);

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
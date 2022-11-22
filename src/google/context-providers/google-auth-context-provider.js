/* eslint-disable camelcase */
// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useCache, useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';

import log from 'loglevel';
const logger = log.getLogger('Google');

let tokenClient;
const cacheScope = 'google-productivity';
const lastUserIdCacheKey = 'last-user-token';
const cacheOptions = {
    scope: cacheScope,
    key: lastUserIdCacheKey
}

function loadScript({ src, identifier }) {
    return new Promise(resolve => {
        const element = document.getElementsByTagName('script')[0];
        const js = document.createElement('script');
        js.id = identifier;
        js.src = src;
        js.async = true;
        js.defer = true;
        element.parentNode.insertBefore(js, element);
        js.onload = () => {
            resolve(window[identifier]);
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

    function loadGapi(clientId) {
        const { gapi, google } = window;
        const { data  = {}} = cacheGetItem(cacheOptions);

        const discoveryDocs = [
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            'https://gmail.googleapis.com/$discovery/rest?version=v1'
        ];

        const scope = 'email https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly';
        try {
            if (gapi && typeof gapi.load === 'function') {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        discoveryDocs
                    });

                    if (Object.keys(data).length) {
                        authenticateUser(data.authUser, data.accessToken);
                    } else {
                        prepareForLogin();
                    }
                });

                tokenClient = google.accounts.oauth2.initTokenClient({
                    // eslint-disable-next-line camelcase
                    client_id: clientId,
                    scope,
                    callback: (tokenResponse) => {
                        console.log(tokenResponse);
                        if (tokenResponse && tokenResponse.access_token) {
                            authenticateUser(
                                tokenResponse.authuser,
                                tokenResponse.access_token,
                                true
                            );
                        }
                    }
                });
            }
        } catch (error) {
            setError(error);
            logger.error('gapi failed', error);
        }
    }

    function login() {
        const { gapi } = window;
        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({ prompt: '' });
        }
    }

    function authenticateUser(
        authUser,
        accessToken,
        updateCache = false
    ) {
        setEmail(authUser);
        setLoggedIn(true);
        setApiState('ready');

        if (updateCache) {
            cacheStoreItem({
                ...cacheOptions,
                data: {
                    authUser,
                    accessToken
                }
            });
        } else {

            /**
             * If updateCache was false, then it probably means page has
             * been refreshed by user and we need to fetch data
             * automatically with user token we have.
             */
            const { gapi } = window;
            gapi.client.setToken({
                access_token: accessToken
            });
        }
    }

    function prepareForLogin() {
        const { gapi, google } = window;
        const { data = {} } = cacheGetItem(cacheOptions);
        if (Object.keys(data).length) {
            const { accessToken } = data;
            google.accounts.oauth2.revoke(accessToken);
            cacheStoreItem({ ...cacheOptions, data: {} });
        }

        setLoggedIn(false);
        setEmail('');
        setApiState('ready');
        gapi.client.setToken('');
    }

    function logout() {
        prepareForLogin();
    }

    useEffect(() => {
        const { google, gapi } = window;
        if (apiState === 'init') {
            if (!google && !gapi) {
                ( async() => {
                    setApiState('script-loading');

                    await Promise.all([
                        loadScript({
                            src: '//accounts.google.com/gsi/client',
                            identifier: 'google'
                        }),
                        loadScript({
                            src: '//apis.google.com/js/api.js',
                            identifier: 'gapi'
                        })
                    ]);

                    setApiState('script-loaded');
                })();
            } else {
                setApiState('script-loaded');
            }
        } else if (apiState === 'script-loaded' && gapi) {
            loadGapi(googleOAuthClientId);
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
        logger.debug('GoogleAuthProvider mounted');

        return () => {
            logger.debug('GoogleAuthProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.object.isRequired
}
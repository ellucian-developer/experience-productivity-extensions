// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../../context-hooks/auth-context-hooks';
import { subscribe, unsubscribe, dispatch } from '../util/events';
import { useCache, useCardInfo } from '@ellucian/experience-extension-hooks';
import { getTokenClient, initialize } from '../util/google-scripts';

import log from 'loglevel';
const logger = log.getLogger('Google');

const cacheScope = 'google-productivity';
const lastUserIdCacheKey = 'last-user-token';
const cacheOptions = {
    scope: cacheScope,
    key: lastUserIdCacheKey
}

export function AuthProvider({ children, id = 'default'}) {
    const { configuration: { googleOAuthClientId } } = useCardInfo();
    const { getItem: cacheGetItem, storeItem: cacheStoreItem } = useCache();

    const [user, setUser] = useState({});
    const [cachedUser, setCachedUser] = useState({});
    const [error, setError] = useState(false);
    const [loggedIn, setLoggedIn] = useState();

    const [state, setState] = useState('init');

    function login() {
        const { gapi } = window;
        const tokenClient = getTokenClient();

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient?.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient?.requestAccessToken({ prompt: '' });
        }
    }

    function logout() {
        dispatch('google-event', { reason: 'user-logout' });
    }

    /**
     *
     * Updates the user state with the authenticated Google API response
     *
     * @param {*} authUser    The user login id
     * @param {*} accessToken The access token
     * @param {*} expiresIn Seconds until the token expires
     * @param {*} updateCache Whether to update the cache
     *
     * @returns {void}
     */
    function authenticateUser(
        authUser,
        accessToken,
        expiresIn,
        updateCache = false
    ) {
        setLoggedIn(true);
        setUser({ authUser });

        if (updateCache) {
            cacheStoreItem({
                ...cacheOptions,
                data: {
                    authUser,
                    accessToken,
                    expiresIn
                }
            });
        }

        const { gapi } = window;
        gapi?.client?.setToken({
            'access_token': accessToken
        });
    }

    /**
     * Basically this function logs out the user from
     * the google account and clears the cache.
     *
     * @returns {void}
     */
    function prepareForLogin() {
        const { gapi, google } = window;
        const { data = {} } = cacheGetItem(cacheOptions);
        if (Object.keys(data).length) {
            const { accessToken } = data;
            google?.accounts?.oauth2?.revoke(accessToken);
            cacheStoreItem({ ...cacheOptions, data: {} });
        }

        setLoggedIn(false);
        setUser({});
        gapi?.client?.setToken('');
    }

    useEffect(() => {
        const { data: cachedUser } = cacheGetItem(cacheOptions);
        setCachedUser(cachedUser);

        subscribe('google-event', event => {
            const { detail: data } = event;
            const { reason } = data;
            logger.debug(`AuthProvider ${id} notification receieved reason: ${reason}`);
            if (reason === 'ready') {
                setState('ready');
            } else if (reason === 'user-authenticated') {
                const { accessToken, authUser, expiresIn } = data;
                authenticateUser( authUser, accessToken, expiresIn, true);
            } else if (reason === 'user-logout') {
                prepareForLogin();
            } else if (reason === 'error') {
                setError(true);
            }
        });

        return () => {
            unsubscribe('google-event');
        }
    }, []);

    useEffect(() => {
        const { google, gapi } = window;
        logger.debug(`AuthProvider ${id}, apiState: ${state}, google: ${google}, gapi: ${gapi}`);

        const now = new Date();
        if (state === 'init') {
            setState(initialize({ clientId: googleOAuthClientId, providerId: id }));
        } else if (state === 'ready') {
            logger.debug(`AuthProvider ${id} state: ready`);
            if (cachedUser && cachedUser.authUser && cachedUser.expiresIn > now.getTime()) {
                authenticateUser(cachedUser.authUser, cachedUser.accessToken, cachedUser.expiresIn);
            } else {
                prepareForLogin();
            }
        }
    }, [state, cachedUser]);

    const contextValue = useMemo(() => {
        const newContext = {
            user,
            error,
            login,
            logout,
            loggedIn,
            setLoggedIn,
            state: state === 'ready' ? 'ready' : 'initializing'
        }
        logger.debug(`AuthProvider ${id} context: ${JSON.stringify(newContext, null, 2)}`);
        return newContext;
    }, [state, error, loggedIn, login, user]);

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
    children: PropTypes.object.isRequired,
    id: PropTypes.string
}
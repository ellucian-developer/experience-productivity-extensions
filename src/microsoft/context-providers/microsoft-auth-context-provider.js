// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useCache, useCardInfo } from '@ellucian/experience-extension-utils';
import { Context } from '../../context-hooks/auth-context-hooks';

import { acquireToken, initializeAuthEvents, initializeMicrosoft, initializeGraphClient, login, logout } from '../util/auth';

import log from 'loglevel';
import { invokeNativeFunction, isInNativeApp, setInvokable } from '../../util/mobileAppUtils';
import { Client } from '@microsoft/microsoft-graph-client';
const logger = log.getLogger('Microsoft');

export function MicrosoftAuthProvider({ children }) {
    const { getItem: cacheGetItem, storeItem: cacheStoreItem } = useCache();
    const {
        configuration: {
            aadRedirectUrl,
            aadClientId,
            aadTenantId
        }
    } = useCardInfo();

    const [msalClient, setMsalClient] = useState();
    const [graphClient, setGraphClient] = useState();
    const [error, setError] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [state, setState] = useState('initialize');

    useEffect(() => {
        function mobileLogin(accessToken) {
            const options = {
                authProvider: {
                    getAccessToken: () => (accessToken)
                }
            }
            const graphClient = Client.initWithMiddleware(options);
            if (graphClient) {
                setGraphClient(() => graphClient);
                setLoggedIn(true);
                setState('ready');
            }
        }
        setInvokable('mobileLogin', mobileLogin);
    }, [])

    useEffect(() => {
        invokeNativeFunction('acquireMobileToken', Math.random(), false)
    }, [])

    useEffect(() => {
        function mobileLogOut() {
            setState('event-logout')
        }
        setInvokable('mobileLogout', mobileLogOut);
    }, [])
    // eslint-disable-next-line complexity
    useEffect(() => {
        switch (state) {
            case 'initialize':
                if (aadClientId && aadRedirectUrl && aadTenantId && !msalClient) {
                    const msalClient = initializeMicrosoft({ aadClientId, aadRedirectUrl, aadTenantId, setMsalClient });
                    setMsalClient(() => msalClient);
                    initializeAuthEvents({ setState });

                    // check if already logged in
                    (async () => {
                        if (await acquireToken({ aadClientId, aadTenantId, cacheGetItem, cacheStoreItem, msalClient, trySsoSilent: true })) {
                            setState('do-graph-initialize');
                        } else {
                            setState('ready');
                        }
                    })();
                }
                break;
            case 'do-login':
                if (aadClientId && aadRedirectUrl && aadTenantId && cacheGetItem && cacheStoreItem && msalClient) {
                    (async () => {
                        if (await login({ aadClientId, aadRedirectUrl, aadTenantId, cacheGetItem, cacheStoreItem, msalClient })) {
                            setState('do-graph-initialize');
                        } else {
                            // user likely bailed
                            setState('ready');
                        }
                    })();
                }
                break;
            case 'do-logout':
                if (aadClientId && aadRedirectUrl && aadTenantId && msalClient) {
                    (async () => {
                        await logout({ aadClientId, aadRedirectUrl, aadTenantId, msalClient });
                        setLoggedIn(false);
                        setState('ready');
                    })();
                }
                break;
            case 'do-graph-initialize':
                if (!isInNativeApp()) {
                    if (aadClientId && aadRedirectUrl && aadTenantId && msalClient) {
                        const graphClient = initializeGraphClient({ aadClientId, aadTenantId, msalClient, setError });
                        if (graphClient) {
                            setGraphClient(() => graphClient);
                            setLoggedIn(true);
                            setState('ready');
                        }
                    }
                }
                break;
            case 'event-login':
                setState('do-graph-initialize');
                break;
            case 'event-logout':
                setLoggedIn(false);
                setState('ready');
                break;
            default:
        }
    }, [aadClientId, aadRedirectUrl, aadTenantId, cacheGetItem, cacheStoreItem, msalClient, state]);

    const contextValue = useMemo(() => {
        return {
            client: graphClient,
            error,
            login: () => { setState('do-login') },
            logout: () => { setState('do-logout') },
            loggedIn,
            setLoggedIn,
            state: state === 'ready' || state === 'do-logout' ? 'ready' : 'not-ready'
        }
    }, [graphClient, error, loggedIn, login, state]);

    useEffect(() => {
        logger.debug('MicrosoftAuthProvider mounted');
        return () => {
            logger.debug('MicrosoftAuthProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MicrosoftAuthProvider.propTypes = {
    children: PropTypes.object.isRequired
}

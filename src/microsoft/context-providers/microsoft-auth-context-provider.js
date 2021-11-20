import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useCache, useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';

import { acquireToken, initializeAuthEvents, initializeMicrosoft, initializeGraphClient, login, logout } from '../../util/auth';

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

	// eslint-disable-next-line complexity
	useEffect(() => {
        switch( state ) {
            case 'initialize':
                if (aadClientId && aadRedirectUrl && aadTenantId && !msalClient ) {
                    const msalClient = initializeMicrosoft({aadClientId, aadRedirectUrl, aadTenantId, setMsalClient});
                    setMsalClient(() => msalClient);
                    initializeAuthEvents({setState});

                    // check if already logged in
                    (async () => {
                        if (await acquireToken({aadClientId, aadTenantId, cacheGetItem, cacheStoreItem, msalClient, trySsoSilent: true})) {
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
                        if (await login({aadClientId, aadRedirectUrl, aadTenantId, cacheGetItem, cacheStoreItem, msalClient})) {
                            setState('do-graph-initialize');
                        }
                    })();
                }
                break;
            case 'do-logout':
                if (aadClientId && aadRedirectUrl && aadTenantId && msalClient) {
                    (async () => {
                        await logout({aadClientId, aadRedirectUrl, aadTenantId, msalClient});
                        setLoggedIn(false);
                        setState('ready');
                    })();
                }
                break;
            case 'do-graph-initialize':
                if (aadClientId && aadRedirectUrl && aadTenantId && msalClient) {
                    const graphClient = initializeGraphClient({aadClientId, aadTenantId, msalClient, setError});
                    if (graphClient) {
                        setGraphClient(() => graphClient);
                        setLoggedIn(true);
                        setState('ready');
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
	}, [ aadClientId, aadRedirectUrl, aadTenantId, cacheGetItem, cacheStoreItem, msalClient, state ]);

	const contextValue = useMemo(() => {
		return {
			client: graphClient,
			error,
			login: () => { setState('do-login')},
			logout: () => { setState('do-logout')},
			loggedIn,
			setLoggedIn,
			state: state === 'ready' ? 'ready' : 'not-ready'
		}
	}, [graphClient, error, loggedIn, login, state]);

	if (process.env.NODE_ENV === 'development') {
		useEffect(() => {
			console.log('MicrosoftAuthProvider mounted');
			return () => {
				console.log('MicrosoftAuthProvider unmounted');
			}
		}, []);
	}

	return (
		<Context.Provider value={contextValue}>
			{children}
		</Context.Provider>
	)
}

MicrosoftAuthProvider.propTypes = {
	children: PropTypes.object.isRequired
}

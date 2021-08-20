import React, { useCallback, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import { PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';

import { useCache, useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';

const instanceId = uuidv4();
const messageSourceId = 'MicrosoftAuthProvider';
const microsoftScopes = ['files.read', 'files.read.all', 'mail.read', 'mail.read.shared', 'user.read', 'user.readbasic.all'];

const cacheScope = 'microsoft-productivity';
const lastUserIdCacheKey = 'last-user-id';
const cacheOptions = {
    scope: cacheScope,
    key: lastUserIdCacheKey
}

function setUpOnEllucianMicrosoftAuthEvent(msalClient, acquireToken, setLoggedIn, setState) {
	function onEllucianMicrosoftAuthEvent(event) {
		const {data, source} = event;
		if (source === window) {
			// should be from the same window
			const {sourceId, sourceInstanceId, type} = data;
			if (sourceId === messageSourceId && sourceInstanceId !== instanceId) {
				if (type === 'login') {
					acquireToken(msalClient, true);
				} else if (type === 'logout') {
					setLoggedIn(false);
					setState('ready');
				}
			}
		}
	}

	window.addEventListener('message', onEllucianMicrosoftAuthEvent);
}

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
	const [client, setClient] = useState();
	const [error, setError] = useState(false);
	const [loggedIn, setLoggedIn] = useState(false);
	const [state, setState] = useState('initializing');

	const processLogin = useCallback((msalClient, account) => {
		const options = {
			authProvider: {
				getAccessToken: async () => {
					const account = msalClient.getActiveAccount();
					const acquireRequest = {
						authority: `https://login.microsoftonline.com/${aadTenantId}/`,
						clientId: aadClientId,
						scopes: microsoftScopes,
						account
					}
					const response = await msalClient.acquireTokenSilent(acquireRequest);

					if (response.accessToken) {
						return response.accessToken;
					} else {
						const error = Error('Unable to acquire token');
						setError(error);
						throw error;
					}
				}
			}
		}
		const graphClient = Client.initWithMiddleware(options);

		// store user in cache to detect user changes
		const {homeAccountId} = account;
		cacheStoreItem({...cacheOptions, data: homeAccountId})

		unstable_batchedUpdates(() => {
			setClient(() => graphClient);
			setLoggedIn(true);
		});
	}, []);

	const login = useCallback(async () => {
		try {
			const loginRequest = {
				clientId: aadClientId,
				prompt: 'select_account',
				authority: `https://login.microsoftonline.com/${aadTenantId}/`,
				redirectUri: aadRedirectUrl,
				scopes: microsoftScopes
			};
			const response = await msalClient.loginPopup(loginRequest);
			if (response && response.account) {
				const {account} = response;
				msalClient.setActiveAccount(account);
				processLogin(msalClient, account);

				// post a window message to let other card pick up the session
				window.postMessage({sourceId: messageSourceId, sourceInstanceId: instanceId, type: 'login'}, '*');
			}
		} catch(error) {
			console.log('user bailed out', error);
		}
	}, [msalClient]);

	const logout = useCallback(() => {
		if (msalClient) {
			const account = msalClient.getActiveAccount();
			const logoutRequest = {
				account,
				onRedirectNavigate: () => {
					return false;
				}
			};
			msalClient.logoutRedirect(logoutRequest);
			setLoggedIn(false);
			setState('ready');
			window.postMessage({sourceId: messageSourceId, sourceInstanceId: instanceId, type: 'logout'}, '*');
		}
	}, [msalClient]);

	const acquireToken = useCallback(async (msalClient) => {
		if (msalClient) {
			const accounts = msalClient.getAllAccounts();
			const [ account ] = accounts;

			if (account && accounts.length === 1) {
				const acquireRequest = {
						authority: `https://login.microsoftonline.com/${aadTenantId}/`,
						clientId: aadClientId,
						scopes: microsoftScopes
				}
				acquireRequest.account = account;
				msalClient.setActiveAccount(account);
				const response = await msalClient.acquireTokenSilent(acquireRequest);
				const {account: responseAccount} = response || {};

				if (responseAccount) {
					// verify that the same user's home account ID was stored in cache
					// if not do a logout
					const {data: lastUserId} = cacheGetItem(cacheOptions);
					const {homeAccountId} = responseAccount;
					if (lastUserId !== homeAccountId) {
						setState('do-logout');
					} else {
						processLogin(msalClient, responseAccount);
						return true;
					}
				}
			}
		}

		return false;
	}, [aadClientId, aadTenantId, msalClient]);

	useEffect(() => {
		if (status === 'do-logout') {
			logout();
			setState('ready');
		}
	}, [ status ]);

	useEffect(() => {
		if (aadRedirectUrl) {
			const msalConfig = {
				auth: {
					authority: `https://login.microsoftonline.com/${aadTenantId}/`,
					clientId: aadClientId,
					redirectUri: aadRedirectUrl,
					scopes: microsoftScopes
				}
			};

			const msalClient = new PublicClientApplication(msalConfig);

			setUpOnEllucianMicrosoftAuthEvent(msalClient, acquireToken, setLoggedIn, setState);
			setMsalClient(() => msalClient);
			(async () => {
				const acquiredToken = await acquireToken(msalClient);
				if (!acquiredToken) {
					setState('ready');
				}
			})();
		}
	}, [ aadRedirectUrl ]);

	const contextValue = useMemo(() => {
		return {
			client,
			error,
			login,
			logout,
			loggedIn,
			setLoggedIn,
			state
		}
	}, [client, error, loggedIn, login, state]);

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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import { PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';

import { useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';

const instanceId = uuidv4();
const messageSourceId = 'MicrosoftAuthProvider';
const microsoftScopes = ['files.read', 'mail.read', 'user.read'];


function setUpOnEllucianMicrosoftAuthEvent(msalClient, acquireToken, setLoggedIn) {
	function onEllucianMicrosoftAuthEvent(event) {
		const {data, source} = event;
		if (source === window) {
			// should be from the same window
			const {sourceId, sourceInstanceId, type} = data;
			if (sourceId === messageSourceId && sourceInstanceId !== instanceId) {
				if (type === 'login') {
					acquireToken(msalClient, 'silent');
				} else if (type === 'logout') {
					setLoggedIn(false);
				}
			}
		}
	}

	window.addEventListener('message', onEllucianMicrosoftAuthEvent);
}

export function MicrosoftAuthProvider({ children }) {
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

	const [apiState, setApiState] = useState('init');

	const processLogin = useCallback((msalClient) => {
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
			console.log('user bailed out');
		}
	}, [msalClient]);

	const logout = useCallback(() => {
		if (aadRedirectUrl && msalClient) {
			const account = msalClient.getActiveAccount();
			const logoutRequest = {
				account,
				onRedirectNavigate: (url) => {
					return false;
				}
			};
			msalClient.logoutRedirect(logoutRequest).then(() => {
				setLoggedIn(false);
				window.postMessage({sourceId: messageSourceId, sourceInstanceId: instanceId, type: 'logout'}, '*');
			}).catch((e) => {
				setError(e);
			});
		}
	}, [aadRedirectUrl, msalClient]);

	const acquireToken = useCallback(async (msalClient) => {
		if (msalClient) {
			const accounts = msalClient.getAllAccounts();
			const [ account ] = accounts;

			const acquireRequest = {
					authority: `https://login.microsoftonline.com/${aadTenantId}/`,
					clientId: aadClientId,
					scopes: microsoftScopes
			}
			if (account && accounts.length === 1) {
				acquireRequest.account = account;
				msalClient.setActiveAccount(account);
				const response = await msalClient.acquireTokenSilent(acquireRequest);
				const {account: responseAccount} = response || {};
				if (responseAccount) {
					processLogin(msalClient, responseAccount);
					return true;
				}
			}
		}

		return false;
	}, [aadClientId, aadTenantId]);

	useEffect(() => {
		if (aadRedirectUrl && apiState && apiState === 'init') {
			const redirectUri = aadRedirectUrl;
			const msalConfig = {
				auth: {
					authority: `https://login.microsoftonline.com/${aadTenantId}/`,
					clientId: aadClientId,
					// redirectUri: window.location.href,
					// redirectUri: aadRedirectUrl,
					redirectUri,
					scopes: microsoftScopes
				}
			};

			const msalClient = new PublicClientApplication(msalConfig);

			setUpOnEllucianMicrosoftAuthEvent(msalClient, acquireToken, setLoggedIn);
			setMsalClient(() => msalClient);
			(async () => {
				const acquiredToken = await acquireToken(msalClient);
				if (!acquiredToken) {
					setState('ready');
				}
			})();
		}
	}, [ aadRedirectUrl, apiState, setApiState, setClient ]);

	useEffect(() => {
		if (apiState === 'ready') {
			setState('ready');
		}
	}, [apiState, setState]);

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

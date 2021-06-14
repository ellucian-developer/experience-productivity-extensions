import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import { PublicClientApplication } from '@azure/msal-browser';
import { Client } from "@microsoft/microsoft-graph-client";

import { useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';

const instanceId = uuidv4();
const messageSourceId = 'MicrosoftAuthProvider';

function setUpOnEllucianMicrosoftAuthEvent(msalClient, acquireToken) {
	function onEllucianMicrosoftAuthEvent(event) {
		const {data, source} = event;
		if (source === window) {
			// should be from the same window
			const {sourceId, sourceInstanceId, type} = data;
			if (sourceId === messageSourceId && sourceInstanceId !== instanceId) {
				if (type === 'login') {
					acquireToken(msalClient, 'silent');
				}
			}
		}
	}

	window.addEventListener('message', onEllucianMicrosoftAuthEvent);
}

function calculateExperienceRedirectUri() {
	const {location: { href }} = window;
	const matches = href.match(/(https:\/\/[^/]+\/[^/]+)/);

	return matches && matches.length > 0 ? matches[0] + '/' : '';
}

export function MicrosoftAuthProvider({ children }) {
	const {
		configuration: {
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
						scopes: ['user.read', 'people.read', 'files.read', 'files.read.all'],
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
		setClient(() => graphClient);
		setLoggedIn(true);
	}, []);

	const login = useCallback(async () => {
		try {
			const response = await msalClient.loginPopup({});
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
		const account = msalClient.getActiveAccount();
		const redirectUri = calculateExperienceRedirectUri();
		msalClient.logoutPopup({
			account,
			authority: `https://login.microsoftonline.com/${aadTenantId}/`,
			redirectUri,
			mainWindowRedirectUri: redirectUri
		});
	}, [msalClient]);

	const acquireToken = useCallback(async (msalClient) => {
		if (msalClient) {
			const accounts = msalClient.getAllAccounts();
			const [ account ] = accounts;

			const acquireRequest = {
					authority: `https://login.microsoftonline.com/${aadTenantId}/`,
					clientId: aadClientId,
					scopes: ['user.read', 'people.read', 'files.read', 'files.read.all']
			}
			if (account && accounts.length === 1) {
				acquireRequest.account = account;
				msalClient.setActiveAccount(account);
				const response = await msalClient.acquireTokenSilent(acquireRequest);
				const {account: responseAccount} = response || {};
				if (responseAccount) {
					processLogin(msalClient, responseAccount);
				}
			}
		}
	}, [aadClientId, aadTenantId]);

	useEffect(() => {
		if (apiState === 'init') {
			const redirectUri = calculateExperienceRedirectUri();
			const msalConfig = {
				auth: {
					authority: `https://login.microsoftonline.com/${aadTenantId}/`,
					clientId: aadClientId,
					// redirectUri: window.location.href,
					// redirectUri: aadRedirectUrl,
					redirectUri,
					scopes: ['user.read', 'people.read', 'files.read', 'files.read.all']
				}
			};

			const msalClient = new PublicClientApplication(msalConfig);

			setUpOnEllucianMicrosoftAuthEvent(msalClient, acquireToken);
			setMsalClient(() => msalClient);
			acquireToken(msalClient);
		}
	}, [ apiState, setApiState, setClient ]);

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
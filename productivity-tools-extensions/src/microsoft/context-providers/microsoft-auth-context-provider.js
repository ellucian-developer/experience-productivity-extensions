import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';
import { PublicClientApplication } from '@azure/msal-browser';
import { Client } from "@microsoft/microsoft-graph-client";

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
		const response = await msalClient.loginPopup({});
		if (response && response.account) {
			const {account} = response;
			msalClient.setActiveAccount(account);
			processLogin(msalClient, account);
		}
	}, [msalClient]);

	const logout = useCallback(() => {
		const account = msalClient.getActiveAccount();
		const {location: { href: redirectUri }} = window;
		msalClient.logoutPopup({
			account,
			authority: `https://login.microsoftonline.com/${aadTenantId}/`,
			redirectUri,
			mainWindowRedirectUri: redirectUri
		});
	}, [msalClient]);

	const acquireToken = useCallback(async (msalClient, type, account) => {
		if (msalClient) {
			const acquireRequest = {
					authority: `https://login.microsoftonline.com/${aadTenantId}/`,
					clientId: aadClientId,
					scopes: ['user.read', 'people.read', 'files.read', 'files.read.all']
			}
			if (account) {
				acquireRequest.account = account;
			}
			const response = type === 'silent' && account
				? await msalClient.acquireTokenSilent(acquireRequest)
				: await msalClient.acquireTokenPopup(acquireRequest);
			const {account: responseAccount} = response || {};
			if (responseAccount) {
				processLogin(msalClient, responseAccount);
			}
		}
	}, [aadClientId, aadTenantId]);

	useEffect(() => {
		if (apiState === 'init') {
			let {location: { href: redirectUri }} = window;
			if (!redirectUri.endsWith('/')) {
				redirectUri += '/';
			}
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
			setMsalClient(() => msalClient);
			const accounts = msalClient.getAllAccounts();
			const [ account ] = accounts;

			// acquire token if possible silently
			if (accounts && accounts.length > 1) {
				// more than one, they need to choose which one
				acquireToken(msalClient, 'popup');
			} else if (accounts && accounts.length == 1) {
				// there is only one account known, so try to get a token silently
				msalClient.setActiveAccount(account);
				acquireToken(msalClient, 'silent', account);
			}
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
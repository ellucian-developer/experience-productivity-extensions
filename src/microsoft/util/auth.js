// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import { PublicClientApplication } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import {get as idbGet, set as idbSet} from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

import log from 'loglevel';
const logger = log.getLogger('Microsoft');

 export const microsoftScopes = [
    'files.read',
    'files.read.all',
    'mail.read',
    'mail.read.shared',
    'user.read',
    'user.readbasic.all'
];

export function authorityUrl(tenantId) {
    return `https://login.microsoftonline.com/${tenantId}/`
}

const instanceId = uuidv4();
const messageSourceId = 'MicrosoftAuthProvider';

const cacheScope = 'microsoft-productivity';
const lastLoginKey = 'last-login';
const lastLoginCacheOptions = {
    scope: cacheScope,
    key: lastLoginKey,
    options: {
        session: true
    }
}

function getCurrentExperienceUserId({cacheStoreItem}) {
    // store something to ensure experience user is in local storage
    cacheStoreItem({key: 'store', data: 'something'});
    return localStorage.getItem('experience-user-id');
}

export async function login({aadClientId, aadRedirectUrl, aadTenantId, cacheStoreItem, msalClient}) {
    try {
        const loginRequest = {
            clientId: aadClientId,
            authority: authorityUrl(aadTenantId),
            redirectUri: aadRedirectUrl,
            scopes: microsoftScopes
        };

        // verify user hasn't changed without a logout
        const currentExperienceUserId = getCurrentExperienceUserId({cacheStoreItem});
        const { lastExperienceUserId, lastMSUsername } = await idbGet(lastLoginKey) || {};
        const forceNewLogin = !lastExperienceUserId || lastExperienceUserId !== currentExperienceUserId;
        if (forceNewLogin) {
            loginRequest.prompt = 'login';
        } else if (lastMSUsername) {
            // help the login
            loginRequest.loginHint = lastMSUsername;
        }

        const response = await msalClient.loginPopup(loginRequest);
        if (response && response.account) {
            const {account} = response;
            msalClient.setActiveAccount(account);

            // save the username in local storage to use the next time
            cacheStoreItem({
                ...lastLoginCacheOptions,
                data: {
                    lastExperienceUserId: currentExperienceUserId,
                    lastMSUsername: account.username
                }
            });
            idbSet(lastLoginKey, {
                lastExperienceUserId: currentExperienceUserId,
                lastMSUsername: account.username
            });

            // post a window message to let other card pick up the session
            window.postMessage({sourceId: messageSourceId, sourceInstanceId: instanceId, type: 'login'}, '*');

            return true;
        }
    } catch(error) {
        logger.debug('user bailed out', error);
    }

    return false;
}

export async function logout({aadClientId, aadRedirectUrl, aadTenantId, msalClient}) {
    if (msalClient) {
        const logoutRequest = {
            clientId: aadClientId,
            authority: authorityUrl(aadTenantId),
            redirectUri: aadRedirectUrl
        };
        const account = msalClient.getActiveAccount();
        if (account) {
            logoutRequest.account = account;
        }
        await msalClient.logoutPopup(logoutRequest);
        idbSet(lastLoginKey, {});
        window.postMessage({sourceId: messageSourceId, sourceInstanceId: instanceId, type: 'logout'}, '*');
    }
}

export function initializeGraphClient({aadClientId, aadTenantId, cacheStoreItem, msalClient, setError}) {
    const options = {
        authProvider: {
            getAccessToken: () => (acquireToken({aadClientId, aadTenantId, cacheStoreItem, msalClient, setError}))
        }
    }
    const graphClient = Client.initWithMiddleware(options);

    return graphClient;
}

export async function acquireToken({aadClientId, aadTenantId, cacheStoreItem, msalClient, setError, trySsoSilent = false}) {
    if (msalClient) {
        let account = msalClient.getActiveAccount();

        const { lastExperienceUserId, lastMSUsername} = await idbGet(lastLoginKey) || {};
        if (!account) {
            // see if it is saved in cache
            if (lastMSUsername) {
                account = msalClient.getAccountByUsername(lastMSUsername);
            }
        }

        if (!account && trySsoSilent && cacheStoreItem) {
            // if this is the same Experience user, then use the same MS User
            const currentExperienceUserId = getCurrentExperienceUserId({cacheStoreItem});

            logger.debug('attempting ssoSilent for current experience user:', currentExperienceUserId, 'lastExperienceUserId:', lastExperienceUserId);
            if (currentExperienceUserId === lastExperienceUserId) {
                const acquireRequest = {
                    authority: authorityUrl(aadTenantId),
                    clientId: aadClientId,
                    scopes: microsoftScopes,
                    loginHint: lastMSUsername
                }
                try {
                    const response = await msalClient.ssoSilent(acquireRequest);
                    const {accessToken, account: responseAccount} = response || {};
                    // eslint-disable-next-line max-depth
                    if (accessToken && responseAccount) {
                        logger.debug('ssoSilent success for', responseAccount.username);
                        msalClient.setActiveAccount(responseAccount);
                        idbSet(lastLoginKey, {
                            lastExperienceUserId: currentExperienceUserId,
                            lastMSUsername: responseAccount.username
                        });
                        return accessToken;
                    }
                } catch (error) {
                    logger.debug('ssoSilent failed', error);
                    // ignore
                }
            }
        }

        if (account) {
            const acquireRequest = {
                account,
                authority: authorityUrl(aadTenantId),
                clientId: aadClientId,
                scopes: microsoftScopes
            }
            const response = await msalClient.acquireTokenSilent(acquireRequest);
            const {accessToken, account: responseAccount} = response || {};

            if (setError && !accessToken) {
                const error = Error('Unable to acquire token');
                setError(error);
                throw error;
            }

            if (accessToken && responseAccount) {
                return accessToken;
            }
        }
    }

    return undefined;
}

export function initializeAuthEvents({setState}) {
	function onEllucianMicrosoftAuthEvent(event) {
		const {data, source} = event;
		if (source === window) {
			// should be from the same window
			const {sourceId, sourceInstanceId, type} = data;
			if (sourceId === messageSourceId && sourceInstanceId !== instanceId) {
				if (type === 'login') {
                    setState('event-login');
				} else if (type === 'logout') {
                    setState('event-logout');
				}
			}
		}
	}

	window.addEventListener('message', onEllucianMicrosoftAuthEvent);
}

export function initializeMicrosoft({aadClientId, aadRedirectUrl, aadTenantId}) {
    const msalConfig = {
        auth: {
            authority: authorityUrl(aadTenantId),
            clientId: aadClientId,
            redirectUri: aadRedirectUrl,
            scopes: microsoftScopes
            // storeAuthStateInCookie: true
        }
    };

    const msalClient = new PublicClientApplication(msalConfig);

    return msalClient;
}
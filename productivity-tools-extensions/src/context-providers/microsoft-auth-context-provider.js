import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useCardInfo } from '@ellucian/experience-extension-hooks';

import { Context } from '../context-hooks/auth-context-hooks';

import { UserAgentApplication } from "msal";
import { Client } from "@microsoft/microsoft-graph-client";
import { ImplicitMSALAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider";
import { MSALAuthenticationProviderOptions } from "@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions";

function loadGapi(aadRedirectUrl, aadClientId, aadTenantId, userId, setApiState, setLoggedIn, setClient, setError) {

    const msalConfig = {
        auth: {
            clientId: aadClientId,
            authority: `https://login.microsoftonline.com/${aadTenantId}/`,
            redirectUri: aadRedirectUrl
        },
        cache: {
            cacheLocation: "localStorage"
        }
    };
    const msalInstance = new UserAgentApplication(msalConfig);
    const msalRequest = {
        loginHint: userId
    };

    (async () => {
        await msalInstance.ssoSilent(msalRequest)
        .then((response) => {
            // An array of graph scopes
            const graphScopes = ["calendars.read"];
            const options = new MSALAuthenticationProviderOptions(graphScopes);
            const authProvider = new ImplicitMSALAuthenticationProvider(
                msalInstance,
                options
            );
            const clientOptions = {
                authProvider
            };
            const client = Client.initWithMiddleware(clientOptions);
            setClient(client);
            setLoggedIn(true);
            setApiState('ready');
        })
        .catch((error) => {
            if (setError) {
                setError(error);
            }
            console.error('MS OneDrive failed', error);
        });
    })();
}


export function MicrosoftAuthProvider({ children }) {
    const { configuration: { aadRedirectUrl, aadClientId, aadTenantId, userId } } = useCardInfo();
    const [client, setClient] = useState();
    const [email, setEmail] = useState();
    const [error, setError] = useState(false);
    // eslint-disable-next-line no-empty-function
    // const [login, setLogin] = useState(() => {});
    const [loggedIn, setLoggedIn] = useState(false);
    const [state, setState] = useState('initializing');

    const [apiState, setApiState] = useState('init');

    function login() {
        console.log("MS Auth login");
        // const { gapi } = window;
        // if (gapi) {
        //     gapi.auth2.getAuthInstance().signIn();
        // }
    }

    function logout() {
        console.log("MS Auth logout");
        // const { gapi } = window;
        // if (gapi) {
        //     gapi.auth2.getAuthInstance().signOut();
        // }
    }

    function revokePermissions() {
        console.log("MS Auth revokePermissions");
        // const { gapi } = window;
        // if (gapi) {
        //     gapi.auth2.getAuthInstance().currentUser.get().disconnect();
        //     gapi.auth2.getAuthInstance().disconnect();
        // }
    }

    const contextValue = useMemo(() => {
        return {
            client,
            email,
            error,
            login,
            logout,
            loggedIn,
            revokePermissions,
            setLoggedIn,
            state
        }
    }, [client, email, error, loggedIn, login, state]);

    useEffect(() => {
        if (apiState === 'init') {
            // const { gapi } = window;
            // if (!gapi) {
                // ( () => {
                //     setApiState('script-loading');
                //     await loadGapiScript();
                //     setApiState('script-loaded');
                // })();
            // } else {
            //     setApiState('script-loaded');
            // }
            setApiState('script-loaded');
        } else if (apiState === 'script-loaded') {
            loadGapi(aadRedirectUrl, aadClientId, aadTenantId, userId, setApiState, setLoggedIn, setClient, setError);
        }
    }, [apiState, setApiState, setLoggedIn, setError]);

    useEffect(() => {
        if (apiState === 'ready') {
            setState('ready');
        }
    }, [apiState, setState]);

    useEffect(() => {
        if (loggedIn) {
            // const { gapi } = window;
            // const user = gapi.auth2.getAuthInstance().currentUser.get();
            // const email = user.getBasicProfile().getEmail();
            setEmail(userId);
        }
    }, [loggedIn]);

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
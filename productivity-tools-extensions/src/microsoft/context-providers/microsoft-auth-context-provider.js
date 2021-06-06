import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useCardInfo } from '@ellucian/experience-extension-hooks';
import { Context } from '../../context-hooks/auth-context-hooks';
import { Client } from "@microsoft/microsoft-graph-client";
import { Providers, ProviderState } from '@microsoft/mgt-react';
import { LoginType } from '@microsoft/mgt-react';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';


export function MicrosoftAuthProvider({ children }) {
    const { configuration: { aadRedirectUrl, aadClientId, aadTenantId } } = useCardInfo();
    const [client, setClient] = useState();
    const [email, setEmail] = useState();
    const [error, setError] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [state, setState] = useState('initializing');

    const [apiState, setApiState] = useState('init');

    function login() {
        console.log("MS Auth login");
        setLoggedIn(true);
        setApiState('ready');
    }

    function loginInit() {
        console.log("MS Auth login Init");
    }

    function loginFailed() {
        console.log("MS Auth login Failed");
        setLoggedIn(false);
    }

    function logout() {
        console.log("MS Auth logout Initiated");
    }

    function logoutCompleted() {
        console.log("MS Auth logout Completed");
        setLoggedIn(false);
    }

    function revokePermissions() {
        console.log("MS Auth revokePermissions");
        setLoggedIn(false);
    }

    const contextValue = useMemo(() => {
        return {
            client,
            email,
            error,
            login,
            loginInit,
            loginFailed,
            logout,
            logoutCompleted,
            loggedIn,
            revokePermissions,
            setLoggedIn,
            state
        }
    }, [client, email, error, loggedIn, login, state]);

    useEffect(() => {
        const updateState = () => {
            const provider = Providers.globalProvider;
            if (provider && provider.state === ProviderState.SignedIn) {
                const authProvider = provider;
                const clientOptions = {
                    authProvider
                };
                const client = Client.initWithMiddleware(clientOptions);
                setClient(client);
                setLoggedIn(true);
            }
        };

        if (apiState === 'init') {
            setApiState('script-loaded');
            console.log('Creating Msal2Provider');
            Providers.globalProvider = new Msal2Provider({
                clientId: aadClientId,
                loginType: LoginType.Popup,
                authority: `https://login.microsoftonline.com/${aadTenantId}/`,
                redirectUri: aadRedirectUrl,
                scopes: ['user.read', 'people.read', 'calendars.read', 'files.read', 'files.read.all']
            });
            Providers.onProviderUpdated(updateState);
            updateState();
        }

        return () => {
            Providers.removeProviderUpdatedListener(updateState);
        }
    }, []);

    useEffect(() => {
        if (apiState === 'ready') {
            setState('ready');
        }
    }, [apiState, setState]);

    useEffect(() => {
        if (loggedIn) {
            // TODO: Set the Email. Remove testEmailNeedToBeChanged
            console.log('Email set to: testEmailNeedToBeChanged');
            const userId = "Krishna.Kant@ellucian.com";
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

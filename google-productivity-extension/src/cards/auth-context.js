import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import PropTypes from 'prop-types';

import { useCardInfo } from '@ellucian/experience-extension-hooks';

const Context = createContext()

function loadGapiInsideDOM() {
    return new Promise(resolve => {
        const element = document.getElementsByTagName('script')[0];
        const js = document.createElement('script');
        js.id = 'google-platform';
        js.src = '//apis.google.com/js/platform.js';
        js.async = true;
        js.defer = true;
        element.parentNode.insertBefore(js, element);
        js.onload = () => {
            resolve(window.gapi);
        }
    });
}

export function AuthProvider({
    children,
    type
}) {
    const [loggedIn, setLoggedIn] = useState();
    const [gapi, setGapi] = useState();

    const { configuration: { googleOAuthClientId } } = useCardInfo();

    const contextValue = useMemo(() => {
        return {
            loggedIn,
            gapi,
            login: () => {
                if (gapi) {
                    gapi.auth2.getAuthInstance().signIn();
                }
            }
        }
    }, [loggedIn, gapi]);

    useEffect(() => {
        if (setGapi && setLoggedIn && type === 'google') {
            (async () => {
                const gapi = window.gapi || await loadGapiInsideDOM();
                setGapi(gapi);

                gapi.load('client:auth2', async () => {
                    const discoveryDocs = [
                        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                        'https://gmail.googleapis.com/$discovery/rest?version=v1'
                    ];
                    const scope = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.readonly';

                    try {
                        await gapi.client.init({
                            clientId: googleOAuthClientId,
                            discoveryDocs,
                            scope
                        });

                        gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => setLoggedIn(isSignedIn));

                        // Handle the initial sign-in state.
                        const signedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

                        setLoggedIn(signedIn);
                    } catch (error) {
                        console.error('gapi failed', error);
                    }
                });
            })();
        }

    }, [setGapi, setLoggedIn, type])

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('AuthProvider mounted');

            return () => {
                console.log('AuthProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
}

export function useAuth() {
    return useContext(Context);
}

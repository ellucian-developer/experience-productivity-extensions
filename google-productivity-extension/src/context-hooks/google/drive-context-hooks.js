import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useAuth } from '../auth-context-hooks';

const refreshInterval = 60000;

const Context = createContext()

export function DriveProvider({children}) {
    const { loggedIn } = useAuth();

    const [state, setState] = useState('load');
    const [files, setFiles] = useState();

    const refresh = useCallback(async () => {
		if (loggedIn) {
            // if not force load and not curent visible, skip it
            if (state === 'refresh' && document.hidden) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`skipping refresh when document is hideen`);
                }
                return;
            }
            if (process.env.NODE_ENV === 'development') {
                console.log(`${files === undefined ? 'loading' : 'refreshing'} drive files`);
            }
            const search = `mimeType != 'application/vnd.google-apps.folder'`;
            try {
                const { gapi } = window;
                const response = await gapi.client.drive.files.list({
                    pageSize: 10,
                    fields: 'nextPageToken, files(id, iconLink, name, lastModifyingUser, modifiedTime, webViewLink)',
                    q: search
                });

                const data = JSON.parse(response.body);
                unstable_batchedUpdates(() => {
                    setFiles(() => data.files);
                    setState('loaded');
                })
            } catch (error) {
                console.error('gapi failed', error);
                setState('error');
            }
        }
    }, [loggedIn, state])

    useEffect(() => {
		if (loggedIn && (state === 'load' || state === 'refresh')) {
            refresh();
        }
    }, [loggedIn, refresh, state])

    useEffect(() => {
        let timerId;

        function startInteval() {
            stopInteval();
            // only start if document isn't hidden
            if (!document.hidden) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('starting interval');
                }

                timerId = setInterval(() => {
                    setState('refresh');
                }, refreshInterval);
            }
        }

        function stopInteval() {
            if (timerId) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('stoping interval');
                }
                clearInterval(timerId)
                timerId = undefined;
            }
        }

        function visibilitychangeListener() {
            if (process.env.NODE_ENV === 'development') {
                console.log('visiblity changed');
            }
            if (document.hidden) {
                stopInteval();
            } else {
                setState('refresh');
                startInteval();
            }
        }

		if (loggedIn) {
            document.addEventListener('visibilitychange', visibilitychangeListener);
            startInteval();
        }

        return () => {
            document.removeEventListener('visibilitychange', visibilitychangeListener);
            if (timerId) {
                clearInterval(timerId)
            }
        }
    }, [loggedIn, setState]);

    const contextValue = useMemo(() => {
        return {
            files,
            refresh: refresh
        }
    }, [ files, refresh ]);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('DriveProvider mounted');

            return () => {
                console.log('DriveProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

DriveProvider.propTypes = {
    children: PropTypes.object.isRequired
}

export function useDrive() {
    return useContext(Context);
}

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/drive-context-hooks';

const refreshInterval = 60000;

export function MicrosoftDriveProvider({children}) {
    const { client, loggedIn, setLoggedIn } = useAuth();
    const [error, setError] = useState(false);
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

            try {
                const response = await client.api(
                    `/me/drive/search(q='')?$orderby=lastModifiedDateTime%20desc&$top=20&$select=id,name,file,folder,package,webUrl,lastModifiedBy,lastModifiedDateTime`
                ).get();

                console.log("MS OneDrive Items 1 ", response);

                let filteredFiles = response.value;
                filteredFiles = filteredFiles.filter(file => file.folder === undefined)
                const totalFileCount = filteredFiles.length;
                if (totalFileCount > 10) {
                    for (let index = totalFileCount; index > 9; index--) {
                        filteredFiles.splice(index, 1);
                    }
                }
                unstable_batchedUpdates(() => {
                    setFiles(() => filteredFiles);
                    setState('loaded');
                })
            } catch (error) {
                // did we get logged out or credentials were revoked?
                if (error && error.status === 401) {
                    setLoggedIn(false);
                } else {
                    console.error('gapi failed', error);
                    unstable_batchedUpdates(() => {
                        setState(() => ({ error: 'api'}));
                        setError(error);
                    })
                }
            }
        }
    }, [loggedIn, state])

    useEffect(() => {
        if (loggedIn && (state === 'load' || state === 'refresh')) {
            refresh();
        } else if (!loggedIn && state === 'loaded') {
            // force refresh when logged back in
            setFiles(undefined);
            setState('load');
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
            error,
            files,
            refresh: () => { setState('refresh') }
        }
    }, [ error, files, setState ]);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('MicrosoftDriveProvider mounted');

            return () => {
                console.log('MicrosoftDriveProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MicrosoftDriveProvider.propTypes = {
    children: PropTypes.object.isRequired
}
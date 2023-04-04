// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/drive-context-hooks';
import { getDriveFiles } from '../util/google-drive';

import log from 'loglevel';
const logger = log.getLogger('Google');

const refreshInterval = 60000;

export function DriveProvider({children}) {
    const { user, loggedIn, setLoggedIn } = useAuth();

    const [error, setError] = useState(false);
    const [state, setState] = useState('load');
    const [files, setFiles] = useState();

    const refresh = useCallback(async () => {
        if (loggedIn) {
            // if not force load and not curent visible, skip it
            if (state === 'refresh' && document.hidden) {
                logger.debug(`Drive skipping refresh when document is hideen`);
                return;
            }
            logger.debug(`${files === undefined ? 'loading' : 'refreshing'} Google Drive files`);
            try {
                const files = await getDriveFiles();

                unstable_batchedUpdates(() => {
                    setFiles(() => files);
                    setState('loaded');
                })
            } catch (error) {
                // did we get logged out or credentials were revoked?
                if (error && (error.status === 401 || error.status === 403)) {
                    logger.debug('Drive getMessageFromThreads failed because status:', error.status);
                    setLoggedIn(false);
                } else {
                    logger.error('Drive gapi failed', error);
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
                logger.debug('Google drive starting interval');

                timerId = setInterval(() => {
                    setState('refresh');
                }, refreshInterval);
            }
        }

        function stopInteval() {
            if (timerId) {
                logger.debug('Google drive stopping interval');
                clearInterval(timerId)
                timerId = undefined;
            }
        }

        function visibilitychangeListener() {
            logger.debug('Google drive visiblity changed');
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
            openDrive: () => {
                window.open(`https://drive.google.com?authuser=${user?.authUser}`, '_blank');
            },
            refresh: () => { setState('refresh') }
        }
    }, [ user, error, files, setState ]);

    useEffect(() => {
        logger.debug('GoogleDriveProvider mounted');

        return () => {
            logger.debug('GoogleDriveProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

DriveProvider.propTypes = {
    children: PropTypes.object.isRequired
}
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/mail-context-hooks';

const refreshInterval = 60000;

export function MicrosoftMailProvider({children}) {
    const { client, loggedIn, setLoggedIn } = useAuth();

    const [error, setError] = useState(false);
    const [state, setState] = useState('load');
    const [mails, setMails] = useState();
    const [userPhotos, setUserPhotos] = useState(new Map());

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
                console.log(`${mails === undefined ? 'loading' : 'refreshing'} mails`);
            }

            try {
                const response = await client
                .api('/me/mailFolders/Inbox/messages')
                .get();

                const filteredMails = response.value;
                unstable_batchedUpdates(() => {
                    setMails(() => filteredMails);
                    setState('load');
                });
                // console.debug('filteredMails:- ', JSON.stringify(filteredMails));

                if (filteredMails !== undefined) {
                    const responsePhotos = filteredMails.map((mail, index) => {
                        const {
                            from: {
                                emailAddress: {
                                    address
                                }
                            }
                        } = mail;
                        const last = index === filteredMails.length - 1;

                        const responsePhoto2 = (async () => {
                            // console.debug('context 10', userPhotos);
                            if ((userPhotos !== undefined) && (userPhotos.get(address) === undefined)) {
                                // console.debug('context 20:- ', address);
                                const responseUserId = await client
                                .api(`/users`)
                                .filter(`mail eq '${address}'`)
                                .select('id')
                                .get();
                                // console.debug('context 30', address, responseUserId);
                                if (responseUserId.value[0]) {
                                    try {
                                        const responsePhoto = await client
                                        .api(`/users/${responseUserId.value[0].id}/photo/$value`)
                                        .get();
                                        setUserPhotos(
                                            responsePhoto
                                            ? userPhotos.set(address, URL.createObjectURL(responsePhoto))
                                            : setUserPhotos(userPhotos.set(address, ""))
                                        );
                                        setState('loadPhoto');
                                        // console.debug('context 50 last', userPhotos);
                                    } catch (error) {
                                        // did we get logged out or credentials were revoked?
                                        if (error && error.status === 401) {
                                            setLoggedIn(false);
                                            // console.debug('context 80');
                                        } else {
                                            setUserPhotos(userPhotos.set(address, ""));
                                            // console.log('Profile photo download failed for email: ', address, error);
                                        }
                                    }
                                }
                                return null;
                            }
                        })();
                        // console.debug('responsePhoto2:- ', responsePhoto2);
                        return null;
                    })
                    // console.debug('userPhotos:- ', userPhotos);
                }
                // console.debug('userIds:- ', userIds);
            } catch (error) {
                // did we get logged out or credentials were revoked?
                if (error && error.status === 401) {
                    setLoggedIn(false);
                } else {
                    console.error('mapi failed\n', error);
                    setState(() => ({ error: 'api'}));
                    setError(error);
                }
            }

        }
    }, [loggedIn, state])

    useEffect(() => {
        if (loggedIn && (state === 'load' || state === 'refresh' || state === 'loadPhoto')) {
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
            error,
            mails,
            userPhotos,
            refresh: () => { setState('refresh') }
        }
    }, [ error, mails, userPhotos, setState ]);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('MicrosoftMailProvider mounted');

            return () => {
                console.log('MicrosoftMailProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MicrosoftMailProvider.propTypes = {
    children: PropTypes.object.isRequired
}
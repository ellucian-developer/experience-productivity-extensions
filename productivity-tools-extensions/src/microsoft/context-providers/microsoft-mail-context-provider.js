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
    const [userIds, setUserIds] = useState();

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
                    // setState('load');
                });
                console.debug('filteredMails:- ', JSON.stringify(filteredMails));

                /* if (!(filteredMails === undefined)) {
                    const userPhotos = filteredMails.map((mail) => {
                        const {
                            from: {
                                emailAddress: {
                                    address
                                }
                            }
                        } = mail;

                        console.debug('address:- ', address);
                        const responsePhoto2 = (async () => {
                            try {
                                const responseUserId = await client
                                .api(`/users`)
                                .filter(`mail eq '${address}'`)
                                .select('id')
                                .get();
                                if (responseUserId.value[0]) {
                                    const responsePhoto = await client
                                    .api(`/users/${responseUserId.value[0].id}/photo/$value`)
                                    .get();
                                    // console.debug('responsePhoto:- ', responsePhoto);
                                    return [address, responsePhoto];
                                } else {
                                    return [address, undefined];
                                }
                            } catch (error) {
                                // did we get logged out or credentials were revoked?
                                if (error && error.status === 401) {
                                    setLoggedIn(false);
                                } else if (error.status === 404) {
                                    console.log('Profile photo not found for email: ', address);
                                } else {
                                    console.log('Profile download failed\n', error);
                                    // setState(() => ({ error: 'api'}));
                                    setError(error);
                                }
                            }
                        })();
                        // console.debug('responsePhoto2:- ', responsePhoto2);
                        return responsePhoto2;
                    })
                    // console.debug('userPhotos:- ', userPhotos);
                    unstable_batchedUpdates(() => {
                        setUserIds(userPhotos);
                        setState('load');
                    });
                } */
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
            error,
            mails,
            userIds,
            refresh: () => { setState('refresh') }
        }
    }, [ error, mails, userIds, setState ]);

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
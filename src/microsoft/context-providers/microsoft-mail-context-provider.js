import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { useUserInfo } from '@ellucian/experience-extension-hooks';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/mail-context-hooks';
import { isToday, getInitials } from '../../util/mail';

const refreshInterval = 60000;

export function MicrosoftMailProvider({children}) {
    const { locale } = useUserInfo();
    const { client, loggedIn, setLoggedIn } = useAuth();

    const [error, setError] = useState(false);
    const [state, setState] = useState('load');
    const [messages, setMessages] = useState();
    const [userPhotos] = useState({});
    const [renderCount, setRenderCount] = useState(0);

    const dateFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'short'})
    }, [locale]);

    const timeFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { timeStyle: 'short'})
    }, [locale]);

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
                console.log(`${messages === undefined ? 'loading' : 'refreshing'} mails`);
            }

            try {
                const response = await client
                .api('/me/mailFolders/Inbox/messages')
                .get();

                const messages = response.value;

                // transform to what the UI needs
                const transformedMessages = messages.map( message => {
                    const {
                        bodyPreview,
                        from: {
                            emailAddress: {
                                name: fromName,
                                address: fromEmail
                            }
                        },
                        id,
                        isRead,
                        hasAttachments: hasAttachment,
                        receivedDateTime,
                        subject,
                        webLink: messageUrl
                    } = message;

                    const fromInitials = getInitials(fromName);

                    const receivedDate = new Date(receivedDateTime);
                    const received = isToday(receivedDate) ? timeFormater.format(receivedDate) : dateFormater.format(receivedDate);

                    return {
                        bodySnippet: bodyPreview.trim(),
                        id,
                        fromEmail,
                        fromInitials,
                        fromName,
                        hasAttachment,
                        messageUrl: messageUrl.split('?')[0],
                        received,
                        subject,
                        unread: !isRead,
                        userPhotoUrl: userPhotos[fromEmail]
                    }
                });

                unstable_batchedUpdates(() => {
                    setMessages(() => transformedMessages);
                    setState('loaded');
                });

                if (process.env.NODE_ENV === 'development') {
                    console.debug('Inbox emails: ', transformedMessages);
                }

                // attempt to load photos
                for (const message of transformedMessages) {
                    const {
                        fromEmail
                    } = message;

                    (async () => {
                        // check if we already have this user's photo
                        const userPhotoUrl = userPhotos[fromEmail];
                        if (message.userPhotoUrl) {
                            // already read from cache
                            return undefined;
                        } else if (userPhotoUrl) {
                            message.userPhotoUrl = userPhotoUrl;
                            // triggers a context update
                            setRenderCount(count => count + 1);
                        } else {
                            const responseUserId = await client
                            .api(`/users`)
                            .filter(`mail eq '${fromEmail}'`)
                            .select('id')
                            .get();

                            const [{id: userId} = {}] = responseUserId.value;

                            if (userId) {
                                try {
                                    const responsePhoto = await client
                                    .api(`/users/${userId}/photo/$value`)
                                    .get();

                                    if (responsePhoto) {
                                        // add it to the message
                                        message.userPhotoUrl = URL.createObjectURL(responsePhoto);
                                        userPhotos[fromEmail] = message.userPhotoUrl;
                                    }
                                    // triggers a context update
                                    setRenderCount(count => count + 1);
                                } catch (error) {
                                    // did we get logged out or credentials were revoked?
                                    if (error && error.status === 401) {
                                        setLoggedIn(false);
                                    } else {
                                        userPhotos[fromEmail] = '';
                                    }
                                }
                            }
                        }
                    })();
                }
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
            messages,
            refresh: () => { setState('refresh') },
            state
        }
    }, [ error, messages, renderCount, state ]);

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

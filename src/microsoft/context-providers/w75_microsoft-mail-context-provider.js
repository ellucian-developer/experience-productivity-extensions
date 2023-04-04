import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import stringTemplate from 'string-template';

import { useUserInfo } from '@ellucian/experience-extension-utils';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/mail-context-hooks';
import { isToday, getInitials } from '../../util/mail';

import log from 'loglevel';
const logger = log.getLogger('Microsoft');

const refreshInterval = 60000;

const outlookMessageTemplateUrl = process.env.OUTLOOK_MESSAGE_TEMPLATE_URL || 'https://outlook.office.com/mail/inbox/id/{id}';
// get message count from .env or 10 if not configured.
const defaultMaxMessageCount = process.env.OUTLOOK_MAX_MESSAGE_COUNT || 10;
// get fetchUnreadOnly value from .env
const defaultFetchUnreadOnlyMessageCount = (process.env.OUTLOOK_FETCH_UNREAD_ONLY === "true" || process.env.OUTLOOK_FETCH_UNREAD_ONLY === "True" || process.env.OUTLOOK_FETCH_UNREAD_ONLY === "TRUE");


export function MicrosoftMailProvider({children}) {
    const { locale } = useUserInfo();
    const { client, loggedIn, setLoggedIn } = useAuth();

    const [error, setError] = useState(false);
    const [state, setState] = useState('load');
    const [messages, setMessages] = useState();
    const [userPhotos, setUserPhotos] = useState({});
    const [renderCount, setRenderCount] = useState(0);
    const [maxMessageCount, setMaxMessageCount] = useState(defaultMaxMessageCount);
    const [messageCount, setMessageCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [fetchUnreadOnly, setFetchUnreadOnly] = useState(defaultFetchUnreadOnlyMessageCount);
    const [fetchUnreadOnlyLabel, setFetchUnreadOnlyLabel] = useState('');

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
                logger.debug(`Outlook skipping refresh when document is hideen`);
                return;
            }
            logger.debug(`${messages === undefined ? 'loading' : 'refreshing'} outlook messages`);

            setFetchUnreadOnly(process.env.OUTLOOK_FETCH_UNREAD_ONLY.toLowerCase() === "true");
            const queryParameters = `top=${maxMessageCount}`;
            const filterParameter = `${fetchUnreadOnly ? "isRead ne true" : ""}`;

            try {
                const msgCountApiCall = `/me/mailFolders/Inbox?`;
                const msgCountApiResponse = await client
                .api(msgCountApiCall)
                .get();

                const {unreadItemCount: unreadCount,
                    totalItemCount: count} = msgCountApiResponse;
                // console.log(`Your Inbox contains ${count} total messages (${unreadCount} unread).`);

                const apiCall = `/me/mailFolders/Inbox/messages?${queryParameters}`;
                const response = await client
                .api(apiCall)
                .header('Prefer', 'IdType="ImmutableId"')
                .filter(filterParameter)
                .get();

                const { value: messages} = response;

                setMessageCount(count);
                setUnreadMessageCount(unreadCount);
                setFetchUnreadOnlyLabel(`${fetchUnreadOnly || unreadMessageCount > 0 ? 'microsoft.unreadCountMessage' : 'mail.clickToInbox'}`);

                // transform to what the UI needs
                const transformedMessages = messages.map( message => {
                    const {
                        bodyPreview,
                        conversationId,
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
                        webLink
                    } = message;

                    const fromInitials = getInitials(fromName);

                    const receivedDate = new Date(receivedDateTime);
                    const received = isToday(receivedDate) ? timeFormater.format(receivedDate) : dateFormater.format(receivedDate);

                    let messageUrl;
                    if (process.env.OUTLOOK_USE_WEB_LINK === 'true') {
                        messageUrl = webLink
                    } else {
                        let encodedId = encodeURIComponent(conversationId);
                        encodedId = encodedId.replaceAll('-', '%2F');
                        encodedId = encodedId.replaceAll('_', '%2B');
                        messageUrl = stringTemplate(outlookMessageTemplateUrl, {id: encodedId});
                    }

                    return {
                        bodySnippet: bodyPreview.trim(),
                        id,
                        fromEmail,
                        fromInitials,
                        fromName,
                        hasAttachment,
                        messageUrl,
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

                logger.debug('Outlook messages: ', transformedMessages);

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
                    logger.error('Outlook mapi failed\n', error);
                    unstable_batchedUpdates(() => {
                        setState(() => ({ error: 'api'}));
                        setError(error);
                    });
                }
            }
        }
    }, [loggedIn, state])

    useEffect(() => {
        if (loggedIn && (state === 'load' || state === 'refresh')) {
            refresh();
        }

        if (!loggedIn && state === 'loaded') {
            setFetchUnreadOnly(process.env.OUTLOOK_FETCH_UNREAD_ONLY.toLowerCase() === "true");
            setMessages([]);
            setState('load');
            setUserPhotos({});
            setRenderCount(0);
        }
    }, [loggedIn, refresh, state])

    useEffect(() => {
        let timerId;

        function startInteval() {
            stopInteval();
            // only start if document isn't hidden
            if (!document.hidden) {
                logger.debug('Microsoft mail starting interval');

                timerId = setInterval(() => {
                    setState('refresh');
                }, refreshInterval);
            }
        }

        function stopInteval() {
            if (timerId) {
                logger.debug('Microsoft mail stopping interval');
                clearInterval(timerId)
                timerId = undefined;
            }
        }

        function visibilitychangeListener() {
            logger.debug('Microsoft mail visiblity changed');
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
            fetchUnreadOnlyLabel,
            messageCount,
            unreadMessageCount,
            messages,
            refresh: () => { setState('refresh') },
            state
        }
    }, [ error, fetchUnreadOnlyLabel, messageCount, unreadMessageCount, messages, renderCount, state ]);

    useEffect(() => {
        logger.debug('MicrosoftMailProvider mounted');

        return () => {
            logger.debug('MicrosoftMailProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MicrosoftMailProvider.propTypes = {
    children: PropTypes.object.isRequired
}

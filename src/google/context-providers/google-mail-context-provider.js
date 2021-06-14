import React, { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';
import PropTypes from 'prop-types';

import { useUserInfo } from '@ellucian/experience-extension-hooks';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/mail-context-hooks';
import { getMessagesFromThreads } from '../util/gmail';

const refreshInterval = 60000;

function getValueFromArray(data, name, defaultValue) {
    return ((data || []).find(item => item.name === name) || {}).value || defaultValue;
}

function isToday(dateToCheck) {
    const today = new Date();
    return today.getFullYear() === dateToCheck.getFullYear() &&
        today.getMonth() === dateToCheck.getMonth() &&
        today.getDate() === dateToCheck.getDate()
}

export function MailProvider({children}) {
    const { locale } = useUserInfo();
    const { email, loggedIn, setLoggedIn } = useAuth();

    const [error, setError] = useState(false);
    const [state, setState] = useState('init');
    const [messages, setMessages] = useState();

    const dateFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'short'})
    }, [locale]);

    const timeFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { timeStyle: 'short'})
    }, [locale]);

    useEffect(() => {
        async function refresh() {
            if (process.env.NODE_ENV === 'development') {
                console.log(`${state}ing gmail`);
            }
            try {
                const newMessages = await getMessagesFromThreads();

                // transform to what UI needs
                const transformedMessages = newMessages.map( message => {
                    const {
                        id,
                        labelIds,
                        payload: {
                            headers,
                            parts
                        },
                        snippet: body
                    } = message;

                    const receivedDate = new Date(getValueFromArray(headers, 'Date', undefined));

                    const unread = labelIds.includes('UNREAD');
                    const from = getValueFromArray(headers, 'From', 'Unknown');
                    const fromMatches = from.match(/'?([^<>']*)'?\s*<(.*)>/);
                    const fromName = fromMatches[1].trim();
                    const fromEmail = fromMatches[2].trim().toLocaleLowerCase();
                    const fromNameSplit = fromName.split(/[, ]/);
                    const firstName = fromName.includes(',') ? fromNameSplit[2] : (fromNameSplit[0] || '');
                    const fromInitial = firstName.slice(0, 1);

                    const subject = getValueFromArray(headers, 'Subject', 'No Subject');

                    const messageUrl = `https://mail.google.com/mail/?authuser=${email}#all/${id}`;

                    const hasAttachment = parts && parts.some(part => part.filename !== '');

                    const received = isToday(receivedDate) ? timeFormater.format(receivedDate) : dateFormater.format(receivedDate);

                    return {
                        body,
                        id,
                        fromEmail,
                        fromInitial,
                        fromName,
                        hasAttachment,
                        messageUrl,
                        received,
                        receivedDate,
                        subject,
                        unread
                    }
                });

                // ensure sorted by recieved date
                transformedMessages.sort((left, right) => right.receivedDate.getTime() - left.receivedDate.getTime());

                unstable_batchedUpdates(() => {
                    setMessages(() => transformedMessages);
                    setState('loaded');
                })
            } catch (error) {
                // did we get logged out or credentials were revoked?
                if (error && error.status === 401) {
                    setLoggedIn(false);
                } else {
                    console.error('gapi failed', error);
                    unstable_batchedUpdates(() => {
                        setError(error);
                        setState(() => ({ error: 'api'}));
                    })
                }
            }
        }

        if (loggedIn && (state === 'load' || state === 'refresh')) {
            refresh();
        }
    }, [dateFormater, loggedIn, state, setState, timeFormater])

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

        const { gapi } = window;
        if (gapi && loggedIn) {
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

    useEffect(() => {
        if (loggedIn) {
            setState(messages ? 'refresh' : 'load');
            // refreshMessageList();
        } else if (state === 'loaded') {
            setMessages(undefined);
            setState('load');
        }
    }, [ loggedIn ])

    const contextValue = useMemo(() => {
        return {
            error,
            messages,
            openMail: () => {
                window.open(`https://mail.google.com?authuser=${email}`, '_blank');
            },
            refresh: () => { setState('refresh') },
            state
        }
    }, [ messages, state ]);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('MailProvider mounted');

            return () => {
                console.log('MailProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MailProvider.propTypes = {
    children: PropTypes.object.isRequired
}

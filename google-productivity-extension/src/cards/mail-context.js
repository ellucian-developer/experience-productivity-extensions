import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';
import PropTypes from 'prop-types';

import { useUserInfo } from '@ellucian/experience-extension-hooks';

import { useAuth } from './auth-context';

const refreshInterval = 60000;

const Context = createContext()

function getValueFromArray(data, name, defaultValue) {
	return ((data || []).find(item => item.name === name) || {}).value || defaultValue;
}

export function MailProvider({children}) {
	const { locale } = useUserInfo();
    const { gapi, loggedIn } = useAuth();

    const [state, setState] = useState('loading');
    const [messages, setMessages] = useState();
    const [messagesById, setMessagesById] = useState({});

    const dateFormater = useMemo(() => {
		return new Intl.DateTimeFormat(locale, { dateStyle: 'short'})
	}, [locale]);

    const loadMessageData = useCallback(async (message) => {
        if (message.dataRead) {
            return;
        }
        try {
            const response = await gapi.client.gmail.users.messages.get({
                userId: 'me',
                id: message.id
            });

            const data = JSON.parse(response.body);

            const {
                labelIds,
                payload: {
                    headers
                },
                snippet: summary
            } = data;
            const receivedDate = new Date(getValueFromArray(headers, 'Date', undefined));

            const unread = labelIds.includes('UNREAD');
            const from = getValueFromArray(headers, 'From', 'Unknown');
            const fromMatches = from.match(/"?([^<>"]*)"?\s*<(.*)>/);
            const fromName = fromMatches[1].trim();
            const fromEmail = fromMatches[2].trim();
            const fromNameSplit = fromName.split(/[, ]/);
            const firstName = (fromNameSplit.length !== 3 ? fromNameSplit[0] : fromNameSplit[2]) || '';
            const lastName = (fromNameSplit.length !== 3 ? fromNameSplit[1] : fromNameSplit[0]) || '';
            const fromInitials = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`;

            const subject = getValueFromArray(headers, 'Subject', 'No Subject');

            Object.assign(message, {
                dataRead: true,
                unread,
                receivedDate: dateFormater.format(receivedDate),
                fromName,
                fromInitials,
                fromEmail,
                subject,
                body: summary
            });
        } catch (error) {
            console.error('gapi failed', error);
            setState(() => ({ error: 'api'}));
        }
    }, [dateFormater, gapi, setState]);

    useEffect(() => {
        async function refresh() {
            if (process.env.NODE_ENV === 'development') {
                console.log('refreshing gmail');
            }
            try {
                const response = await gapi.client.gmail.users.messages.list({
                    userId: 'me',
                    maxResults: 10
                });

                const data = JSON.parse(response.body);

                const newMessages = [];
                const newMessagesById = {};
                const loadPromises = [];
                for (const message of data.messages) {
                    const { id } = message;
                    const newMessage = messagesById[id] || { id }

                    loadPromises.push(loadMessageData(newMessage));

                    newMessages.push(newMessage);
                    newMessagesById[id] = newMessage;
                }

                await Promise.all(loadPromises);

                unstable_batchedUpdates(() => {
                    setMessagesById(() => newMessagesById);
                    setMessages(() => newMessages);
                    setState('loaded');
                })
            } catch (error) {
                console.error('gapi failed', error);
                setState(() => ({ error: 'api'}));
            }
        }

        if (state === 'refresh') {
            refresh();
        }
    }, [messagesById, state, setMessages, setMessagesById, setState])

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
    }, [gapi, loggedIn, setState]);

	useEffect(() => {
		if (gapi && loggedIn) {
            setState('refresh');
            // refreshMessageList();
		}
	}, [ gapi, loggedIn ])

    const contextValue = useMemo(() => {
        return {
            messages,
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

export function useMail() {
    return useContext(Context);
}

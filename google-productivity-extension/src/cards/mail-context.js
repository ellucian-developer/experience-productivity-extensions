import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useUserInfo } from '@ellucian/experience-extension-hooks';

import { useAuth } from './auth-context';

const Context = createContext()

function getValueFromArray(data, name, defaultValue) {
	return ((data || []).find(item => item.name === name) || {}).value || defaultValue;
}


export function MailProvider({children}) {
	const { locale } = useUserInfo();
    const { gapi, loggedIn } = useAuth();

    const [unread, setUnread] = useState();
    const [messages, setMessages] = useState();

    const dateFormater = useMemo(() => {
		return new Intl.DateTimeFormat(locale, { dateStyle: 'short'})
	}, [locale]);

	useEffect(() => {
		if (gapi && loggedIn) {

            // find the unread count
			(async () => {
				try {
					const response = await gapi.client.gmail.users.messages.list({
                        userId: 'me',
						maxResults: 10
						// q: 'is:unread'
					});

					const data = JSON.parse(response.body);
                    setUnread(data.resultSizeEstimate);
					setMessages(() => data.messages);
				} catch (error) {
					console.error('gapi failed', error);
				}
			})();
		}
	}, [ gapi, loggedIn ])

    useEffect(() => {
        if (messages && messages.length > 0) {
            for (const message of messages) {
                if (!message.data) {
                    // load the message data
                    (async () => {
                        try {
                            const response = await gapi.client.gmail.users.messages.get({
                                userId: 'me',
                                id: message.id
                            });

                            const data = JSON.parse(response.body);
                            message.data = data;

                            const {
                                payload: {
                                    headers
                                },
                                snippet: summary
                            } = data;
                            const receivedDate = new Date(getValueFromArray(headers, 'Date', undefined));

                            const from = getValueFromArray(headers, 'From', 'Unknown');
                            const fromMatches = from.match(/"?([^<>"]*)"?\s*<(.*)>/);
                            const fromName = fromMatches[1].trim();
                            const fromEmail = fromMatches[2].trim();
                            const fromNameSplit = fromName.split(/[, ]/);
                            const firstName = (fromNameSplit.length !== 3 ? fromNameSplit[0] : fromNameSplit[2]) || '';
                            const lastName = (fromNameSplit.length !== 3 ? fromNameSplit[1] : fromNameSplit[0]) || '';
                            const fromInitials = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`;

                            const subject = getValueFromArray(headers, 'Subject', 'No Subject');


                            data.receivedDate = dateFormater.format(receivedDate);
                            data.headerFrom = from;
                            data.fromName = fromName;
                            data.fromInitials = fromInitials;
                            data.fromEmail = fromEmail;
                            data.subject = subject;
                            data.body = summary;

                            // create a new messages to cause re-render
                            setMessages([...messages])
                        } catch (error) {
                            console.error('gapi failed', error);
                        }
                    })();
                }
            }
        }
    }, [messages]);

    const contextValue = useMemo(() => {
        return {
            messages,
            unread
        }
    }, [ messages, unread ]);

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

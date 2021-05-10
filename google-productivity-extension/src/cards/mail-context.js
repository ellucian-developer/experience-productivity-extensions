import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useAuth } from './auth-context';

const Context = createContext()

export function MailProvider({children}) {
    const { gapi, loggedIn } = useAuth();

    const [unread, setUnread] = useState();
    const [messages, setMessages] = useState();

    const contextValue = useMemo(() => {
        return {
            messages,
            unread
        }
    }, [ messages, unread ]);

	useEffect(() => {
		if (gapi && loggedIn) {

            // find the unread count
			(async () => {
				try {
					const mailPromise = gapi.client.gmail.users.messages.list({
                        userId: 'me',
						maxResults: 10,
						q: 'is:unread'
					});

                    const response = await mailPromise;

					const data = JSON.parse(response.body);
                    setUnread(data.resultSizeEstimate);
					setMessages(() => data.messages);
				} catch (error) {
					console.error('gapi failed', error);
				}
			})();
		}
	}, [ gapi, loggedIn ])

    /*
    useEffect(() => {
        if (messages && messages.length > 0) {
            for (const message of messages) {
                if (!message.data) {
                    // load the message data
                    (async () => {
                        try {
                            const mailPromise = gapi.client.gmail.users.messages.list({
                                userId: 'me',
                                maxResults: 10,
                                q: 'is:unread'
                            });

                            const response = await mailPromise;

                            const data = JSON.parse(response.body);
                            setUnread(data.resultSizeEstimate);
                            setMessages(() => data.messages);
                        } catch (error) {
                            console.error('gapi failed', error);
                        }
                    })();
                }
            }
        }
    }, [messages]);
    */

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

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useUserInfo } from '@ellucian/experience-extension-hooks';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/mail-context-hooks';
import { refresh } from '../util/gmail';

const refreshInterval = 60000;

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
        if (loggedIn && (state === 'load' || state === 'refresh')) {
            refresh({dateFormater, email, setError, setLoggedIn, setMessages, setState, state, timeFormater });
        }
    }, [dateFormater, loggedIn, state, timeFormater])

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

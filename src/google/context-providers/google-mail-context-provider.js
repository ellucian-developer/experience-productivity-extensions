// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useUserInfo } from '@ellucian/experience-extension/extension-utilities';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/mail-context-hooks';
import { refresh } from '../util/gmail';

import log from 'loglevel';
const logger = log.getLogger('Google');

const refreshInterval = 60000;

export function MailProvider({children}) {
    const { locale } = useUserInfo();
    const { user, loggedIn, setLoggedIn } = useAuth();

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
            refresh({dateFormater, user, setError, setLoggedIn, setMessages, setState, state, timeFormater });
        }
    }, [dateFormater, user, loggedIn, state, timeFormater])

    useEffect(() => {
        let timerId;

        function startInteval() {
            stopInteval();
            // only start if document isn't hidden
            if (!document.hidden) {
                logger.debug('Google mail starting interval');

                timerId = setInterval(() => {
                    setState('refresh');
                }, refreshInterval);
            }
        }

        function stopInteval() {
            if (timerId) {
                logger.debug('Google mail stopping interval');
                clearInterval(timerId)
                timerId = undefined;
            }
        }

        function visibilitychangeListener() {
            logger.debug('Google mail visiblity changed');
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
                window.open(`https://mail.google.com?authuser=${user?.authUser}`, '_blank');
            },
            refresh: () => { setState('refresh') },
            state
        }
    }, [ messages, state ]);

    useEffect(() => {
        logger.debug('GoogleMailProvider mounted');

        return () => {
            logger.debug('GoogleMailProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MailProvider.propTypes = {
    children: PropTypes.object.isRequired
}

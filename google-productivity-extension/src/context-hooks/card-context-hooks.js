import React, { createContext, useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { default as OpenDriveButton } from '../components/GoogleDriveOpenButton';
import { default as LoginButton } from '../components/GoogleLoginButton';
import { default as OpenMailButton } from '../components/GmailOpenButton';

const CardContext = createContext()

export function CardProvider({children, intl}) {
    const contextValue = useMemo(() => {
        return {
            intl,
            components: {
                OpenDriveButton,
                OpenMailButton,
                LoginButton
            }
        }
    }, [ intl ]);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('CardProvider mounted');

            return () => {
                console.log('CardProvider unmounted');
            }
        }, []);
    }

    return (
        <CardContext.Provider value={contextValue}>
            {children}
        </CardContext.Provider>
    )
}

CardProvider.propTypes = {
    children: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired
}

export function useIntl() {
    const context = useContext(CardContext);

    return {
        intl: context.intl
    };
}

export function useComponents() {
    const context = useContext(CardContext);

    return context.components;
}

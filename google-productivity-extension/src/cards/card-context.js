import React, { createContext, useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const CardContext = createContext()

export function CardProvider({children, intl}) {
    const contextValue = useMemo(() => {
        return {
            intl
        }
    }, [
        intl
    ]);

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

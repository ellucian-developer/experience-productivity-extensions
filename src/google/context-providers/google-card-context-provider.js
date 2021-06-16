import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../../context-hooks/card-context-hooks';

import buttonImage from '../images/google-logo.svg';

export function CardProvider({children, intl}) {
    const contextValue = useMemo(() => {
        return {
            intl,
            components: {
                buttonImage,
                noEmail: {
                    titleId: 'google.noEmailTitle',
                    messageId: 'google.noEmailMessage'
                },
                noFiles: {
                    titleId: 'google.noFilesTitle',
                    messageId: 'google.noFilesMessage'
                }
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
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

CardProvider.propTypes = {
    children: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired
}
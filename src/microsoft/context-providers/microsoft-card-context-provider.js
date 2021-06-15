import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../../context-hooks/card-context-hooks';

import buttonImage from '../images/microsoft-logo.svg';

export function MicrosoftCardProvider({children, intl}) {
    const contextValue = useMemo(() => {
        return {
            intl,
            components: {
                buttonImage,
                noEmail: {
                    titleId: 'microsoft.noEmailTitle',
                    messageId: 'microsoft.noEmailMessage'
                },
                noFiles: {
                    titleId: 'microsoft.noFilesTitle',
                    messageId: 'microsoft.noFilesMessage'
                }
            }
        }
    }, [ intl ]);

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('MicrosoftCardProvider mounted');
            return () => {
                console.log('MicrosoftCardProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MicrosoftCardProvider.propTypes = {
    children: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired
}
// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../../context-hooks/card-context-hooks';

import buttonImage from '../images/google-logo.svg';

import log from 'loglevel';
const logger = log.getLogger('Google');

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

    useEffect(() => {
        logger.debug('GoogleCardProvider mounted');

        return () => {
            logger.debug('GoogleCardProvider unmounted');
        }
    }, []);

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
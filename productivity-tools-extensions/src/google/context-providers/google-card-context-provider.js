import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../../context-hooks/card-context-hooks';
import { default as OpenDriveButton } from '../components/GoogleDriveOpenButton';
import { default as LoginButton } from '../components/GoogleLoginButton';
import { default as LogoutButton } from '../../components/SignOutButton';
import { default as NoFiles } from '../../components/NoDriveFiles';
import { default as NoEmail } from '../../components/NoEmails';

const googleRenderedLoginButton = false;

export function CardProvider({children, intl}) {
    const contextValue = useMemo(() => {
        return {
            intl,
            components: {
                OpenDriveButton,
                LogoutButton,
                // eslint-disable-next-line react/display-name
                LoginButton: (props) => (<LoginButton googleRender={googleRenderedLoginButton} {...props}/>),
                NoFiles,
                NoEmail
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
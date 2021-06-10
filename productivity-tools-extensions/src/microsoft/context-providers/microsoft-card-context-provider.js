import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../../context-hooks/card-context-hooks';
import { default as NoFiles } from '../../components/NoDriveFiles';
import { default as NoEmail } from '../components/MicrosoftNoEmail';
import { default as LoginButton } from '../components/MicrosoftSignInButton';
import { default as LogoutButton } from '../components/MicrosoftSignOutButton';

const renderedLoginButton = false;

export function MicrosoftCardProvider({children, intl}) {
    const contextValue = useMemo(() => {
        return {
            intl,
            components: {
            //     OpenDriveButton,
                LogoutButton,
            // eslint-disable-next-line react/display-name
                LoginButton: (props) => (<LoginButton microsoftRender={renderedLoginButton} {...props}/>),
                NoFiles,
                NoEmail
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
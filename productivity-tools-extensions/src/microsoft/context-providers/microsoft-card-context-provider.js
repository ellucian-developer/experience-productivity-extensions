import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Context } from '../../context-hooks/card-context-hooks';
import { default as MsNoFiles } from '../components/MicrosoftNoDriveFiles';
import { default as MsNoEmail } from '../components/MicrosoftNoEmail';
import { default as LoginButton } from '../components/MicrosoftSignInButton';
import { default as MsLogoutButton } from '../components/MicrosoftSignOutButton';

const renderedLoginButton = false;

export function MicrosoftCardProvider({children, intl}) {
    const contextValue = useMemo(() => {
        return {
            intl,
            components: {
            //     OpenDriveButton,
                MsLogoutButton,
            // eslint-disable-next-line react/display-name
                MsLoginButton: (props) => (<LoginButton microsoftRender={renderedLoginButton} {...props}/>),
                MsNoFiles,
                MsNoEmail
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
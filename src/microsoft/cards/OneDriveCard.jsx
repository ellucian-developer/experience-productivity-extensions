/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { MicrosoftCardProvider } from '../context-providers/microsoft-card-context-provider';
import { MicrosoftAuthProvider } from '../context-providers/microsoft-auth-context-provider';
import { MicrosoftDriveProvider } from '../context-providers/microsoft-drive-context-provider';

import OneDrive from '../../components/OneDrive';

function OneDriveCard(props) {
    return (
        <ExtensionProvider {...props}>
            <MicrosoftCardProvider {...props}>
                <MicrosoftAuthProvider>
                    <MicrosoftDriveProvider>
                        <OneDrive/>
                    </MicrosoftDriveProvider>
                </MicrosoftAuthProvider>
            </MicrosoftCardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(OneDriveCard)
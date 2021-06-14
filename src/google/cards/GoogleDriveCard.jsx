/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { CardProvider } from '../context-providers/google-card-context-provider';
import { AuthProvider } from '../context-providers/google-auth-context-provider';
import { DriveProvider } from '../context-providers/google-drive-context-provider';

import Drive from '../../components/Drive';

function GoogleDriveCard(props) {
    return (
        <ExtensionProvider {...props}>
            <CardProvider {...props}>
                <AuthProvider>
                    <DriveProvider>
                        <Drive/>
                    </DriveProvider>
                </AuthProvider>
            </CardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(GoogleDriveCard)
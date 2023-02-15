// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { MicrosoftCardProvider } from '../context-providers/microsoft-card-context-provider';
import { MicrosoftAuthProvider } from '../context-providers/microsoft-auth-context-provider';
import { MicrosoftDriveProvider } from '../context-providers/microsoft-drive-context-provider';

import Drive from '../../components/Drive';

import { initializeLogging } from '../../util/log-level';
initializeLogging('Microsoft');

function OneDriveCard(props) {
    return (
        <MicrosoftCardProvider {...props}>
            <MicrosoftAuthProvider>
                <MicrosoftDriveProvider>
                    <Drive/>
                </MicrosoftDriveProvider>
            </MicrosoftAuthProvider>
        </MicrosoftCardProvider>
    )
}

export default withIntl(OneDriveCard)
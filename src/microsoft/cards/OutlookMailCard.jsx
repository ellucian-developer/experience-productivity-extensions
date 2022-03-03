// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { MicrosoftCardProvider } from '../context-providers/microsoft-card-context-provider';
import { MicrosoftAuthProvider } from '../context-providers/microsoft-auth-context-provider';
import { MicrosoftMailProvider } from '../context-providers/microsoft-mail-context-provider';

import Mail from '../../components/Mail';

import { initializeLogging } from '../../util/log-level';
initializeLogging('Google');

function OutlookMailCard(props) {
    return (
        <ExtensionProvider {...props}>
            <MicrosoftCardProvider {...props}>
                <MicrosoftAuthProvider>
                    <MicrosoftMailProvider>
                        <Mail/>
                    </MicrosoftMailProvider>
                </MicrosoftAuthProvider>
            </MicrosoftCardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(OutlookMailCard);

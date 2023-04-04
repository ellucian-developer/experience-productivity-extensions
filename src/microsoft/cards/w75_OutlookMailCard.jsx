/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { MicrosoftCardProvider } from '../context-providers/microsoft-card-context-provider';
import { MicrosoftAuthProvider } from '../context-providers/microsoft-auth-context-provider';
import { MicrosoftMailProvider } from '../context-providers/w75_microsoft-mail-context-provider';

import Mail from '../../components/w75_Mail';

import { initializeLogging } from '../../util/log-level';
initializeLogging('Microsoft');

function OutlookMailCard(props) {
    return (
        <MicrosoftCardProvider {...props}>
            <MicrosoftAuthProvider>
                <MicrosoftMailProvider>
                    <Mail/>
                </MicrosoftMailProvider>
            </MicrosoftAuthProvider>
        </MicrosoftCardProvider>
    )
}

export default withIntl(OutlookMailCard);

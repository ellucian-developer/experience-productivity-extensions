/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { MicrosoftCardProvider } from '../context-providers/microsoft-card-context-provider';
import { MicrosoftAuthProvider } from "../context-providers/microsoft-auth-context-provider";
import { MicrosoftMailProvider } from "../context-providers/microsoft-mail-context-provider";

import OutlookMail from '../../components/OutlookMail';

function OutlookMailCard(props) {
    return (
        <ExtensionProvider {...props}>
            <MicrosoftCardProvider {...props}>
                <MicrosoftAuthProvider>
                    <MicrosoftMailProvider>
                        <OutlookMail/>
                    </MicrosoftMailProvider>
                </MicrosoftAuthProvider>
            </MicrosoftCardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(OutlookMailCard);

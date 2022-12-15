// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { CardProvider } from '../context-providers/google-card-context-provider';
import { AuthProvider } from '../context-providers/google-auth-context-provider';
import { MailProvider } from '../context-providers/google-mail-context-provider';

import Mail from '../../components/Mail';

import { initializeLogging } from '../../util/log-level';
initializeLogging('Google');

function GmailCard(props) {
    return (
        <ExtensionProvider {...props}>
            <CardProvider {...props}>
                <AuthProvider id="GMail">
                    <MailProvider>
                        <Mail/>
                    </MailProvider>
                </AuthProvider>
            </CardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(GmailCard);
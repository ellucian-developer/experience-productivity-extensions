/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from "./ReactIntlProviderWrapper";
import { CardProvider } from '../context-hooks/card-context-hooks';
import { AuthProvider } from "../context-hooks/google/auth-context";
import { MailProvider } from "../context-hooks/google/mail-context-hooks";

import Mail from '../components/Mail';

function GmailCard(props) {
    return (
        <ExtensionProvider {...props}>
            <CardProvider {...props}>
                <AuthProvider>
                    <MailProvider>
                        <Mail/>
                    </MailProvider>
                </AuthProvider>
            </CardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(GmailCard);
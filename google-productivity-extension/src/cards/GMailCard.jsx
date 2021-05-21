/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

// eslint-disable-next-line import/no-unresolved
import { withIntl } from "common/components/ReactIntlProviderWrapper";

// eslint-disable-next-line import/no-unresolved
import { CardProvider } from 'common/context-hooks/card-context-hooks';
import { AuthProvider } from "../context-hooks/google/auth-context-provider";
import { MailProvider } from "../context-hooks/google/mail-context-provider";

// eslint-disable-next-line import/no-unresolved
import Mail from 'common/components/Mail';

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
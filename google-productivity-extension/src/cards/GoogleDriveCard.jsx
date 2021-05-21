/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from "./ReactIntlProviderWrapper";
// eslint-disable-next-line import/no-unresolved
import { CardProvider } from 'common/context-hooks/card-context-hooks';
import { AuthProvider } from "../context-hooks/google/auth-context-provider";
import { DriveProvider } from "../context-hooks/google/drive-context-provider";

// eslint-disable-next-line import/no-unresolved
import Drive from 'common/components/Drive';

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
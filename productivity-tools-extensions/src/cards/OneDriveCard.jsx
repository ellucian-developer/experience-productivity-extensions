/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from "../components/ReactIntlProviderWrapper";

import { CardProvider } from '../context-hooks/card-context-hooks';
import { MicrosoftAuthProvider } from "../context-providers/microsoft-auth-context-provider";
import { MicrosoftDriveProvider } from "../context-providers/microsoft-drive-context-provider";

import OneDrive from '../components/OneDrive';

function OneDriveCard(props) {
    return (
        <ExtensionProvider {...props}>
            <CardProvider {...props}>
                <MicrosoftAuthProvider>
                    <MicrosoftDriveProvider>
                        <OneDrive/>
                    </MicrosoftDriveProvider>
                </MicrosoftAuthProvider>
            </CardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(OneDriveCard)
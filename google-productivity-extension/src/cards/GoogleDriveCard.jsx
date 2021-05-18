/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import { ExtensionProvider } from '@ellucian/experience-extension-hooks';

import { withIntl } from "./ReactIntlProviderWrapper";
import { CardProvider } from '../context-hooks/card-context-hooks';
import { AuthProvider } from "../context-hooks/google/auth-context";
import { DriveProvider } from "../context-hooks/google/drive-context-hooks";

import Drive from '../components/Drive';

function GoogleDriveCard(props) {
    return (
        <ExtensionProvider {...props}>
			<CardProvider {...props}>
				<AuthProvider type='google'>
					<DriveProvider>
						<Drive/>
					</DriveProvider>
				</AuthProvider>
			</CardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(GoogleDriveCard)
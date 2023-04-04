// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React from 'react';

import { IMAGES } from '@ellucian/react-design-system/core';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import FullCardMessage from './w75_FullCardLinkedMessage';

function NoDriveFiles() {
    const { intl } = useIntl();
    const { noFiles } = useComponents();

    if (!noFiles) {
        return null;
    }

    return (
        <FullCardMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: noFiles.titleId})}
            message={intl.formatMessage({id: noFiles.messageId})}
            url={intl.formatMessage({id: 'oneDriveURL'})}
            urlTooltip={intl.formatMessage({id: 'oneDriveLinkMsg'})}
        />
    );
}

export default NoDriveFiles;

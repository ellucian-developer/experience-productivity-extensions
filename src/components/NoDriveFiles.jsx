import React from 'react';

import { IMAGES } from '@ellucian/react-design-system/core';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import FullCardMessage from './FullCardMessage';

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
        />
    );
}

export default NoDriveFiles;

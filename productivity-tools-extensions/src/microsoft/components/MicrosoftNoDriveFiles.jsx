import React from 'react';

import { IMAGES } from '@hedtech/react-design-system/core';

import { useIntl } from '../../context-hooks/card-context-hooks';

import FullCardMessage from '../../components/FullCardMessage';

export default function MicrosoftNoDriveFiles() {
    const { intl } = useIntl();

    return (
        <FullCardMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: 'microsoft.noFilesTitle'})}
            message={intl.formatMessage({id: 'microsoft.noFilesMessage'})}
        />
    );
}
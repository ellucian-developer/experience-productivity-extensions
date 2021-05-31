import React from 'react';

import { IMAGES } from '@hedtech/react-design-system/core';

import { useIntl } from '../../context-hooks/card-context-hooks';

import FullCardMessage from '../../components/FullCardMessage';

export default function GmailNoEmail() {
    const { intl } = useIntl();

    return (
        <FullCardMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: 'google.noEmailTitle'})}
            message={intl.formatMessage({id: 'google.noEmailMessage'})}
        />
    );
}
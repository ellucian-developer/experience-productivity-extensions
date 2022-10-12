import React from 'react';

import { IMAGES } from '@ellucian/react-design-system/core';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import FullCardLinkedMessage from './w75_FullCardLinkedMessage';

function NoEvents() {
    const { intl } = useIntl();
    const { noEvents } = useComponents();

    if (!noEvents) {
        return null;
    }

    return (
        <FullCardLinkedMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: noEvents.titleId})}
            message={intl.formatMessage({id: noEvents.messageId})}
            url={intl.formatMessage({id: 'outlookCalendarURL'})}
        />
    );
}

export default NoEvents;

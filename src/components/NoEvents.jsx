// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React from 'react';

import { IMAGES } from '@ellucian/react-design-system/core';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import FullCardMessage from './FullCardMessage';

function NoEvents() {
    const { intl } = useIntl();
    const { noEvents } = useComponents();

    if (!noEvents) {
        return null;
    }

    return (
        <FullCardMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: noEvents.titleId})}
            message={intl.formatMessage({id: noEvents.messageId})}
        />
    );
}

export default NoEvents;

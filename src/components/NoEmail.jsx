// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

import React from 'react';

import { IMAGES } from '@ellucian/react-design-system/core';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import FullCardMessage from './FullCardMessage';

function NoEmails() {
    const { intl } = useIntl();
    const { noEmail } = useComponents();

    if (!noEmail) {
        return null;
    }

    return (
        <FullCardMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: noEmail.titleId})}
            message={intl.formatMessage({id: noEmail.messageId})}
        />
    );
}

export default NoEmails;

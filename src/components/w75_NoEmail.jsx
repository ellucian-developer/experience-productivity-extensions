import React from 'react';

import { IMAGES } from '@ellucian/react-design-system/core';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import FullCardLinkedMessage from './w75_FullCardLinkedMessage';

function NoEmails() {
    const { intl } = useIntl();
    const { noEmail } = useComponents();

    if (!noEmail) {
        return null;
    }

    return (
        <FullCardLinkedMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: noEmail.titleId})}
            message={intl.formatMessage({id: noEmail.messageId})}
            url={intl.formatMessage({id: 'outlookURL'})}
        />
    );
}

export default NoEmails;

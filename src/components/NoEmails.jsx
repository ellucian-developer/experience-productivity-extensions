import React from 'react';
import PropTypes from 'prop-types';

import { IMAGES } from '@ellucian/react-design-system/core';

import { useIntl } from '../context-hooks/card-context-hooks';

import FullCardMessage from './FullCardMessage';

function NoEmails(props) {
    const { intl } = useIntl();

    return (
        <FullCardMessage
            imageName={IMAGES.NO_TASKS}
            title={intl.formatMessage({id: props.title})}
            message={intl.formatMessage({id: props.message})}
        />
    );
}

NoEmails.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
};

export default NoEmails;

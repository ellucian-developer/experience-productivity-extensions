/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing30 } from '@ellucian/react-design-system/core/styles/tokens';

import { useIntl } from '../../context-hooks/card-context-hooks';

import GoogleImage from '../images/btn_google_light_normal_ios.svg';

const styles = () => ({
    button: {
        cursor: 'pointer'
    },
    image: {
        marginRight: spacing30
    }
});

function GoogleDriveOpenButton({ classes, onClick }) {
    const { intl } = useIntl();

    return (
        <Button className={classes.button} onClick={onClick}>
            <img className={classes.image} src={GoogleImage}/>
            {intl.formatMessage({id: 'google.openDrive'})}
        </Button>
    );
}

GoogleDriveOpenButton.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(GoogleDriveOpenButton);
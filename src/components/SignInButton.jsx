/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing30 } from '@ellucian/react-design-system/core/styles/tokens';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

const styles = () => ({
    button: {
        cursor: 'pointer'
    },
    image: {
        marginRight: spacing30
    }
});

function SignInButton({ classes, onClick}) {
    const { intl } = useIntl();
    const { buttonImage } = useComponents();

    return (
        <Button className={classes.button} color='secondary' onClick={onClick}>
            <img className={classes.image} src={buttonImage}/>
            {intl.formatMessage({id: 'signIn'})}
        </Button>
    );
}

SignInButton.propTypes = {
    classes: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(SignInButton);
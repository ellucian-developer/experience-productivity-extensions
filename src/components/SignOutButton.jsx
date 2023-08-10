// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

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

function SignOutButton({classes, className = '', onClick}) {
    const { intl } = useIntl();
    const { buttonImage } = useComponents();


    return (
        <Button className={classnames(className, classes.button)} color='secondary' onClick={
            window.isInNativeApp() ? () => window.invokeNativeFunction('userSignOut', Math.random(), false)
                : onClick}>
            <img className={classes.image} src={buttonImage} />
            {intl.formatMessage({ id: 'signOut' })}
        </Button>
    );
}

SignOutButton.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(SignOutButton);
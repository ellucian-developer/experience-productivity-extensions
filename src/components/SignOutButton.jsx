/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import PropTypes from "prop-types";

import classnames from 'classnames';

import { Button } from "@ellucian/react-design-system/core";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import { spacing30 } from "@ellucian/react-design-system/core/styles/tokens";

import { useIntl } from '../context-hooks/card-context-hooks';

import microsoftLogo from '../images/microsoft-logo.svg';
import googleLogo from '../images/google-logo.svg';

const styles = () => ({
    button: {
        cursor: 'pointer'
    },
    image: {
        marginRight: spacing30
    }
});

function SignOutButton({classes, className = '', onClick, logo}) {
    const { intl } = useIntl();

    return (
        <Button className={classnames(className, classes.button)} color='secondary' onClick={onClick}>
            <img className={classes.image} src={logo === 'google' ? googleLogo : microsoftLogo}/>
            {intl.formatMessage({id: 'signOut'})}
        </Button>
    );
}

SignOutButton.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    logo: PropTypes.string
};

export default withStyles(styles)(SignOutButton);
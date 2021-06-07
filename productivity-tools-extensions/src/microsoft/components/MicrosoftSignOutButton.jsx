/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import PropTypes from "prop-types";

import classnames from 'classnames';

import { Button } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { spacing30 } from "@hedtech/react-design-system/core/styles/tokens";

import { useIntl } from '../../context-hooks/card-context-hooks';

import logo from '../images/ms_symbollockup_mssymbol_19.svg';

const styles = () => ({
    button: {
        cursor: 'pointer'
    },
    image: {
        marginRight: spacing30
    }
});

function MicrosoftSignOutButton({classes, className = '', onClick}) {
    const { intl } = useIntl();

    return (
        <Button className={classnames(className, classes.button)} color='secondary' onClick={onClick}>
            <img className={classes.image} src={logo}/>
            {intl.formatMessage({id: 'signOut'})}
        </Button>
    );
}

MicrosoftSignOutButton.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(MicrosoftSignOutButton);
/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import PropTypes from "prop-types";

import classnames from 'classnames';

import { Button } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { spacing30 } from "@hedtech/react-design-system/core/styles/tokens";

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

function GmailOpenButton(props) {
    const { classes, className = '', onClick } = props;
    const { intl } = useIntl();

    return (
        <Button className={classnames(className, classes.button)} onClick={onClick}>
            <img className={classes.image} src={GoogleImage}/>
            {intl.formatMessage({id: 'google.openGmail'})}
        </Button>
    );
}

GmailOpenButton.propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(GmailOpenButton);
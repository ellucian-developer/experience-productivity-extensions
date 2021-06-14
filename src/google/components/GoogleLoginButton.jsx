/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { v4 as uuidv4 } from 'uuid';

import { Button } from "@ellucian/react-design-system/core";
import { withStyles } from "@ellucian/react-design-system/core/styles";
import { spacing30 } from "@ellucian/react-design-system/core/styles/tokens";

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

function GoogleLoginButton({ classes, onClick, googleRender = false }) {
    const { intl } = useIntl();

    const [id] = useState(uuidv4());

    useEffect(() => {
        if (googleRender) {
            const { gapi } = window;
            if (gapi) {
                gapi.signin2.render(id, {theme: 'dark', longtitle: true})
            }
        }
    }, []);

    if (googleRender) {
        return (
            <div id={id}/>
        )
    } else {
        return (
            <Button className={classes.button} color='secondary' onClick={onClick}>
                <img className={classes.image} src={GoogleImage}/>
                {intl.formatMessage({id: 'signIn'})}
            </Button>
        );
    }
}

GoogleLoginButton.propTypes = {
    classes: PropTypes.object.isRequired,
    googleRender: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(GoogleLoginButton);
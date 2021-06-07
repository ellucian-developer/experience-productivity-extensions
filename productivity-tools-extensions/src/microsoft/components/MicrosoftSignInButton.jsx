/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import uuidv4 from 'uuid/v4';

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

function MicrosoftSignInButton({ classes, onClick, microsoftRender = false }) {
    const { intl } = useIntl();

    const [id] = useState(uuidv4());

    useEffect(() => {
        if (microsoftRender) {
            const { gapi } = window;
            if (gapi) {
                gapi.signin2.render(id, {theme: 'dark', longtitle: true})
            }
        }
    }, []);

    if (microsoftRender) {
        return (
            <div id={id}/>
        )
    } else {
        return (
            <Button className={classes.button} color='secondary' onClick={onClick}>
                <img className={classes.image} src={logo}/>
                {intl.formatMessage({id: 'signIn'})}
            </Button>
        );
    }
}

MicrosoftSignInButton.propTypes = {
    classes: PropTypes.object.isRequired,
    microsoftRender: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(MicrosoftSignInButton);
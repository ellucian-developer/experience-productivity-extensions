/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import PropTypes from "prop-types";

import { Button, Illustration, IMAGES, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { fontWeightNormal, spacing30, spacingSmall } from "@hedtech/react-design-system/core/styles/tokens";

import { useIntl } from '../context-hooks/card-context-hooks';

import GoogleSignInImage from '../images/btn_google_light_normal_ios.svg';

const styles = () => ({
    card: {
        flex: "1 0 auto",
        width: "100%",
        height: "100%",
        display: "flex",
        padding: spacingSmall,
        flexFlow: "column",
        alignItems: "center",
        justifyContent: "center",
        '& > *': {
            marginBottom: spacingSmall
        },
        '& :last-child': {
            marginBottom: '0px'
        }
    },
    fontWeightNormal: {
        fontWeight: fontWeightNormal
    },
    button: {
        cursor: 'pointer'
    },
    image: {
        marginRight: spacing30
    }
});

function GooglePermissions({ classes, login }) {
    const { intl } = useIntl();

    return (
        <div className={classes.card}>
            <Illustration name={IMAGES.ID_BADGE} />
            <Typography className={classes.fontWeightNormal} variant={"h3"} component='div'>
                {intl.formatMessage({id: 'google.permissionsRequested'})}
            </Typography>
            <Button className={classes.button} onClick={login}>
                <img className={classes.image} src={GoogleSignInImage}/>
                {'Sign In with Google'}
            </Button>
        </div>
    );
}

GooglePermissions.propTypes = {
    classes: PropTypes.object.isRequired,
    login: PropTypes.func.isRequired
};

export default withStyles(styles)(GooglePermissions);
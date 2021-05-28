/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import PropTypes from 'prop-types';

import { Illustration, Typography } from '@hedtech/react-design-system/core';
import { withStyles } from '@hedtech/react-design-system/core/styles';
import { colorTextNeutral600, fontWeightNormal, spacing40, spacing50 } from '@hedtech/react-design-system/core/styles/tokens';

const styles = () => ({
    card: {
        flex: '1 0 auto',
        height: '100%',
        display: 'flex',
        padding: spacing40,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    box: {
        width: '245px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        marginTop: spacing40,
        fontWeight: fontWeightNormal,
        color: colorTextNeutral600
    },
    message: {
        marginLeft: spacing50,
        marginRight: spacing50
    }
});

function GoogleLoginButton({ classes, imageName, title, message }) {

    return (
        <div className={classes.card}>
            <div className={classes.box}>
                <Illustration name={imageName} />
                <Typography className={classes.title} component='div' variant={'h3'}>
                    {title}
                </Typography>
                <Typography className={classes.message} component='div' align='center' variant={'body2'}>
                    {message}
                </Typography>
            </div>
        </div>
    );
}

GoogleLoginButton.propTypes = {
    classes: PropTypes.object.isRequired,
    imageName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
};

export default withStyles(styles)(GoogleLoginButton);
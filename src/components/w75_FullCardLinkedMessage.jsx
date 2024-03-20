/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import PropTypes from 'prop-types';

import { Illustration, Typography, TextLink } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { colorTextNeutral600, fontWeightNormal, spacing30, spacing40, spacing50 } from '@ellucian/react-design-system/core/styles/tokens';

import { useAuth } from '../context-hooks/auth-context-hooks';

import SignOutButton from './SignOutButton.jsx';

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
        marginTop: spacing30,
        fontWeight: fontWeightNormal,
        color: colorTextNeutral600
    },
    message: {
        marginLeft: spacing50,
        marginRight: spacing50
    },
    signout: {
        marginTop: spacing40,
        marginBottom: spacing40
    }
});

function FullCardLinkedMessage({ classes, imageName, title, message, url }) {
    const { logout } = useAuth();

    return (
        <div className={classes.card}>
            <div className={classes.box}>
                <Illustration name={imageName} />
                <Typography className={classes.title} component='div' variant={'h3'}>
                    {title}
                </Typography>
                <TextLink href={url} target='_blank'>
                    <Typography className={classes.message} component='div' align='center' variant={'body2'}>
                        {message}
                    </Typography>
                </TextLink>
                <SignOutButton className={classes.signout} onClick={logout}/>
            </div>
        </div>
    );
}

FullCardLinkedMessage.propTypes = {
    classes: PropTypes.object.isRequired,
    imageName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
};

export default withStyles(styles)(FullCardLinkedMessage);
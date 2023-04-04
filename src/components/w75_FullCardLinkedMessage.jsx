/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import PropTypes from 'prop-types';

import { Illustration, Typography, TextLink, Tooltip } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { colorTextNeutral600, fontWeightNormal, spacing10, spacing30, spacing40, spacing50 } from '@ellucian/react-design-system/core/styles/tokens';
import { Icon } from '@ellucian/ds-icons/lib';

import { useAuth } from '../context-hooks/auth-context-hooks';
// import { useIntl } from '../context-hooks/card-context-hooks';


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
    compose: {
        marginTop: spacing40,
        marginLeft: spacing50,
        marginRight: spacing50,
        paddingBottom: spacing10
    },
    signout: {
        marginTop: spacing40,
        marginBottom: spacing40
    }
});

function FullCardLinkedMessage({ classes, imageName, title, message, url, urlTooltip, composeUrl, composeUrlTooltip, composeLabel }) {
    // const { intl } = useIntl();
    const { logout } = useAuth();
    const defaultAllowCompose  = (process.env.ALLOW_COMPOSE === "true" || process.env.ALLOW_COMPOSE === "True" || process.env.ALLOW_COMPOSE === "TRUE");

    return (
        <div className={classes.card}>
            <div className={classes.box}>
                <Illustration name={imageName} />
                <Typography className={classes.title} component='div' variant={'h3'}>
                    {title}
                </Typography>
                <Tooltip title={urlTooltip} placement="top">
                <TextLink href={url} target='_blank'>
                    <Typography className={classes.message} component='div' align='center' variant={'body2'}>
                        {message}
                    </Typography>
                </TextLink>
                </Tooltip>
                {defaultAllowCompose && composeUrl && composeUrlTooltip && composeLabel && (
                    <div className={classes.compose}>
                    <Tooltip title={composeUrlTooltip}>
                    <TextLink href={composeUrl} target='_blank' >
                        <Typography component='div' align='center' variant={'body2'}>
                            <Icon name="add"/> {composeLabel}
                        </Typography>
                    </TextLink>
                    </Tooltip>
                    </div>
                )}
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
    url: PropTypes.string.isRequired,
    urlTooltip: PropTypes.string.isRequired,
    composeUrl: PropTypes.string.isRequired,
    composeUrlTooltip: PropTypes.string.isRequired,
    composeLabel: PropTypes.string.isRequired
};

export default withStyles(styles)(FullCardLinkedMessage);
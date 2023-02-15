// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { Divider, Illustration, IMAGES, Popper, Typography } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { colorBrandNeutral250, colorBrandNeutral300, fontWeightBold, fontWeightNormal, spacing30, spacing40, spacing50 } from '@ellucian/react-design-system/core/styles/tokens';

import { useExtensionControl, useUserInfo } from '@ellucian/experience-extension/extension-utilities';
import { useIntl } from '../context-hooks/card-context-hooks';
import { useAuth } from '../context-hooks/auth-context-hooks';
import { useDrive } from '../context-hooks/drive-context-hooks';

import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';
import NoDriveFiles from './NoDriveFiles';
import { prepareFiles } from '../util/drive';

const styles = () => ({
    card: {
        flex: '1 0 auto',
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: spacing40,
        flexFlow: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '& > *': {
            marginBottom: spacing40
        },
        '& :last-child': {
            marginBottom: '0px'
        }
    },
    content: {
        display: 'flex',
        flexFlow: 'column',
        marginLeft: spacing40,
        marginRight: spacing40,
        '& hr:last-of-type': {
            display: 'none'
        }
    },
    'row0': {
        paddingTop: '0px !important'
    },
    row: {
        paddingTop: spacing30,
        paddingBottom: spacing30,
        textDecoration: 'none',
        color: 'initial',
        '&:hover, &:focus': {
            backgroundColor: colorBrandNeutral250
        }
    },
    fileBox: {
        display: 'flex',
        padding: '0 9px',
        alignItems: 'center'
    },
    fileNameBox: {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'baseline'
    },
    fileIcon: {
        alignSelf: 'flex-start',
        marginTop: spacing30,
        marginRight: spacing40
    },
    fileIcon16: {
        width: '16px',
        height: '16px'
    },
    fileIcon24: {
        width: '24px',
        height: '24px'
    },
    fileName: {
        display: '-webkit-box',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        fontWeight: fontWeightBold
    },
    fileNamePopper: {
        paddingLeft: spacing50,
        paddingRight: spacing50
    },
    modified: {
        width: '100%',
        display: '-webkit-box',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden'
    },
    divider: {
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: colorBrandNeutral300
    },
    fontWeightNormal: {
        fontWeight: fontWeightNormal
    },
    devCard: {
        marginLeft: spacing40,
        marginRight: spacing40,
        marginBottom: spacing40
    },
    devButton: {
        marginBottom: spacing30
    },
    logoutBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing40,
        marginBottom: spacing40
    }
});


function Drive({ classes }) {
    const { setErrorMessage, setLoadingStatus } = useExtensionControl();
    const { locale } = useUserInfo();

    const { intl } = useIntl();

    const { error: authError, login, loggedIn, logout, state: authState } = useAuth();
    const { error: driveError, files } = useDrive();

    const [displayState, setDisplayState] = useState('init');

    const [popperContext, setPopperContext] = useState({ overflowedFileIds: []});

    const fileDateFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { month: 'short', day: '2-digit' })
    }, [locale]);

    const fileDateFormaterWithYear = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' })
    }, [locale]);

    const [contentNode, setContentNode] = useState();

    const contentRef = (node) => {
        setContentNode(node);
    }

    const fileNameRef = (node, id) => {
        if (node) {
            const { clientHeight, scrollHeight } = node;
            const { overflowedFileIds } = popperContext;
            if (clientHeight < scrollHeight) {
                // it is overflowing
                const index = overflowedFileIds.indexOf(id);
                if (index === -1) {
                    overflowedFileIds.push(id);
                }
            } else {
                // it is not overflowing, hide tool tip
                const index = overflowedFileIds.indexOf(id);
                if (index >= 0) {
                    overflowedFileIds.splice(index, 1);
                }
            }
        }
    }

    useEffect(() => {
        if (authError || driveError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'error.contentNotAvailable'}),
                textMessage: intl.formatMessage({id: 'error.contactYourAdministrator'}),
                iconName: 'warning'
            })
        } else if (loggedIn === false && authState === 'ready') {
            setDisplayState('loggedOut');
        } else if (files !== undefined) {
            setDisplayState('filesLoaded');
        } else if (loggedIn) {
            setDisplayState('loggedIn');
        }
    }, [ authError, authState, driveError, files, loggedIn ])

    useEffect(() => {
        setLoadingStatus(displayState !== 'filesLoaded' && displayState !== 'loggedOut');
    }, [displayState])

    useEffect(() => {
        if (contentNode) {
            // find the parent with a title, to remove it so it doesn't interfere with the tool tip
            const nodesWithTitle = document.querySelectorAll('div[title]');
            for (const node of nodesWithTitle) {
                if (node.contains(contentNode))  {
                    // nodIe.removeAttribute('title');
                }
            }
        }
    }, [contentNode]);

    function openPopper(event, id) {
        const { currentTarget } = event;
        setPopperContext(() => ({
            id,
            anchor: currentTarget,
            overflowedFileIds: popperContext.overflowedFileIds
        }));
    }

    function closePopper() {
        setPopperContext(() => ({
            overflowedFileIds: popperContext.overflowedFileIds
        }));
    }

    if (displayState === 'filesLoaded') {
        prepareFiles(files, fileDateFormater, fileDateFormaterWithYear);
        if (files && files.length > 0) {
            return (
                <div className={classes.content} ref={contentRef}>
                    {files.map((file, index) => {
                        const { iconLink, iconSize = '16', id, modifiedBy, modified, name, webViewLink } = file;
                        return (
                            <Fragment key={id}>
                                <a
                                    className={classnames(classes.row, classes[`row${index}`])}
                                    href={webViewLink}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    <div className={classes.fileBox}>
                                        <img className={classnames(classes.fileIcon, classes['fileIcon'+iconSize])} aria-label='file icon' src={iconLink}/>
                                        <div className={classes.fileNameBox}>
                                            <Typography
                                                className={classes.fileName}
                                                component='div'
                                                variant={'body2'}
                                                ref={node => fileNameRef(node, id)}
                                                onFocus={event => openPopper(event, id)}
                                                onMouseOver={event => openPopper(event, id)}
                                                onBlur={() => closePopper()}
                                                onMouseLeave={() => closePopper()}
                                            >
                                                {name}
                                            </Typography>
                                            <Popper
                                                className={classes.fileNamePopper}
                                                anchorEl={popperContext.anchor}
                                                container={contentNode}
                                                open={popperContext.id === id && popperContext.overflowedFileIds.includes(id)}
                                                modifiers={{
                                                    preventOverflow: {
                                                        enabled: true,
                                                        padding: spacing40
                                                    }
                                                }}
                                            >
                                                <Typography>{name}</Typography>
                                            </Popper>
                                            <Typography className={classes.modified} component='div' variant={'body3'}>
                                                {intl.formatMessage({id: modifiedBy ? 'drive.modifiedBy' : 'drive.modified'}, {date: modified, name: modifiedBy})}
                                            </Typography>
                                        </div>
                                    </div>
                                </a>
                                <Divider className={classes.divider} variant={'middle'} />
                            </Fragment>
                        );
                    })}
                    <div className={classes.logoutBox}>
                        <SignOutButton onClick={logout}/>
                    </div>
                </div>
            );
        } else if (files) {
            return <NoDriveFiles/>;
        }
    } else if (displayState === 'loggedOut') {
        return (
            <div className={classes.card}>
                <Illustration name={IMAGES.ID_BADGE} />
                <Typography className={classes.fontWeightNormal} variant={'h3'} component='div'>
                    {intl.formatMessage({id: 'google.permissionsRequested'})}
                </Typography>
                <SignInButton onClick={login}/>
            </div>
        );
    } else {
        return null;
    }
}

Drive.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Drive);

/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo, Fragment } from "react";
import PropTypes from "prop-types";

import { Divider, Illustration, IMAGES, Tooltip, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { colorBrandNeutral250, fontWeightBold, fontWeightNormal, spacing30, spacing40 } from "@hedtech/react-design-system/core/styles/tokens";

import { useExtensionControl, useUserInfo } from '@ellucian/experience-extension-hooks';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import { useAuth } from '../context-hooks/auth-context-hooks';
import { useDrive } from "../context-hooks/drive-context-hooks";

const styles = () => ({
    card: {
        flex: "1 0 auto",
        width: "100%",
        height: "100%",
        display: "flex",
        padding: spacing40,
        flexFlow: "column",
        alignItems: "center",
        justifyContent: "center",
        '& > *': {
            marginBottom: spacing40
        },
        '& :last-child': {
            marginBottom: '0px'
        }
    },
    content: {
        display: "flex",
        flexFlow: "column",
        '& :first-child': {
            paddingTop: '0px'
        },
        '& hr:last-of-type': {
            display: 'none'
        }
    },
    row: {
        paddingTop: spacing30,
        paddingBottom: spacing30,
        paddingLeft: spacing40,
        paddingRight: spacing40,
        '&:hover': {
            backgroundColor: colorBrandNeutral250
        }
    },
    fileBox: {
        display: "flex",
        padding: "0 9px",
        alignItems: "center"
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
    fileName: {
        display: '-webkit-box',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        fontWeight: fontWeightBold
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
        marginBottom: '0px'
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
    const { LogoutButton, LoginButton } = useComponents();

    const { error: authError, login, loggedIn, logout } = useAuth();
    const { error: driveError, files } = useDrive();

    const [displayState, setDisplayState] = useState('init');

    const fileDateFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { month: 'short', day: '2-digit' })
    }, [locale]);

    const fileDateFormaterWithYear = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' })
    }, [locale]);

    const [contentNode, setContentNode] = useState();

    const contentRef = (contentNode) => {
        setContentNode(contentNode);
    }

    useEffect(() => {
        if (authError || driveError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'error.contentNotAvailable'}),
                textMessage: intl.formatMessage({id: 'error.contactYourAdministrator'}),
                iconName: 'warning'
            })
        } else if (loggedIn === false) {
            setDisplayState('loggedOut');
        } else if (files !== undefined) {
            setDisplayState('filesLoaded');
        } else if (loggedIn) {
            setDisplayState('loggedIn');
        }
    }, [ files, loggedIn ])

    useEffect(() => {
        setLoadingStatus(displayState !== 'filesLoaded' && displayState !== 'loggedOut');
    }, [displayState])

    useEffect(() => {
        if (contentNode) {
            // find the parent with a title, to remove it so it doesn't interfere with the tool tip
            const nodesWithTitle = document.querySelectorAll('div[title]');
            for (const node of nodesWithTitle) {
                if (node.contains(contentNode))  {
                    node.removeAttribute('title');
                }
            }
        }
    }, [contentNode]);

    if (displayState === 'filesLoaded') {
        if (files && files.length > 0) {
            return (
                <div className={classes.content} ref={contentRef}>
                    {files.map((file) => {
                        const { component: FileComponent, iconLink, id, lastModifyingUser, modifiedTime: fileModifiedTime, name, webViewLink } = file;
                        const fileModified = new Date(fileModifiedTime);
                        const modified = new Date().getFullYear() === fileModified.getFullYear()
                            ? fileDateFormater.format(fileModified)
                            : fileDateFormaterWithYear.format(fileModified);
                        const modifiedBy = lastModifyingUser ? lastModifyingUser.displayName : 'unknown';
                        return (
                            <Fragment key={id}>
                                <div className={classes.row}>
                                    <a
                                        style={{ textDecoration: "none", color: "initial" }}
                                        href={webViewLink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {FileComponent && (
                                            <FileComponent/>
                                        )}
                                        {!FileComponent && (
                                                <div className={classes.fileBox}>
                                                    <img className={classes.fileIcon} src={iconLink}/>
                                                    <div className={classes.fileNameBox}>
                                                        <Tooltip title={name}>
                                                            <Typography
                                                                className={classes.fileName}
                                                                component='div'
                                                                variant={"body2"}
                                                            >
                                                                {name}
                                                            </Typography>
                                                        </Tooltip>
                                                        <Typography className={classes.modified} component='div' variant={"body3"}>
                                                            {intl.formatMessage({id: 'drive.modifiedBy'}, {date: modified, name: modifiedBy})}
                                                        </Typography>
                                                    </div>
                                                </div>
                                        )}
                                    </a>
                                </div>
                                <Divider className={classes.divider} variant={"middle"} />
                            </Fragment>
                        );
                    })}
                    <div className={classes.logoutBox}>
                        <LogoutButton onClick={logout}/>
                    </div>
                </div>
            );
        } else if (files) {
            return (
                <div className={classes.card}>
                    <Typography className={classes.noFiles} component='div' variant={'h3'}>
                        {intl.formatMessage({id: 'drive.noFiles'})}
                    </Typography>
                    <div className={classes.logoutBox}>
                        <LogoutButton onClick={logout}/>
                    </div>
                </div>
            )
        }
    } else if (displayState === 'loggedOut') {
        return (
            <div className={classes.card}>
                <Illustration name={IMAGES.ID_BADGE} />
                <Typography className={classes.fontWeightNormal} variant={"h3"} component='div'>
                    {intl.formatMessage({id: 'google.permissionsRequested'})}
                </Typography>
                <LoginButton onClick={login}/>
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

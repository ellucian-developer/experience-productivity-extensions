/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import { Divider, Illustration, IMAGES, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { fontWeightBold, fontWeightNormal, spacing30, spacing40 } from "@hedtech/react-design-system/core/styles/tokens";

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
        flexFlow: "column"
    },
    row: {
        display: "flex",
        paddingLeft: spacing40,
        paddingRight: spacing40
    },
    fileBox: {
        width: "90%",
        display: "flex",
        padding: "0 9px",
        alignItems: "center"
    },
    fileNameBox: {
        display: "flex",
        flexDirection: 'column',
        width: '100%',
        alignItems: 'baseline',
        marginBottom: spacing30
    },
    fileIcon: {
        alignSelf: 'flex-start',
        marginTop: spacing30,
        marginRight: spacing40
    },
    fileName: {
        width: '100%',
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
        marginTop: spacing30,
        marginBottom: spacing30
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

    if (displayState === 'filesLoaded') {
        if (files && files.length > 0) {
            return (
                <div className={classes.content}>
                    {files.map((file) => {
                        const { modifiedTime: fileModifiedTime } = file;
                        const fileModified = new Date(fileModifiedTime);
                        const modified = new Date().getFullYear() === fileModified.getFullYear()
                            ? fileDateFormater.format(fileModified)
                            : fileDateFormaterWithYear.format(fileModified);
                        const modifiedBy = file.lastModifyingUser ? file.lastModifyingUser.displayName : 'unknown';
                        return (
                            <a
                                style={{ textDecoration: "none", color: "initial" }}
                                href={file.webViewLink}
                                key={file.id}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <div className={classes.row}>
                                    <div className={classes.fileBox}>
                                        <img className={classes.fileIcon} src={file.iconLink}/>
                                        <div className={classes.fileNameBox}>
                                            <Typography
                                                className={classes.fileName}
                                                component='div'
                                                variant={"body2"}
                                            >
                                                {file.name}
                                            </Typography>
                                            <Typography className={classes.modified} component='div' variant={"body3"}>
                                                {intl.formatMessage({id: 'drive.modifiedBy'}, {date: modified, name: modifiedBy})}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                                <Divider className={classes.divider} variant={"middle"} />
                            </a>
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

/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import classnames from 'classnames';

import { Button, Card, CardHeader, CardContent, Divider, Illustration, IMAGES, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { fontWeightBold, fontWeightNormal, spacing30, spacing40 } from "@hedtech/react-design-system/core/styles/tokens";

import { useExtensionControl, useUserInfo } from '@ellucian/experience-extension-hooks';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

// eslint-disable-next-line import/no-unresolved
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
        marginRight: spacing40
    },
    fileName: {
        width: '100%',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all'
    },
    fileNameUnviewed: {
        fontWeight: fontWeightBold
    },
    modified: {
        width: '100%',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-all'
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
    openDriveBox: {
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
    const { OpenDriveButton, LoginButton } = useComponents();

    const { error: authError, login, loggedIn, logout, revokePermissions } = useAuth();
    const { error: driveError, files, openDrive, refresh } = useDrive();

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

    function onLogout() {
        logout();
    }

    function onRevokePermissions() {
        revokePermissions();
        refresh();
    }

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
                                                className={classnames(classes.fileName, {[classes.fileNameUnviewed]: !file.viewedByMe})}
                                                component='div'
                                                variant={"body1"}
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
                    <div className={classes.openDriveBox}>
                        <OpenDriveButton onClick={openDrive}/>
                    </div>
                    { process.env.NODE_ENV === 'development' && (
                        <Card className={classes.devCard}>
                            <CardHeader title="Development Mode"/>
                            <CardContent>
                                <Button className={classes.devButton} onClick={onLogout}>Sign Out</Button>
                                <Button className={classes.devButton} onClick={onRevokePermissions}>Revoke Permissions</Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            );
        } else if (files) {
            return (
                <div className={classes.card}>
                    <Typography className={classes.noFiles} component='div' variant={'h3'}>
                        {intl.formatMessage({id: 'drive.noFiles'})}
                    </Typography>
                    <OpenDriveButton onClick={openDrive}/>
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

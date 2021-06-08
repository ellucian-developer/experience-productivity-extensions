/* eslint-disable jsx-a11y/alt-text */
import React, { Fragment, useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import safeHtml from 'safe-html';
import classnames from 'classnames';

import { Avatar, Divider, Illustration, IMAGES, TextLink, Tooltip, Typography } from "@hedtech/react-design-system/core";
import { Icon } from '@eui/ds-icons/lib/';
import { withStyles } from "@hedtech/react-design-system/core/styles";
import {
    colorBrandNeutral250,
    colorBrandNeutral300,
    colorTextNeutral600,
    fontWeightBold,
    fontWeightNormal,
    spacing30,
    spacing40,
    fountain400,
    iris400,
    kiwi400,
    meadow400,
    purple400,
    saffron400,
    tangerine400
} from "@hedtech/react-design-system/core/styles/tokens";

import { useExtensionControl, useUserInfo } from '@ellucian/experience-extension-hooks';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';
import { useAuth } from '../context-hooks/auth-context-hooks';
import { useMail } from '../context-hooks/mail-context-hooks';

const colors = [ fountain400, iris400, kiwi400, meadow400, purple400, saffron400, tangerine400 ];
function pickAvatarColor(email, colorsContext) {
    const { colorsUsed, colorsByUser } = colorsContext;
    let color = colorsByUser[email];
    if (!color) {
        let colorsLeft = colors.filter( c => !colorsUsed.includes(c) );
        if (colorsLeft.length === 0) {
            colorsLeft = colors;
        }

        const colorIndex = Math.floor(Math.random() * colorsLeft.length);
        color = colorsLeft[colorIndex];
        colorsUsed.push(color);
        colorsByUser[email] = color;
    }

    return color;
}

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
        flexDirection: "column",
        marginLeft: spacing40,
        marginRight: spacing40,
        '& :first-child': {
            paddingTop: '0px'
        },
        '& hr:last-of-type': {
            display: 'none'
        }
    },
    row: {
        display: "flex",
        alignItems: "center",
        paddingTop: spacing30,
        paddingBottom: spacing30,
        paddingLeft: spacing30,
        paddingRight: spacing30,
        '&:hover': {
            backgroundColor: colorBrandNeutral250
        }
    },
    avatar: {
        color: colorTextNeutral600
    },
    messageDetailsBox: {
        paddingLeft: spacing30,
        width: 'calc(100% - 40px)',
        flex: '1 1 auto',
        display: "flex",
        flexDirection: 'column',
        alignItems: 'stretch'
    },
    messageFrom: {
    },
    fromBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    subjectBox: {
        display: 'flex',
        alignItems: 'center'
    },
    subjectLink90: {
        maxWidth: '90%'
    },
    subjectLink100: {
        maxWidth: '100%'
    },
    subject: { },
    attachment: {
        flex: '1 0 auto',
        maxWidth: spacing40,
        marginLeft: spacing30
    },
    unread: {
        fontWeight: fontWeightBold
    },
    noWrap: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    fontWeightNormal: {
        fontWeight: fontWeightNormal
    },
    divider: {
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: colorBrandNeutral300
    },
    logoutBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing40,
        marginBottom: spacing40
    },
    settings: {
        marginTop: spacing40
    }
});

function OutlookMail({ classes }) {
    const { setErrorMessage, setLoadingStatus } = useExtensionControl();
    const { locale } = useUserInfo();

    const { intl } = useIntl();
    const { LoginButton, LogoutButton } = useComponents();

    const { error: authError, login, loggedIn, logout } = useAuth();
    const { error: mailError, mails, userPhotos, state: mailState } = useMail();
    let userPhotoUrl;

    const [displayState, setDisplayState] = useState('init');
    const [colorsContext] = useState({ colorsUsed: [], colorsByUser: {}});

    const dateFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'short'})
    }, [locale]);

    const timeFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { timeStyle: 'short'})
    }, [locale]);

    useEffect(() => {
        if (authError || mailError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'error.contentNotAvailable'}),
                textMessage: intl.formatMessage({id: 'error.contactYourAdministrator'}),
                iconName: 'warning'
            })
        } else if (loggedIn === false) {
            setDisplayState('loggedOut');
        } else if (mails !== undefined) {
            setDisplayState('mailsLoaded');
        } else if (loggedIn) {
            setDisplayState('loggedIn');
        }
    }, [ mails, loggedIn ])

    useEffect(() => {
        setLoadingStatus(displayState !== 'mailsLoaded' && displayState !== 'loggedOut');
    }, [displayState])

    function isToday(dateToCheck) {
        const today = new Date();
        return today.getFullYear() === dateToCheck.getFullYear() &&
            today.getMonth() === dateToCheck.getMonth() &&
            today.getDate() === dateToCheck.getDate()
    }

    if (displayState === 'mailsLoaded') {
        if (mails && mails.length > 0) {
            return (
                <div className={classes.content}>
                    {mails.map((mail) => {
                        const {
                            bodyPreview,
                            id,
                            from: {
                                emailAddress: {
                                    name,
                                    address
                                }
                            },
                            hasAttachments,
                            webLink,
                            receivedDateTime,
                            subject,
                            isRead
                        } = mail;

                        const localReceivedDateTime = new Date(receivedDateTime);
                        const diaplayReceivedDateTime = isToday(localReceivedDateTime) ? timeFormater.format(localReceivedDateTime) : dateFormater.format(localReceivedDateTime);

                        const avatarColor = pickAvatarColor(address, colorsContext);

                        // console.debug('10:provider.userPhotos:-', userPhotos);
                        if ((userPhotos !== undefined) && (userPhotos.get(address) !== undefined)) {
                            userPhotoUrl = userPhotos.get(address);
                        } else {
                            userPhotoUrl = ("");
                        }

                        return (
                            <Fragment key={id}>
                                <div className={classes.row}>
                                    <Avatar
                                        className={classes.avatar}
                                        style={{backgroundColor: avatarColor}}
                                        src={userPhotoUrl}
                                    >
                                        {/* <img src={URL.createObjectURL(userIds[index])} /> */}
                                        {name.substr(0, 1)}
                                        {(name.indexOf(",") === -1) ? "" : name.substr(name.indexOf(",")+2, 1)}
                                    </Avatar>
                                    <div className={classes.messageDetailsBox}>
                                        <div className={classes.fromBox}>
                                            <Typography
                                                className={classnames(classes.messageFrom, { [classes.unread]: !isRead })}
                                                noWrap
                                                variant="body2"
                                            >
                                                {name}
                                            </Typography>
                                            <Typography component='div' className={classnames(classes.date, { [classes.unread]: !isRead })} variant="body3">
                                                {diaplayReceivedDateTime}
                                            </Typography>
                                        </div>
                                        <div className={classes.subjectBox}>
                                            <TextLink className={{ [classes.subjectLink90]: hasAttachments, [classes.subjectLink100]: !hasAttachments}} href={webLink} target='_blank'>
                                                <Typography component='div' noWrap className={classnames(classes.subject, { [classes.unread]: !isRead })} variant="body2">
                                                    {subject}
                                                </Typography>
                                            </TextLink>
                                            { hasAttachments && (
                                                <Tooltip title={intl.formatMessage({id: 'mail.attachment'})}>
                                                    <Icon className={classes.attachment} name='file-text' align='right' />
                                                </Tooltip>
                                            )}
                                        </div>
                                        <Typography component='div' noWrap variant="body3">
                                            <div className={classes.noWrap} dangerouslySetInnerHTML={{__html: safeHtml(bodyPreview)}}/>
                                        </Typography>
                                    </div>
                                </div>
                                {/* !last && ( */}
                                    <Divider classes={{ root: classes.divider }} variant={"middle"} />
                                {/* ) */}
                            </Fragment>
                        );
                    })}
                    {/* <div className={classes.openEmailBox}>
                        <OpenMailButton className={classes.openEmail} onClick={openMail}/>
                    </div>
                    <DevelopmentBox/> */}
                    <div className={classes.logoutBox}>
                        <LogoutButton onClick={logout}/>
                    </div>
                </div>
            );
        } else if (mails) {
            return (
                <div className={classes.messageCard}>
                    <Illustration name={IMAGES.NO_TASKS} />
                    <Typography className={classes.title} component='div' variant='h3'>
                        {intl.formatMessage({id: 'outlookMail.noEmailTitle'})}
                    </Typography>
                    <Typography className={classes.messages} component='div' align='center' variant='body2'>
                        {intl.formatMessage({id: 'outlookMail.noEmailMessage'})}
                    </Typography>
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

OutlookMail.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OutlookMail);

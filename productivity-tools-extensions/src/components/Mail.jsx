/* eslint-disable jsx-a11y/alt-text */
import React, { Fragment, useEffect, useState } from "react";
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

import { useExtensionControl } from '@ellucian/experience-extension-hooks';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks.js';
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
    subjectLink: {
        maxWidth: '100%'
    },
    subject: { },
    attachment: {
        flex: '1 0 auto',
        maxWidth: spacing40,
        marginLeft: spacing30
    },
    unread: {
        fontWeight: fontWeightBold,
        color: colorTextNeutral600
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

function Mail({ classes }) {
    const { setErrorMessage, setLoadingStatus } = useExtensionControl();

    const { intl } = useIntl();
    const { LoginButton, LogoutButton, NoEmail } = useComponents();
    const { error: authError, login, loggedIn, logout, state: authState } = useAuth();
    const { error: mailError, messages, state: mailState } = useMail();

    const [colorsContext] = useState({ colorsUsed: [], colorsByUser: {}});

    const [displayState, setDisplayState] = useState('loading');

    const [contentNode, setContentNode] = useState();

    const contentRef = (contentNode) => {
        setContentNode(contentNode);
    }

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

    useEffect(() => {
        if (authError || mailError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'error.contentNotAvailable'}),
                textMessage: intl.formatMessage({id: 'error.contactYourAdministrator'}),
                iconName: 'warning'
            })
        } else if (loggedIn === false && authState === 'ready') {
            setDisplayState('loggedOut');
        } else if (mailState === 'load') {
            setDisplayState('loading');
        } else if (mailState === 'loaded' || mailState === 'refresh') {
            setDisplayState('loaded');
        } else if (mailState && mailState.error) {
            setDisplayState('error');
        }
    }, [ authError, authState, loggedIn, mailError, mailState ])

    useEffect(() => {
        setLoadingStatus(displayState === 'loading');
    }, [displayState, mailState])

    if (displayState === 'loaded') {
        if (messages && messages.length > 0) {
            return (
                <div className={classes.content} ref={contentRef}>
                    {messages.map((message) => {
                        const {
                            body,
                            id,
                            fromEmail,
                            fromInitial,
                            fromName,
                            hasAttachment,
                            messageUrl,
                            received,
                            subject,
                            unread
                        } = message;
                        const avatarColor = pickAvatarColor(fromEmail, colorsContext);
                        return (
                            <Fragment key={id}>
                                <div className={classes.row}>
                                    <Avatar className={classes.avatar} style={{backgroundColor: avatarColor}}>{fromInitial}</Avatar>
                                    <div className={classes.messageDetailsBox}>
                                        <div className={classes.fromBox}>
                                            <Typography
                                                className={classnames(classes.messageFrom, { [classes.unread]: unread })}
                                                component='div'
                                                noWrap
                                                variant={"body2"}
                                            >
                                                {fromName}
                                            </Typography>
                                            <Typography
                                                className={classes.date}
                                                component='div'
                                                variant={"body3"}
                                            >
                                                {received}
                                            </Typography>
                                        </div>
                                        <div className={classes.subjectBox}>
                                            <TextLink className={classes.subjectLink} href={messageUrl} target='_blank'>
                                                <Typography
                                                    className={classnames(classes.subject, { [classes.bold]: unread })}
                                                    component='div'
                                                    noWrap
                                                    variant={"body2"}
                                                >
                                                    {subject}
                                                </Typography>
                                            </TextLink>
                                            { hasAttachment && (
                                                <Tooltip title={intl.formatMessage({id: 'mail.attachment'})}>
                                                    <Icon className={classes.attachment} name='file-text' />
                                                </Tooltip>
                                            )}
                                        </div>
                                        <Typography component='div' noWrap variant='body3'>
                                            <div className={classes.noWrap} dangerouslySetInnerHTML={{__html: safeHtml(body)}}/>
                                        </Typography>
                                    </div>
                                </div>
                                <Divider classes={{ root: classes.divider }} variant={"middle"} />
                            </Fragment>
                        );
                    })}
                    <div className={classes.logoutBox}>
                        <LogoutButton className={classes.logout} onClick={logout}/>
                    </div>
                </div>
            );
        } else if (messages) {
            return <NoEmail/>;
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
        // eslint-disable-next-line no-warning-comments
        // TODO add error case
        return null;
    }
}

Mail.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Mail);

/* eslint-disable jsx-a11y/alt-text */
import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';
import classnames from 'classnames';
import moment from 'moment';

import { Avatar, Divider, Illustration, IMAGES, List, ListItem, ListItemText, TextLink, Tooltip, Typography} from '@ellucian/react-design-system/core';
import { Icon } from '@ellucian/ds-icons/lib';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import {
    colorBrandNeutral250,
    colorBrandNeutral300,
    colorTextNeutral600,
    fontWeightBold,
    fontWeightNormal,
    spacing30,
    spacing40
} from '@ellucian/react-design-system/core/styles/tokens';

import { useExtensionControl } from '@ellucian/experience-extension-hooks';

import { useIntl } from '../context-hooks/card-context-hooks.js';
import { useAuth } from '../context-hooks/auth-context-hooks';
import { useCalendar } from '../context-hooks/calendar-context-hooks';

import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';
import NoEvents from './w75_NoEvents';

import { pickAvatarColor } from '../util/mail.js';

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
        flexDirection: 'column',
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
        display: 'flex',
        alignItems: 'center',
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
        display: 'flex',
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
        maxWidth: '100%',
        padding: '0px'
    },
    subjectLinkUnread: {
        fontWeight: fontWeightBold
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
    accepted: {
        fontWeight: fontWeightBold,
        color: colorTextNeutral600
    },
    tentativelyAccepted: {
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

const shortDateFormat = (d, allDay, allDayOffsetMinutes = 0) => {
    return allDay ? moment(d).utc().add(allDayOffsetMinutes, 'Minutes').format("MMM Do") : moment(d).local().format("MMM Do");
}

// All day items end on midnight of the following day, so we need to subtract a day from the date
const timeFormat = (d, allDay, allDayReplacementStr) => {
    return allDay ? allDayReplacementStr : moment(d).local().format("hh:mm A");
}

const isUrl = (s) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');
    // console.log("isUrl("+s+"): ", Boolean(pattern.test(s)));
    return Boolean(pattern.test(s));
}

function Agenda({ classes }) {
    const { setErrorMessage, setLoadingStatus } = useExtensionControl();

    const { intl } = useIntl();
    const { error: authError, login, loggedIn, logout, state: authState } = useAuth();
    const { error: eventError, events, state: eventState } = useCalendar();

    const [colorsContext] = useState({ colorsUsed: [], colorsByUser: {}});

    const [displayState, setDisplayState] = useState('loading');

    useEffect(() => {
        if (authError || eventError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'error.contentNotAvailable'}),
                textMessage: intl.formatMessage({id: 'error.contactYourAdministrator'}),
                iconName: 'warning'
            })
        } else if (loggedIn === false && authState === 'ready') {
            setDisplayState('loggedOut');
        } else if (eventState === 'load') {
            setDisplayState('loading');
        } else if ((eventState === 'loaded' || eventState === 'refresh') && events) {
            setDisplayState('loaded');
        } else if (eventState && eventState.error) {
            setDisplayState('error');
        }
    }, [ authError, authState, loggedIn, eventError, eventState, events ])

    useEffect(() => {
        setLoadingStatus(displayState === 'loading');
    }, [displayState, eventState])

    const scrollToTime = new Date();
    scrollToTime.setHours(7);

    if (displayState === 'loaded') {
        if (events && events.length > 0) {
            // console.log("Events: ", events);
            let curHeader = 'junk';
            return (
                <div id={`myCalendar_Container`}>
                    <List key={`agendaItemsList`} dense style={{border: '1px solid #ddd' }}>
                        {events && events.map((item) => {
                            const {
                                    title,
                                    start,
                                    end,
                                    allDay,
                                    calendarEventLink,
                                    color,
                                    eventId: id,
                                    bodySnippet,
                                    isAccepted,
                                    isTentative,
                                    fromEmail,
                                    fromInitials,
                                    fromName,
                                    hasAttachment,
                                    status,
                                    userPhotoUrl,
                                    onlineMeetingLink
                            } = item;
                            // All day items are in UTC and should not be localized (or you may move the day)
                            const header = allDay ? moment(item.start).utc().format("dddd, MMMM Do, YYYY") : moment(item.start).format("dddd, MMMM Do, YYYY");
                            // console.log("Start Date: ", item.start, header);
                            const printHeader = (header !== curHeader);
                            let itemStatus = "not accepted";
                            if (isTentative) { itemStatus = "tentative"; }
                            // console.log(isAccepted, item.status);
                            if (isAccepted) {
                                itemStatus = status;
                            }
                            if (printHeader) { curHeader = header; }
                            const startTime = timeFormat(start, allDay, "All");
                            const endTime = timeFormat(end, allDay, "Day");
                            const startDateShort = shortDateFormat(start, allDay);
                            const endDateShort = shortDateFormat(end, allDay, -1);
                            // const dateRange = startDateShort == endDateShort ? startDateShort : startDateShort + " - " + endDateShort;
                            // const startOffset = moment(item.start).utcOffset();
                            let timeRange = (allDay ? "All Day" : startTime + " - " + endTime);
                            if (startTime == endTime) { timeRange = startTime; }
                            let eventDetails = startDateShort == endDateShort ? startDateShort + " from " + timeRange : startDateShort + " to " + endDateShort + " from " + timeRange;
                            if (item.allDay) {
                                eventDetails = startDateShort == endDateShort ? "All Day on " + startDateShort : "All Day from " + startDateShort + " to " + endDateShort;
                            }
                            const itemLink = isUrl(location) ? location : onlineMeetingLink;
                            console.log(location, onlineMeetingLink);
                            const avatarColor = pickAvatarColor(fromEmail, colorsContext);
                            return (<Fragment key={id}>
                                {printHeader && (
                                <ListItem divider key={`dateHeader_${moment(start).format('YYYYMMDD')}`} id={`dateHeader_${moment(start).format('YYYYMMDD')}`}>
                                    <ListItemText>
                                        <Typography noWrap variant={'h5'} style={{textAlign: 'center'}}>{header}</Typography>
                                    </ListItemText>
                                </ListItem>
                                )}
                                <ListItem divider disableGutters key={`event_${id}`} style={{ paddingLeft: '.25rem' }}>
                                    <ListItemText key={`eventTimeStatus_${id}`} component='a' href={calendarEventLink} style={{ borderRight: '.25rem solid ' + color, textAlign: 'center', minWidth: '70px', maxWidth: '70px' }}>
                                        <Typography key={`eventTimeStatus_${id}_startTime`} variant={"body2"}>{startTime}</Typography>
                                        <Typography key={`eventTimeStatus_${id}_endTime`} variant={"body2"}>{endTime}</Typography>
                                        <Tooltip key={`eventTimeStatus_${id}_itemStatustooltip`} title={itemStatus}>
                                            <Typography key={`eventTimeStatus_${id}_itemStatus`}  noWrap variant={"body3"}>{itemStatus}</Typography>
                                        </Tooltip>
                                    </ListItemText>
                                    <ListItemText key={`eventOrgTitleLoc_${id}`} style={{ paddingLeft: '.5rem', maxWidth: '209xxx' }}>
                                        <Tooltip key={`eventOrgTitleLoc_${id}_orgtooltip`} title={`Organizer: ${fromName}  | Status: ${itemStatus}`}>
                                            <Typography key={`eventOrgTitleLoc_${id}_orgtypography`} noWrap variant={"body3"} style={{textAlign: 'justify', backgroundColor: avatarColor}}>Organizer: {fromName}</Typography>
                                        </Tooltip>
                                        <Tooltip key={`eventOrgTitleLoc_${id}_titletooltip`} title={`${title} | ${eventDetails}`}>
                                            <Typography key={`eventOrgTitleLoc_${id}_titletypography`} noWrap variant={"body2"}>{title} | {eventDetails}</Typography>
                                        </Tooltip>
                                        <Tooltip key={`eventOrgTitleLoc_${id}_locationtooltip`} title={`Location: ${location}`}>
                                            {isUrl(itemLink) && (
                                                <Typography key={`eventOrgTitleLoc_${id}_locationtypography`} noWrap variant={"body3"} style={{textAlign: 'left'}}>
                                                    <span>Location:</span>
                                                    <TextLink key={`meeting_link_${id}`} id={`meeting_link_${id}`} className={classes.subjectLink} href={itemLink}>
                                                        {location}
                                                    </TextLink>
                                                </Typography>
                                            )}
                                            {!isUrl(itemLink) && (
                                                <Typography key={`eventOrgTitleLoc_${id}_locationtypography`} 
                                                    noWrap variant={"body3"} 
                                                    style={{textAlign: 'left'}}>
                                                    {`Location: ${location}`}
                                                </Typography>
                                            )}
                                        </Tooltip>
                                    </ListItemText>
                                </ListItem>
                            </Fragment>
                        )})}
                    </List>
                    <div className={classes.logoutBox}>
                        <SignOutButton onClick={logout}/>
                    </div>
                </div>
            );
        } else if (events) {
            return <NoEvents />
        }
    } else if (displayState === 'loggedOut') {
        return (
            <div className={classes.card}>
                <Tooltip title={intl.formatMessage({id: 'outlookCalendarLinkMsg'})}>
                <TextLink className={classes.href} href={intl.formatMessage({id: 'outlookCalendarURL'})} target='_blank' rel='noreferrer' alt={intl.formatMessage({id: 'outlookCalendarLinkMsg'})}>
                    <Typography className={classes.fontWeightNormal} variant={'h6'}>
                    {intl.formatMessage({id: 'outlookCalendarLinkTxt'})}
                    </Typography>
                </TextLink>
                </Tooltip>
                <Tooltip title={intl.formatMessage({id: 'allowPopups'})}>
                <Illustration name={IMAGES.ID_BADGE} />
                </Tooltip>
                <Typography className={classes.fontWeightNormal} variant={'h4'} component='div'>
                    {intl.formatMessage({id: 'google.permissionsRequested'})}
                </Typography>
                <Typography className={classes.fontWeightNormal} variant={'h6'} component='div'>
                    {intl.formatMessage({id: 'allowPopups'})}
                </Typography>
                <SignInButton onClick={login}/>
            </div>
        );
    } else {
        // eslint-disable-next-line no-warning-comments
        // TODO add error case
        return null;
    }
}

Agenda.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Agenda);

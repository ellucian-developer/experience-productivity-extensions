import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { saffron600, safron400, saffron200, purple600, purple400, purple200, iris600, iris400, iris200, fountain600, fountain400, fountain200, meadow600, meadow400, meadow200, kiwi600, kiwi400, kiwi200, tangerine600, tangerine400, tangerine200 } from '@ellucian/react-design-system/core/styles/tokens';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import stringTemplate from 'string-template';
import { addDays, endOfDay, formatRFC3339, startOfDay } from 'date-fns';

// import { useUserInfo } from '@ellucian/experience-extension-utils';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/calendar-context-hooks';
import { getInitials } from '../../util/mail';

import log from 'loglevel';
const logger = log.getLogger('Microsoft');

const refreshInterval = 60000;
const outlookCalendarTemplateUrl = process.env.OUTLOOK_CALENDAR_TEMPLATE_URL || 'https://outlook.office.com/calendar/item/{id}';

export function MicrosoftCalendarProvider({children}) {
    // const { locale } = useUserInfo();
    const { client, loggedIn, setLoggedIn } = useAuth();

    const [error, setError] = useState(false);
    const [state, setState] = useState('load');
    const [events, setEvents] = useState();
    // const [calEvents, setCalEvents ] = useState();
    const [userPhotos, setUserPhotos] = useState({});
    const [renderCount, setRenderCount] = useState(0);
    // const [startDate, setStartDate] = useState();

    // valid values of b are: (empty or 'nwcred'), 'fountain', 'iris', 'kiwi', 'meadow', 'purple', 'saffron', 'tangerine'
    const getColor = ((s, b = 'nwcred') => {
        // nwcred600: #A71000, nwcred500: #b73b2e, nwcred400: #c7665c, nwcred300: #d7918a, nwcred200: #e6bcb8, nwcred100: #f6e7e6
        const colors = ['fountain', 'iris', 'kiwi', 'meadow', 'purple', 'saffron', 'tangerine'];
        let bC = 'nwcred';
        let i = 0;
        // ignore any colors not in colors, keeping bC's value nwcred
        for (i = 0; i < colors.length; i++) {
            if (colors[i] === b) { bC = b; }
        }
        let retval = bC;
        switch (s) {
            case 'organizer':
            case 'accepted': retval = (bC == 'nwcred' ? '#A71000' : b+'600'); break;
            case 'tentativelyAccepted': retval = (bC == 'nwcred' ? '#c7665c' : b+'400'); break;
            default:  retval = (bC == 'nwcred' ? '#e6bcb8' : b+'200');
        }
        // console.log(`color: ${retval}`);
        return retval;
    });

    const refresh = useCallback(async () => {
        // console.log(locale);
        if (loggedIn) {
            // if not force load and not curent visible, skip it
            if (state === 'refresh' && document.hidden) {
                logger.debug(`Outlook skipping refresh when document is hidden`);
                return;
            }
            logger.debug(`${events === undefined ? 'loading' : 'refreshing'} outlook calendar events`);

            const agendaDays = 7;
            // const startDt = new Date('2022-06-15 08:00:00.0Z');
            const startDt = new Date();
            const endDt = addDays(startDt, agendaDays);
            const startDtParamDt = startOfDay(startDt);
            const startDtParam = formatRFC3339(startDtParamDt, { fractionDigits: 3 })
            const endDtParamDt = endOfDay(endDt);
            const endDtParam = formatRFC3339(endDtParamDt, { fractionDigits: 3 })
            // console.log("startDate: ", startDt, startDtParamDt, startDtParam, "endDt: ", endDtParamDt, endDtParam);
            const queryParameters = `startdatetime=${startDtParam}&enddatetime=${endDtParam}&top=250&orderby=start/dateTime`;
            // console.log("Query Parameters: ", queryParameters);

            try {
                const apiCall = `/me/calendarview?${queryParameters}`;
                const response = await client
                .api(apiCall)
                .header('Prefer', 'IdType="ImmutableId"')
                .get();

                // ToDo: implement getCalendarEventBaseColor() to get the settings cookie value associated with the Calendar Event Base Color
                // const baseColor = getCalendarEventBaseColor();
                const { value: events } = response;
                // console.log("MSGraph Events: ", events);
                const acceptedColor = getColor('accepted');
                const tentativeColor = getColor('tentativelyAccepted');
                const defaultColor = getColor('default');


                // transform to what the UI needs
                // https://docs.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0
                const transformedEvents = events.map( event => {
                    const {
                        bodyPreview,
                        organizer: {
                            emailAddress: {
                                name: fromName,
                                address: fromEmail
                            }
                        },
                        id: eventId,
                        isRead,
                        isDraft,
                        isCancelled,
                        recurrence,
                        hasAttachments: hasAttachment,
                        importance,
                        isAllDay,
                        showAs,
                        onlineMeetingUrl,
                        isOnlineMeeting,
                        responseStatus: {
                            response: myResponse
                        },
                        start: {
                            dateTime: startDateTime,
                            timeZone: startTZ
                        },
                        end: {
                            dateTime: endDateTime,
                            timeZone: endTZ
                        },
                        location: {
                            displayName: locationName,
                            locationType,
                            uniqueId,
                            uniqueIdType
                        },
                        subject,
                        webLink
                    } = event;

                    const fromInitials = getInitials(fromName);
                    // const myTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const startDate = startDateTime;
                    const endDate = endDateTime;
                    let color = defaultColor;
                    if (myResponse === 'accepted' || myResponse === 'organizer') { color = acceptedColor; }
                    if (myResponse === 'tentativelyAccepted') { color = tentativeColor; }
                    // console.log("My Response Status: ", myResponse, color);

                    let eventUrl;
                    if (process.env.OUTLOOK_USE_WEB_LINK === 'true') {
                        eventUrl = webLink
                    } else {
                        let encodedId = encodeURIComponent(eventId);
                        encodedId = encodedId.replaceAll('-', '%2F');
                        encodedId = encodedId.replaceAll('_', '%2B');
                        eventUrl = stringTemplate(outlookCalendarTemplateUrl, {id: encodedId});
                    }

                    return {
                        title: subject,
                        start: startDate,
                        startTZ,
                        end: endDate,
                        endTZ,
                        allDay: isAllDay,
                        unread: !isRead,
                        cancelled: isCancelled,
                        calendarEventLink: eventUrl,
                        color,
                        eventId,
                        bodySnippet: bodyPreview.trim(),
                        isAccepted: (myResponse === 'accepted' || myResponse === 'organizer'),
                        isTenatative: (myResponse === 'tentativelyAccepted'),
                        fromEmail,
                        fromInitials,
                        fromName,
                        hasAttachment,
                        location: locationName,
                        status: myResponse,
                        userPhotoUrl: userPhotos[fromEmail]
                    }
                });

                unstable_batchedUpdates(() => {
                    setEvents(() => transformedEvents);
                    setState('loaded');
                });

                logger.debug('Outlook calendar events: ', transformedEvents);

                // attempt to load photos
                for (const event of transformedEvents) {
                    const {
                        fromEmail
                    } = event;

                    (async () => {
                        // check if we already have this user's photo
                        const userPhotoUrl = userPhotos[fromEmail];
                        if (event.userPhotoUrl) {
                            // already read from cache
                            return undefined;
                        } else if (userPhotoUrl) {
                            event.userPhotoUrl = userPhotoUrl;
                            // triggers a context update
                            setRenderCount(count => count + 1);
                        } else {
                            const responseUserId = await client
                            .api(`/users`)
                            .filter(`mail eq '${fromEmail}'`)
                            .select('id')
                            .get();

                            const [{id: userId} = {}] = responseUserId.value;

                            if (userId) {
                                try {
                                    const responsePhoto = await client
                                    .api(`/users/${userId}/photo/$value`)
                                    .get();

                                    if (responsePhoto) {
                                        // add it to the event
                                        event.userPhotoUrl = URL.createObjectURL(responsePhoto);
                                        userPhotos[fromEmail] = event.userPhotoUrl;
                                    }
                                    // triggers a context update
                                    setRenderCount(count => count + 1);
                                } catch (error) {
                                    // did we get logged out or credentials were revoked?
                                    if (error && error.status === 401) {
                                        setLoggedIn(false);
                                    } else {
                                        userPhotos[fromEmail] = '';
                                    }
                                }
                            }
                        }
                    })();
                }
            } catch (error) {
                // did we get logged out or credentials were revoked?
                if (error && error.status === 401) {
                    setLoggedIn(false);
                } else {
                    logger.error('Outlook mapi failed\n', error);
                    unstable_batchedUpdates(() => {
                        setState(() => ({ error: 'api'}));
                        setError(error);
                    });
                }
            }
        }
    }, [loggedIn, state])

    useEffect(() => {
        if (loggedIn && (state === 'load' || state === 'refresh')) {
            refresh();
        }

        if (!loggedIn && state === 'loaded') {
            // setCalendars([]);
            setEvents([]);
            setState('load');
            setUserPhotos({});
            setRenderCount(0);
        }
    }, [loggedIn, refresh, state])

    useEffect(() => {
        let timerId;

        function startInterval() {
            stopInterval();
            // only start if document isn't hidden
            if (!document.hidden) {
                logger.debug('Microsoft calendar starting interval');

                timerId = setInterval(() => {
                    setState('refresh');
                }, refreshInterval);
            }
        }

        function stopInterval() {
            if (timerId) {
                logger.debug('Microsoft calendar stopping interval');
                clearInterval(timerId)
                timerId = undefined;
            }
        }

        function visibilitychangeListener() {
            logger.debug('Microsoft calendar visiblity changed');
            if (document.hidden) {
                stopInterval();
            } else {
                setState('refresh');
                startInterval();
            }
        }

        if (loggedIn) {
            document.addEventListener('visibilitychange', visibilitychangeListener);
            startInterval();
        }

        return () => {
            document.removeEventListener('visibilitychange', visibilitychangeListener);
            if (timerId) {
                clearInterval(timerId)
            }
        }
    }, [loggedIn, setState]);

    const contextValue = useMemo(() => {
        return {
            error,
            events,
            refresh: () => { setState('refresh') },
            state
        }
    }, [ error, events, renderCount, state ]);

    useEffect(() => {
        logger.debug('MicrosoftCalendarProvider mounted');

        return () => {
            logger.debug('MicrosoftCalendarProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MicrosoftCalendarProvider.propTypes = {
    children: PropTypes.object.isRequired
}

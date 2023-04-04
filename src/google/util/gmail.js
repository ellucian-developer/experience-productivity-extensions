// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import log from 'loglevel';
const logger = log.getLogger('Google');

async function getMessagesFromThreads({ max = 10 } = {}) {
    const { gapi } = window;
    if (!gapi) {
        throw new Error('gapi not loaded');
    }

    const listOptions = {
        userId: 'me',
        maxResults: max,
        q: 'label:inbox'
    };

    const response = await gapi.client.gmail.users.threads.list(listOptions);
    const threadsData = JSON.parse(response.body);

    const {threads = []} = threadsData;

    // load the thread data
    const threadPromises = [];
    for (const thread of threads) {
        const threadOptions = {
            userId: 'me',
            id: thread.id,
            format: 'MINIMAL'
        }
        threadPromises.push(gapi.client.gmail.users.threads.get(threadOptions));
    }

    const threadResponses = await Promise.all(threadPromises);

    const messagePromises = [];
    for (const threadResponse of threadResponses) {
        const data = JSON.parse(threadResponse.body);

        // grab the last message
        const message = data.messages.pop();

        const messageOptions = {
            userId: 'me',
            id: message.id,
            format: 'FULL'
        }
        messagePromises.push(gapi.client.gmail.users.messages.get(messageOptions));
    }

    const messageResponses = await Promise.all(messagePromises);

    const messages = [];
    for (const messageResponse of messageResponses) {
        const data = JSON.parse(messageResponse.body);

        messages.push(data);
    }

    return messages;
}

function getValueFromArray(data, name, defaultValue) {
    return ((data || []).find(item => item.name === name) || {}).value || defaultValue;
}

function isToday(dateToCheck) {
    const today = new Date();
    return today.getFullYear() === dateToCheck.getFullYear() &&
        today.getMonth() === dateToCheck.getMonth() &&
        today.getDate() === dateToCheck.getDate()
}

export function transformMessages({dateFormater, user, newMessages, timeFormater}) {
    // transform to what UI needs
    const transformedMessages = newMessages.map( message => {
        const {
            id,
            labelIds,
            payload: {
                headers,
                parts
            },
            snippet
        } = message;

        const receivedDate = new Date(getValueFromArray(headers, 'Date', undefined));

        const unread = labelIds.includes('UNREAD');
        const from = getValueFromArray(headers, 'From', 'Unknown');
        const fromMatches = from.match(/'?([^<>']*)'?\s*<(.*)>/);
        let fromName = from;
        let fromEmail = from;
        let fromInitials = from.slice(0, 1);

        if (fromMatches) {
            fromName = fromMatches[1].trim();
            fromEmail = fromMatches[2].trim().toLocaleLowerCase();
            const fromNameSplit = fromName.split(/[, ]/);
            const firstName = fromName.includes(',') ? fromNameSplit[2] : (fromNameSplit[0] || '');
            fromInitials = firstName.slice(0, 1);
        }

        const subject = getValueFromArray(headers, 'Subject', 'No Subject');

        const messageUrl = `https://mail.google.com/mail/?authuser=${user?.authUser}#all/${id}`;

        const hasAttachment = parts && parts.some(part => part.filename !== '');

        const received = isToday(receivedDate) ? timeFormater.format(receivedDate) : dateFormater.format(receivedDate);

        return {
            bodySnippet: snippet,
            id,
            fromEmail,
            fromInitials,
            fromName,
            hasAttachment,
            messageUrl,
            received,
            receivedDate,
            subject,
            unread
        }
    });

    // ensure sorted by received date
    transformedMessages.sort((left, right) => right.receivedDate.getTime() - left.receivedDate.getTime());

    return transformedMessages;
}

export async function refresh({dateFormater, user, state, setError, setLoggedIn, setMessages, setState, timeFormater}) {
    logger.debug(`${state}ing gmail`);
    try {
        const newMessages = await getMessagesFromThreads();

        const transformedMessages = transformMessages({dateFormater, user, newMessages, timeFormater});

        logger.debug('Gmail messages: ', transformedMessages);

        unstable_batchedUpdates(() => {
            setMessages(() => transformedMessages);
            setState('loaded');
        })
    } catch (error) {
        // did we get logged out or credentials were revoked?
        if (error && (error.status === 401 || error.status === 403)) {
            logger.debug('Gmail getMessageFromThreads failed because status:', error.status);
            setLoggedIn(false);
        } else {
            logger.error('Gmail gapi failed', error);
            unstable_batchedUpdates(() => {
                setError(error);
                setState(() => ({ error: 'api'}));
            })
        }
    }
}
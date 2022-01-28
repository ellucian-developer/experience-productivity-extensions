// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

import expect from 'expect';

import {transformMessages} from '../../../src/google/util/gmail';
import messages from './gmail-data.json';

const dateFormater = new Intl.DateTimeFormat('en-US', { dateStyle: 'short'});
const timeFormater = new Intl.DateTimeFormat('en-US', { timeStyle: 'short'});

const email = 'me@gmail.com';

describe('gmail tests', () => {
	it('valid Gmail thread messages', () => {
		// fudge the first message to use today's Date so that the transform shows a time
		const [firstMessageIn] = messages;
		const dateHeader = firstMessageIn.payload.headers.find(header => header.name === 'Date');
		const dateValue = new Date();
		dateValue.setHours(12);
		dateValue.setMinutes(30);
		dateValue.setSeconds(0);
		dateHeader.value = dateValue.toString();
		const result = transformMessages({dateFormater, email, newMessages: messages, timeFormater});

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toEqual(10);

		const [firstMessage, secondMessage] = result;
		expect(firstMessage.fromInitials).toBe('D');
		expect(firstMessage.fromEmail).toBe('diane.horner@ellucian.com');
		expect(firstMessage.received).toBe('12:30 PM');
		expect(firstMessage.unread).toBe(true);

		expect(secondMessage.fromInitials).toBe('B');
		expect(secondMessage.fromEmail).toBe('bret.hansen@ellucian.com');
		expect(secondMessage.received).toBe('6/16/21');
		expect(secondMessage.unread).toBe(false);
	});
});

import expect from 'expect';
import { pickAvatarColor, isToday, getInitials } from '../../src/util/mail';


const email1 = 'bret.hansen@ellucian.com';
const email2 = 'nitin.jolley@ellucian.com';
const email3 = 'krishna.kant@ellucian.com';
const email4 = 'diane.horner@ellucian.com';

describe('Mail UI functions', () => {
	it('Pick Avatar Color - same color for same user', () => {
		const colorsContext = { colorsUsed: [], colorsByUser: {}};

		const email1Color1 = pickAvatarColor(email1, colorsContext);
		const email1Color2 = pickAvatarColor(email1, colorsContext);
		const email2Color1 = pickAvatarColor(email2, colorsContext);
		const email2Color2 = pickAvatarColor(email2, colorsContext);
		const email3Color1 = pickAvatarColor(email3, colorsContext);
		const email3Color2 = pickAvatarColor(email3, colorsContext);
		const email4Color1 = pickAvatarColor(email4, colorsContext);
		const email4Color2 = pickAvatarColor(email4, colorsContext);

		expect(email1Color1).toBe(email1Color2);
		expect(email2Color1).toBe(email2Color2);
		expect(email3Color1).toBe(email3Color2);
		expect(email4Color1).toBe(email4Color2);
	});
	it('Pick Avatar Color - different color for different users', () => {
		const colorsContext = { colorsUsed: [], colorsByUser: {}};

		const email1Color = pickAvatarColor(email1, colorsContext);
		const email2Color = pickAvatarColor(email2, colorsContext);
		const email3Color = pickAvatarColor(email3, colorsContext);
		const email4Color = pickAvatarColor(email4, colorsContext);

		// make sure all the rest are different
		expect(email1Color).not.toBe(email2Color);
		expect(email1Color).not.toBe(email3Color);
		expect(email1Color).not.toBe(email4Color);

		expect(email2Color).not.toBe(email3Color);
		expect(email2Color).not.toBe(email4Color);

		expect(email3Color).not.toBe(email4Color);
	});
});

describe('A suite of Outlook Mail Context Provider tests', () => {
    it('Should check date is not today for a past date', () => {
        const response = isToday(new Date('1921-06-28T04:21:25Z'));
        expect(response).toBeFalsy();
    });

    it('Should check date is not today for a future date', () => {
        const response = isToday(new Date('9999-06-28T04:21:25Z'));
        expect(response).toBeFalsy();
    });

    it('Should check date is today', () => {
        const response = isToday(new Date());
        expect(response).toBeTruthy();
    });

    it('Should check Initials is KK', () => {
        const response = getInitials('Kant, Krishna');
        expect(response).toBe('KK');
    });

    it('Should check Initials is M', () => {
        const response = getInitials('MyAnalytics');
        expect(response).toBe('M');
    });

    it('Should check Initials is ER', () => {
        const response = getInitials('Ellucian Recommended Updates (Confluence)');
        expect(response).toBe('ER');
    });
});
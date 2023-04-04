module.exports = {
    name: 'NWC Microsoft Cards',
    publisher: 'Northwest College',
    configuration: {
        client: [{
            key: 'aadRedirectUrl',
            label: 'Azure AD Redirect URL',
            type: 'url',
            required: true
        }, {
            key: 'aadClientId',
            label: 'Azure AD Application (Client) ID',
            type: 'text',
            required: true
        }, {
            key: 'aadTenantId',
            label: 'Azure AD Tenant ID',
            type: 'text',
            required: true
        }, {
            key: 'maxMessageCount',
            label: 'Maximum number of messages to retrieve. (currently unsupported)',
            type: 'numeric',
            required: false,
            default: 10
        }, {
            key: 'fetchUnreadOnly',
            label: 'Fetch only unread messages when true. (currently unsupported)',
            type: 'boolean',
            required: false,
            default: true
        }, ]
	},
    cards: [{
        type: 'W75_OutlookCard',
        source: './src/microsoft/cards/w75_OutlookMailCard',
        title: 'NWC Outlook',
        displayCardType: 'NWC Outlook',
        description: 'This card displays Office 365 Mail.'
    },
    {
        type: 'W75_OneDriveCard',
        source: './src/microsoft/cards/w75_OneDriveCard',
        title: 'NWC OneDrive',
        displayCardType: 'NWC OneDrive',
        description: 'This card displays OneDrive.'
    },
    {
        type: 'W75_OutlookCalendarCard',
        source: './src/microsoft/cards/w75_OutlookCalendarCard',
        title: 'NWC Outlook Calendar',
        displayCardType: 'NWC Outlook Calendar',
        description: 'This card displays your Outlook Calendar.'
    }]
};
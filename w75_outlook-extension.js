module.exports = {
    name: 'Microsoft Outlook Card',
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
    }]
}

// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

module.exports = {
    name: 'microsoft-productivity-tools',
    publisher: '',
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
        }]
	},
    cards: [{
        type: 'OutlookCard',
        source: './src/microsoft/cards/OutlookMailCard',
        title: 'Outlook',
        displayCardType: 'Outlook',
        description: 'This card displays Office 365 Mail'
    },
    {
        type: 'OneDriveCard',
        source: './src/microsoft/cards/OneDriveCard',
        title: 'OneDrive',
        displayCardType: 'OneDrive',
        description: 'This card displays OneDrive'
    }]
}

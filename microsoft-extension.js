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
        type: 'OutlookCard Test2',
        source: './src/microsoft/cards/OutlookMailCard',
        title: 'Outlook Beta Test2',
        displayCardType: 'Outlook Test 1',
        description: 'This card displays Office 365 Mail'
    },
    {
        type: 'OneDriveCard Test2',
        source: './src/microsoft/cards/OneDriveCard',
        title: 'OneDrive Beta Test2',
        displayCardType: 'OneDrive Test 1',
        description: 'This card displays OneDrive'
    }]
}

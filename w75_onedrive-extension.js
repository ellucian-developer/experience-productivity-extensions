module.exports = {
    name: 'Microsoft OneDrive Cards',
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
        } ]
	},
    cards: [{
        type: 'W75_OneDriveCard',
        source: './src/microsoft/cards/w75_OneDriveCard',
        title: 'NWC OneDrive',
        displayCardType: 'NWC OneDrive',
        description: 'This card displays OneDrive.'
    }]
}

module.exports = {
    "name": "Microsoft Productivity Tools",
    "publisher": "Ellucian",
    "configuration": {
		"client": [{
				"key": "aadClientId",
				"label": "Azure AD Application (Client) ID",
				"type": "text",
				"required": true
			}, {
				"key": "aadTenantId",
				"label": "Azure AD Tenant ID",
				"type": "text",
				"required": true
            }]
	},
    "cards": [{
        "type": "Outlook",
        "source": "./src/microsoft/cards/OutlookMailCard",
        "title": "Outlook",
        "displayCardType": "Outlook",
        "description": "This card displays Office 365 Mail"
    },
    {
        "type": "OneDriveCard",
        "source": "./src/microsoft/cards/OneDriveCard",
        "title": "OneDrive",
        "displayCardType": "OneDrive",
        "description": "This card displays OneDrive"
    }],
    "licensing": {
        "options": [
            {
                "requirements": [
                    { "licenseCode": "01t1M00000LbI6QQAV" }
                ]
            }
        ]
    }
}

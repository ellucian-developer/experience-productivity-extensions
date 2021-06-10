module.exports = {
    "name": "Microsoft Productivity Tools",
    "publisher": "Ellucian",
    "configuration": {
		"client": [{
				"key": "aadRedirectUrl",
				"label": "Azure AD Redirect URL",
				"type": "url",
				"required": true
			}, {
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
        "type": "Outlook Mail WIP",
        "source": "./src/microsoft/cards/OutlookMailCard",
        "title": "Outlook Mail WIP",
        "displayCardType": "MsOutlookMail WIP",
        "description": "This card displays Office 365 Mail"
    },
    {
        "type": "OneDriveCard",
        "source": "./src/microsoft/cards/OneDriveCard",
        "title": "OneDrive",
        "displayCardType": "MSEXPEXTN OneDrive",
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
    },
    "page": {
        "source": "./src/page/index.jsx"
    }
}

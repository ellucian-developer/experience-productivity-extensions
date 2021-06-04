module.exports = {
    "name": "MSEXPEXTN Microsoft Productivity Tools",
    "publisher": "Ellucian",
    "configuration": {
		"client": [{
				"key": "aadRedirectUrl",
				"label": "Azure AD Redirect URL",
				"type": "url",
				"required": true,
			}, {
				"key": "aadClientId",
				"label": "Azure AD Application (Client) ID",
				"type": "text",
				"required": true,
			}, {
				"key": "aadTenantId",
				"label": "Azure AD Tenant ID",
				"type": "text",
				"required": true,
            }]
	},
    "cards": [{       
        "type": "MSEXPEXTN OneDriveCard",
        "source": "./src/microsoft/cards/OneDriveCard",
        "title": "MSEXPEXTN OneDrive",
        "displayCardType": "MSEXPEXTN MsOneDrive",
        "description": "This card displays MSEXPEXTN OneDrive" 
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

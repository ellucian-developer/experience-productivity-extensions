module.exports = {
    "name": "Microsoft Productivity Tools",
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
            }, {
                "key": "userId",
                "label": "user Id",
                "type": "text",
                "required": true,
            }]
	},
    "cards": [{       
        "type": "OneDriveCard",
        "source": "./src/cards/OneDriveCard",
        "title": "OneDrive",
        "displayCardType": "MsOneDrive",
        "description": "This card displays MS OneDrive" 
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

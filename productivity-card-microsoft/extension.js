module.exports = {
    "name": "outlook-extension",
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
        "type": "OutlookCalendarCard",
        "source": "./src/cards/OutlookCards/OutlookCalendarCard",
        "title": "Outlook Calendar",
        "displayCardType": "Outlook Calendar",
        "description": "This card displays Office 365 Calendar"   
    }, {
        "type": "OutlookMailCard",
        "source": "./src/cards/OutlookCards/OutlookMailCard",
        "title": "Outlook Mail",
        "displayCardType": "Outlook Mail",
        "description": "This card displays Office 365 Mail"              
    }, {
        "type": "TeamsCard",
        "source": "./src/cards/TeamsCards/MSTeamsCard",
        "title": "Microsoft Teams",
        "displayCardType": "Microsoft Teams",
        "description": "This card displays Microsoft Teams information"              
    }, {       
        "type": "OneDriveCard",
        "source": "./src/cards/OutlookCards/OneDriveCard",
        "title": "OneDrive",
        "displayCardType": "OneDrive",
        "description": "This card displays Microsoft OneDrive" 
    }],
    "page": {
        "source": "./src/page/index.jsx"
    }
}

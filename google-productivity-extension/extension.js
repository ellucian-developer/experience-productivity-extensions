module.exports = {
    'name': 'Google Productivity Extension',
    'publisher': 'Sample',
    "configuration": {
		"client": [{
				"key": "googleOAuthClientId",
				"label": "Google OAuth Client ID",
				"type": "string",
				"required": true
            }]
	},
    'cards': [{
        'type': 'DriveCard',
        'source': './src/cards/DriveCard',
        'title': 'Google Drive',
        'displayCardType': 'Google Drive',
        'description': 'Google Drive card'
    },
    {
        'type': 'MailCard',
        'source': './src/cards/GMailCard',
        'title': 'GMail',
        'displayCardType': 'GMail',
        'description': 'Google GMail card'
    }]
}
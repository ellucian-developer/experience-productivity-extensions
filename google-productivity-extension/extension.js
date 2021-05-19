module.exports = {
    'name': 'Google Productivity',
    'publisher': 'Ellucian',
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
        'source': './src/cards/GoogleDriveCard',
        'title': 'Google Drive',
        'displayCardType': 'Google Drive',
        'description': 'Google Drive card'
    },
    {
        'type': 'MailCard',
        'source': './src/cards/GMailCard',
        'title': 'Gmail',
        'displayCardType': 'Gmail',
        'description': 'Google Gmail card'
    }]
}
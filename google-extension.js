// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

module.exports = {
    name: 'google-productivity-tools',
    publisher: '',
    configuration: {
        client: [{
            key: 'googleOAuthClientId',
            label: 'Google OAuth Client ID',
            type: 'string',
            required: true
            }]
    },
    cards: [{
        type: 'DriveCard',
        source: './src/google/cards/GoogleDriveCard',
        title: 'Google Drive',
        displayCardType: 'Google Drive',
        description: 'Google Drive card'
    },
    {
        type: 'MailCard',
        source: './src/google/cards/GMailCard',
        title: 'Gmail',
        displayCardType: 'Gmail',
        description: 'Google Gmail card'
    }]
}
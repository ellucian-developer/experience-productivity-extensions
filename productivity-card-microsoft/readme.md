# Ellucian Experience Cards for Microsoft Office 365 (Calendar/Mail), OneDrive 

## Purpose

The Experience Cards are developed to show Microsoft Office 365 Calendar, Mail, and OneDrive.

Following cards:

1) OneDrive Card for Microsoft OneDrive
2) Calendar Card for Office 365
3) Mail Card for Office 365


## NPM Dependencies
MSAL
-   [MSAL - Microsoft Authentication Library for JavaScript](https://www.npmjs.com/package/msal)
MS Graph Client
-   [@microsoft/microsoft-graph-client](https://www.npmjs.com/package/@microsoft/microsoft-graph-client)

### Microsoft Graph APIs

**Microsoft Graph API**: 
**OneDrive**: https://docs.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0
**Mail**: https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview?view=graph-rest-1.0
**Calendar**: https://docs.microsoft.com/en-us/graph/api/resources/calendar?view=graph-rest-1.0
**Teams**: https://docs.microsoft.com/en-us/graph/api/resources/teams-api-overview?view=graph-rest-1.0
**Azure AD**:
Config AD:  https://docs.microsoft.com/en-us/azure/app-service/configure-authentication-provider-aad

**List OneDrive View** - https://docs.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0; https://docs.microsoft.com/en-us/graph/onedrive-concept-overview; 
**List Calendar View** - https://docs.microsoft.com/en-us/graph/api/calendar-list-calendarview?view=graph-rest-1.0&tabs=javascript  
**List Messages** - https://docs.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0&tabs=http  
_Filter_ - https://docs.microsoft.com/en-us/graph/query-parameters#filter-parameter


### Author
This code reuses orriginal code developed for Mail and Calendar based on previous version of Experience framework by Terrence Mahnken.

New code are developed in the following:  
 - creating a new OneDrive card, 
 - creating a new Teams card, (using both GA API, and Beta API for message)
 - using right API to retrieve correct count of unread email Inbox messages
 - adding missing support (handling user ID as configuration) 
 - fixing compilation errors / eslint errors

Further refactoring are expected, including using latest Microsoft Graph API as possible, etc.



# Below are info about how to create, install and start the appliction

# Create Experience Extension
This module bootstraps your Ellucian Experience Extension development by creating an extension project. This module is primarily used to create your initial project. From this, you would add cards and make modifications. This project should be placed under your source control.

## Quick Start
```sh
npx git+ssh://git@source.ellucian.com/experience/create-experience-extension my-extension
cd my-extension
npm install
npm start
```

At this point, you have a running development environment that will watch for changes and automatically deploy updated builds. Keep an eye on the terminal for build or lint errors that block changes from being uploaded.

**NOTE:** This is using the real Experience Dashboard so your extension will not be visible until it is fully set up. This means you must enable your extension in Experience Setup and configure your card(s) in the Dashboard. This will be required each time you change your extension's version number.

## Extension Manifest
When an Extension is bundled for uploading to Ellucian Experience, the information specified in the src folder (cards and i18n), package.json, and extension.js file are used to generate a manifest.json file which provides the Ellucian Experience framework the information it needs to handle the creation and management of the Extension and its Cards.

The extension.js file located in the root of the extension folder defines the Extension package containing one or more Cards. This includes identifying information about the Extension as a whole, configuration attribute definitions for the Extension, as well as Card-specific attributes for each Card contained in the Extension.

| Attribute | Description |
|-----------|-------------|
| publisher      | The organizational name of the extension publisher, such as 'Ellucian' or 'Drexel'|
| name           | The internal name of the Extension (this is not displayed to users) - should match the package.json name, but doesn't have to. Note this name should not change once the extension is in use. The extension name is used to generate a namespaced card ID.|
| configuration  | Define configuration values shared among the Extension Cards in this object. These configuration values appear in the Configure step when a card manager is configuring a Card contained in the Extension. |
| cards          | The list of Cards present in the Extension package.|

Each card in the cards array has several required attributes.

| Card Attribute  | Description |
|-----------------|-------------|
| type            | A unique key to identify the type of the Card. No spaces should appear in the type. Once the extension is distributed to users, you should not alter this value as it is a key identifier |
| configuration   | Define configuration values unique to the Card in this object. These configuration values appear in the Configure step when a card manager is configuring the Card. |
| description     | The default description of the Card. Card managers will be able to override this when configuring the Card for their users.|
| title           | The default title of the Card appearing to users in the Experience Dashboard. Card managers will be able to override this value when configuring the Card for their users.|
| source          | The file system path to the Card's source, relative from the Extension root folder. Example: './src/cards/HelloWorldCard' (with or without the .jsx)|
| displayCardType | The type of the card as displayed to card managers on the Card Management page of Experience Dashboard. Example: "Hello World Card"|

## Package Scripts
Below is a short description of the scripts found in package.json.
| Script | Description |
|--------|-------------|
| build-dev | Package the development build. |
| build-prod | Package the production build. |
| deploy-dev | Package and deploy the development build. |
| deploy-prod | Package and deploy the production build. |
| start | Package and deploy the development build while also watching for changes to automatically deploy updated builds. |
| lint | Run eslint to check code against linting rules. |
| test | Run unit tests via Jest |


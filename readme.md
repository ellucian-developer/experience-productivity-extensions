# <div style="text-align: center">Productivity Tools Extensions</div>
Includes Google Productivity Tools and the Microsoft Productivity Tools as Experience extensions. What is [Ellucian Experience](https://www.ellucian.com/solutions/ellucian-experience)
<br/><br/>

# Contents
- [Google Cards](#google-cards)
- [Microsoft Cards](#microsoft-cards)
- [Two Extension, One Repository](#two-extensions)
- [Get the source](#get-the-source)
- [Google Extension - build, upload and configure](#google-build)
- [Microsoft Extension - build, upload and configure](#microsoft-build)

# <a name="google-cards"></a>Google Productivity Tools cards
The Google extension includes two cards Gmail and Google Drive.

![](docs/images/google-cards.png)

## Gmail card
The Gmail card in Ellucian Experience displays the 10 most recent inbox emails (both read and unread) from a user’s Gmail account. For each email, the card displays the sender’s name, subject, first line of the message, date received, and document icon (if an attachment exists). The user can click on any email in the Experience card to launch Gmail and open that email.

When a user first adds the Gmail card to their Experience Dashboard, they are prompted to sign in to grant permissions and authenticate their Google account. Only one account may be authenticated to the Gmail card at a time. To switch to another account, the user can sign out and then sign in with the other account.

The list of emails in the card updates automatically every 60 seconds to display any new emails.

## Google Drive card
The Google Drive card in Ellucian Experience displays the 10 most recently modified documents from a user’s Google Drive account. For each document, the card displays the document title, modified date, name of the user who last modified the document, and an icon representing the document type. The user can click on any file name in the card to launch the Google Drive web application and open the selected file.

When a user first adds the Google Drive card to their Experience Dashboard, they are prompted to sign in to grant permissions and authenticate their Google account. Only one account may be authenticated to the Google Drive card at a time. To switch to another account, the user can sign out and then sign in with the other account.

The list of documents in the card updates automatically every 60 seconds to display any newly modified documents.

# <a name="microsoft-cards"></a>Microsoft Productivity Tools cards
The Microsoft extension includes two cards Outlook and OneDrive.

![](docs/images/microsoft-cards.png)

## Outlook card
The Outlook card in Ellucian Experience displays the 10 most recent inbox emails (both read and unread) from a user’s Outlook account. For each email, the card displays the sender’s profile image, name, subject, first line of the message, date received, and document icon (if an attachment exists). The user can click on any email in the Experience card to launch Outlook.

When a user first adds the Outlook card to their Experience Dashboard, they are prompted to sign in to grant permissions and authenticate their Outlook account. Only one account may be authenticated to the Outlook card at a time. To switch to another account, the user can sign out and then sign in with the other account.

The list of emails in the card updates automatically every 60 seconds to display any new emails.

## OneDirve card
The Microsoft OneDrive card in Ellucian Experience displays the 10 most recently modified documents from a user’s OneDrive account. For each document, the card displays the document title, modified date, name of the user who last modified the document, and an icon representing the document type. The user can click on any file name in the card to launch the Microsoft OneDrive web application and open the selected file.

When a user first adds the Microsoft OneDrive card to their Experience Dashboard, they are prompted to sign in to grant permissions and authenticate their Microsoft account. Only one account may be authenticated to the Microsoft OneDrive card at a time. To switch to another account, the user can sign out and then sign in with the other account.

The list of documents in the card updates automatically every 60 seconds to display any newly modified documents.

# <a name="two-extensions"></a>Two extensions, One repository
To more easily share code between the two extensions, they have been combined into a single node package. This means there are departures from the standard Experience Extension npm scripts, extension.js, and webpack.config.js. There are separate Google and Microsoft version of each.

For instance, during development of the Google extension, use 'npm run google-start' in a terminal to run the webpack watch that builds as you make changes to the Google extension. Likewise during development of the Microsoft extensions use 'npm run microsoft-start'.

To see all the npm run scripts, use 'npm run'

google-extension.js defines the Google Productivity Tools extension with its cards.
microsoft-extension.js defines the Microsoft Productivity Tools extension with its cards.

Note each version of the webpack.config.js uses the appropriate extension.js. This provides the separate entry points for each extension's cards.

# <a name="get-the-source"></a>Get the source
Use your favorite Git tool to clone this repository.

# <a name="google-build"></a>Google Extension - build, upload and configure

1. Obtain an upload token from Experience Setup. See Experience documentation - [Explore the SDK sample content](https://resources.elluciancloud.com/bundle/ellucian_experience_acn_use/page/t_explore_sdk_sample_content.html)
2. Add the upload token to .env. See sample.env in package root.
3. Run 'npm install' to install all the dependencies.
4. Run one a deployment npm scripts, such as 'npm run google-start' (for development)
5. Enable the extension and add it to an environment(s) in [Experience Setup -> Extensions](https://experiencesetup-test.elluciancloud.com/extensions)
6. Configure the cards in the Dashboard -> Configuration -> Card Management. Adding the Google OAuth Client ID in step 3. Details below.

# <a name="google-configuration"></a>Google Configuration
The Google cards use a Google OAuth client ID to initiate an OAuth Authorization Code flow with PKCE. This is done using Google Identity's Google Sign-In for Websites [see reference](https://developers.google.com/identity/sign-in/web/reference)

The Google OAuth client ID needs to be added by using Experience -> Configuration -> Card Management. Each card will need to be configured to add the required 'Card tags', chose role(s) and to add the OAuth client ID. The OAuth client ID is on step three of the card configuration wizard. A valid Google OAuth client ID will end with '.apps.googleusercontent.com'. Details on creating the OAuth Client ID are below.

## <a name="google-credentials"></a>Creating an Google Cloud API credentials for OAuth
### Create a project
1. Login to Google Cloud Platform console at https://console.cloud.google.com.
1. Click on the project dropdown in the nav bar and click on "New Project", name apropriately, something like "Experience Test". Click on "Create"

### Create an OAuth Consent
1. Click on "APIs & Services", then OAuth consent screen
1. Select a User Type of "Internal" (Note if you use external you will need to manage test users and later publish), then click on "Create"
1. Enter an App name, such as Experience. Select a required support email and if desired the App logo.
1. Then add an Authorized domain of "elluciancloud.com"
1. Then add the required Developer email address, then "SAVE AND CONTINUE"
1. On this step you are defining what permissions this app is allowed to request. Click on "ADD OR REMOVE SCOPES".
1. In the dialog near the top there is an info box which has a link to Google API Library. Click this link and it will open a new tab.
1. In the new tab search for Gmail and click on "Gmail API". When it opens click on the "Enable" button. Wait for it to complete, then close the tab
1. Once more click on the "Google API Library" link and which opens in a new tab
1. In the new tab search for Google Drive and click on "Google Drive API". When it opens click on the "Enable" button. Wait for it to complete, then close the tab.
1. Now to get the newly enabled API permissions to show in the list, refresh the browser. You may have to click on "SAVE AND CONTINUE" again to get to the "ADD OR REMOVE SCOPES" button. Click this again as well.
1. Now filter for gmail.readonly and select the check box next to it - Don't worry about the mislabled API on this one. It shows Google Drive API even though this is for Gmail API
1. Clear the filter and filter for drive.readonly, then select the check box for this permission.
1. Click on the "UPDATE" button, then the "SAVE AND CONTINUE" - OAuth consent is done.

### Create an OAuth Credential
1. In the left nav select "Credentials". You need to create an OAuth 2.0 Client ID. Click on "CREATE CREDENTIALS" at the top and pick OAuth client ID
1. Choose Application type of "Web application", then name it something like "Experience"
1. Add a URI to the Authorized JavaScript origins. For Test use https://experience-test.elluciancloud.com. For Prod use https://experience.elluciancloud.com.
1. Click on "CREATE". You can copy the Client ID from here. Client Secret is not needed.

# <a name="microsoft-build"></a>Microsoft Extension - build, upload and configure

1. Obtain an upload token from Experience Setup. See Experience documentation - [Explore the SDK sample content](https://resources.elluciancloud.com/bundle/ellucian_experience_acn_use/page/t_explore_sdk_sample_content.html)
2. Add the upload token to .env. See sample.env in package root.
3. Run 'npm install' to install all the dependencies.
4. Run one a deployment npm scripts, such as 'npm run microsoft-start' (for development)
5. Enable the extension and add it to an environment(s) in [Experience Setup -> Extensions](https://experiencesetup-test.elluciancloud.com/extensions)
6. Configure the cards in the Dashboard -> Configuration -> Card Management. Adding the Azure Redirect URL, Applciation ID, and Tenant ID in step 3. Details below.

## <a name="microsoft-configuration"></a>Microsoft Configuration
The Microsoft cards use a Azure AD Application ID to initiate an OAuth Authorization Code flow with PKCE. This is done using the Microsoft Authentication Library for js [see reference](https://github.com/AzureAD/microsoft-authentication-library-for-js#readme)

The Microsoft Azure Redirect URL, Applciation ID, and Tenant ID need to be added by using Experience -> Configuration -> Card Management. Each card will need to be configured to add the required 'Card tags', chose role(s) and to add the URL and IDs. The URL and IDs are entered on step three of the card configuration wizard.

## <a name="microsoft-credentials"></a>Creating an Azure Application with OAuth
### Follow the steps below to configure the application in Azure Active Directory:
1. Login to Azure portal https://portal.azure.com and select the Azure Active Directory Service.
2. Click the ‘App Registrations’ and create a new application in the tenant of your choice.
3. Provide the name of your choice eg. Experience-Office365-Integration.
4. Set the Redirect URI for Single Page application, set this to the Ellucian Experience Dashboard URL from the About tab in Experience Setup . 
5. Click the application link you just created, and navigate to Redirect URIs ‘spa’ link.
6. Make sure it shows the Grant Type ‘Your Redirect URI is eligible for the Authorization Code Flow with PKCE’.
7. The application has been created successfully.
### Set API Permissions
1. You are now good to add permissions for the application, open the API permissions for the selected application.
2. Click ‘Add a permission’.
3. Click Microsoft Graph and select the delegated permissions.
4. You would now be able to add permissions by selecting the permission and click Add Permission button, you would need to add the following permissions:
    1. User.Read
    2. User.ReadBasic.All
    3. Mail.Read
    4. Mail.Read.Shared
    5. Files.Read
    6. Files.Read.All
5. Click the Grant Admin consent.

    After setting the API permissions, here is how it will look:
    ![](docs/images/microsoft-application-api-permission.png)

1. The API permissions are set now.
2. Copy the ClientId and TenantId for the application, and configure it in the Experience OneDrive card configuration.
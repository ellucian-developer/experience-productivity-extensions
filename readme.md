# <div style="text-align: center">Productivity Tools Extensions</div>
Includes Google Productivity Tools and the Microsoft Productivity Tools as Experience extensions. What is [Ellucian Experience](https://www.ellucian.com/solutions/ellucian-experience)
<br/><br/>

#Contents
- [Google Cards](#google-cards)
- [Microsoft Cards](#microsoft-cards)

# <a name="google-cards"></a>Google Productivity Tools
The Google extension includes two cards Gmail and Google Drive.

![](docs/images/google-cards.png)

## Gmail card

## Google Drive card
The Google Drive card in Ellucian Experience displays the 10 most recently modified documents from a user’s Google Drive account. For each document, the card displays the document title, modified date, name of the user who last modified the document, and an icon representing the document type. The user can click on any file name in the card to launch the Google Drive web application and open the selected file.

When a user first adds the Google Drive card to their Experience Dashboard, they are prompted to sign in to grant permissions and authenticate their Google account. Only one account may be authenticated to the Google Drive card at a time. To switch to another account, the user can sign out and then sign in with the other account.

The list of documents in the card updates automatically every 60 seconds to display any newly modified documents.

## Configuring Google cards
The Google cards use a Google OAuth client ID to initiate an OAuth Webflow with PKCE. This is done using Google Identity's Google Sign-In for Websites [see reference](https://developers.google.com/identity/sign-in/web/reference)

# <a name="microsoft-cards"></a>Microsoft Productivity Tools
The Microsoft extension includes two cards Outlook and OneDrive.

![](docs/images/microsoft-cards.png)

## Outlook card

## OneDirve card
The Microsoft OneDrive card in Ellucian Experience displays the 10 most recently modified documents from a user’s OneDrive account. For each document, the card displays the document title, modified date, name of the user who last modified the document, and an icon representing the document type. The user can click on any file name in the card to launch the Microsoft OneDrive web application and open the selected file.

When a user first adds the Microsoft OneDrive card to their Experience Dashboard, they are prompted to sign in to grant permissions and authenticate their Microsoft account. Only one account may be authenticated to the Microsoft OneDrive card at a time. To switch to another account, the user can sign out and then sign in with the other account.

The list of documents in the card updates automatically every 60 seconds to display any newly modified documents.

# Two extensions, One package
To more easily share code between the two extensions, they were combined into a single package. This means there are departures from the standard Experience Extension npm scripts, extension.js and webpack.config.js. There are separate google- and microsoft- version of these.

For instance for development of the Google extension, use 'npm run google-start' in a terminal to run the webpack watch that builds as you make changes to the Google extension. Likewise for development of the Microsoft extensions use 'npm run microsoft-start'.

To see all the npm run scripts, use 'npm run'

google-extension.js defines the Google Productivity Tools extension with its cards and likewise microsoft-extension.js defines the Microsoft Productivity Tools extension with its cards.

Note each version of the webpack.config.js uses the appropriate extension.js. This provides the separate entry points for each extension.

## Google Extension Setup
1. Obtain an upload token from Experience Setup. See Experience documentation.
2. Add the upload token to .env. See sample.env in package root.
3. Run 'npm install' to install all the dependencies.
4. Run one of the deployment npm scripts, such as 'npm run google-start' (for development)
5. Enable the extension and add it to an environment(s) in Experience Setup -> Extensions
6. Configure the cards in the Dashboard -> Configuration -> Card Management. Adding the Google OAuth Client ID in step 3.


Items to add to this document

1. Included Functional Documentation
2. Step by Step to Google and Microsoft setup?
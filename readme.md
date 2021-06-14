# Google and Microsoft Productivity Extensions
This packages contains two Experience extensions. The Google Productivity Tools and the Microsoft Productivity Tools.

## Google Productivity Tools
The Google extension includes two cards Gmail and Drive, which are defined in google-extensions.js

## Two extensions, One package
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
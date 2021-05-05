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

**List OneDrive View** - https://docs.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0; https://docs.microsoft.com/en-us/graph/onedrive-concept-overview; 
**List Calendar View** - https://docs.microsoft.com/en-us/graph/api/calendar-list-calendarview?view=graph-rest-1.0&tabs=javascript  
**List Messages** - https://docs.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0&tabs=http  
_Filter_ - https://docs.microsoft.com/en-us/graph/query-parameters#filter-parameter

### Author

This code reuses much of orriginal code developed for Mail and Calendar based on previous version of Experience framework by Terrence Mahnken.

New code are developed in the following:  
 - creating a new OneDrive card, 
 - correcting retrieval of number of unread email for Inbox (previous way returns wrong count)
 - adding missing support (handling user ID as configuration) 
 - fixing compilation errors / eslint errors

Expect further refactoring, including using latest Microsoft Graph API as possible, etc.


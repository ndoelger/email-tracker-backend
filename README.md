![Logo](https://1000logos.net/wp-content/uploads/2022/12/HubSpot-Logo.png)

![Badge](https://img.shields.io/badge/axios-671ddf?&style=for-the-badge&logo=axios&logoColor=white)
![Badge](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)


# HubSpot Email Tracker

Welcome to The Email Tracker! You can use this app for a simple way to create and edit your HubSpot email titles, subjects, and previews. It’s great for efficient content editing, not needed to go into every email to update the SL/PV manually.

This is the backend server to The Email Tracker, an easy way to manager your HubSpot email content. The following backend utilizes the following mechanisms to CRUD your HubSpot email data:

**HubSpot Oauth2:** \
The backend communicate’s with HubSpot’s Oauth2, receiving an access code that registers and stores the account’s access token refresh token through the server’s sessionID. It's the stored in the server's cache, remaining there for the remainder of the session. When the access token expires (every 30 minutes), the refresh token will be then used to register a new access token.

**REST API Operations:**\
This app can create, edit, and delete marketing emails in you HubSpot account. It does so cleanly and effortlessly, without the tediosity of opening every single email and clicking around!

**SQL Database:**\
With every operation, an external relational database will store all emails and edits, along with linking every email with the user id, also stored in the database.

This frontend connects to the email-tracker-frontend, [linked here](https://github.com/ndoelger/email-tracker-frontend).

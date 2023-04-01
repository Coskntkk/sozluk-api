
# SOZLUK-API

REST API for a collaborative dictionary project.

## Features

- Authentication system including register, login, isLoggedIn and logout.
- Global error handling
- checkReqBody and checkAuthentication middlewares
- Preset user model in mongodb and error model in postgresql


## Tech Stack

**Server:** Node, Express


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file.

```
### Server ###
PORT=
NODE_ENV=
API_URL=
API_URL_DEV=
CLIENT_URL=
CLIENT_URL_DEV=

### Database ###
DB_USER=
DB_PASSWORD=
DB_ADDRESS=
DB_PORT=
DB_NAME=

### Tokens ###
JWT_SECRET=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
SESSION_SECRET=
VERIFICATION_TOKEN_SECRET=

### Email ###
SMPT_HOST=
SMPT_PORT=
SMPT_SERVICE=
SMPT_MAIL=
SMPT_PASSWORD=
```

## Installation

Install my-project with npm

```bash
  git clone https://github.com/Coskntkk/sozluk-api.git
  cd sozluk-api
  npm install 
  npm start
```


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

`PORT` 
`NODE_ENV`
`INITIAL`
`JWT_SECRET`
`DB_NAME`
`DB_ADDRESS`
`DB_PORT`
`DB_USER`
`DB_PASSWORD`

## Installation

Install my-project with npm

```bash
  git clone https://github.com/Coskntkk/sozluk-api.git
  cd sozluk-api
  npm install 
  npm start
```

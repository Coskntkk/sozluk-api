# Sozluk API

REST API for a collaborative dictionary (“sozluk” in Turkish) titles, entries, votes, follows, notifications, and role-based access, built with **Node.js** and **Express**.

All HTTP routes are served under **`/api/v1`**.

---

## Features

- **Authentication** — Register, email verification, login, refresh access tokens, logout, password reset flow  
- **Content** — Titles, entries, pagination, voting on entries  
- **Social** — Follow / unfollow users  
- **Notifications** — List notifications, mark as read  
- **Authorization** — Permission checks on sensitive routes (scopes loaded at startup)  
- **Operations** — Centralized errors, optional auth for mixed public/private reads, response compression  

---

## Tech stack

| Layer        | Choice                          |
| ------------ | ------------------------------- |
| Runtime      | Node.js                         |
| HTTP         | Express                         |
| Database     | PostgreSQL                      |
| ORM          | Sequelize 6                     |
| Auth tokens  | JWT (access + refresh + email verification) |
| Email        | Nodemailer + Handlebars templates |

---

## Prerequisites

- **Node.js** (LTS recommended)  
- **PostgreSQL** instance and an empty database the app can use  

On first boot the app runs **`sequelize.sync({ force: false })`** against your database, so tables are created from models when they do not already exist.

---

## Quick start

```bash
git clone https://github.com/Coskntkk/sozluk-api.git
cd sozluk-api
npm install
```

Create a **`.env`** file in the project root (see [Environment variables](#environment-variables)).

```bash
npm run dev    # hot reload via nodemon
# or
npm start      # production-style: node bin/www
```

Default listen port is **`3000`** if `PORT` is unset. Base URL for API calls:

`http://localhost:<PORT>/api/v1`

---

## Environment variables

Copy the block below into `.env` and fill in values. Names match the codebase (including email variable prefixes).

### Server

| Variable   | Description |
| ---------- | ----------- |
| `PORT`     | HTTP port (default `3000`) |
| `NODE_ENV` | e.g. `development` or `production` (affects logging, URL selection) |

### URLs

| Variable         | Description |
| ---------------- | ----------- |
| `API_URL`        | Public API base URL in **production** (used in verification emails) |
| `API_URL_DEV`    | API base URL in **development** |
| `CLIENT_URL`     | Frontend origin in **production** (redirects after verify, etc.) |
| `CLIENT_URL_DEV` | Frontend origin in **development** |

### Database

| Variable      | Description        |
| ------------- | ------------------ |
| `DB_USER`     | PostgreSQL user    |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_ADDRESS`  | Host               |
| `DB_PORT`     | Port (integer)     |
| `DB_NAME`     | Database name      |

### JWT / tokens

| Variable                    | Description |
| --------------------------- | ----------- |
| `ACCESS_TOKEN_SECRET`       | Sign / verify access JWT |
| `REFRESH_TOKEN_SECRET`      | Sign / verify refresh JWT |
| `VERIFICATION_TOKEN_SECRET` | Email verification JWT |

Use long, random secrets in production.

### Email (Nodemailer)

The application reads variables prefixed with **`SMPT_`** (as implemented in `utils/emailFunctions.js`):

| Variable         | Description |
| ---------------- | ----------- |
| `SMPT_HOST`      | SMTP host   |
| `SMPT_PORT`      | SMTP port   |
| `SMPT_MAIL`      | Auth user / from mailbox |
| `SMPT_PASSWORD`  | SMTP password |

`SMPT_SERVICE` exists in older docs but is commented out in code; host/port/mail/password are enough for typical setups.

---

## NPM scripts

| Script            | Command              | Purpose |
| ----------------- | -------------------- | ------- |
| `dev`             | `nodemon bin/www`    | Local development with reload |
| `start`           | `node bin/www`       | Run server |
| `lint:check`      | `eslint .`           | Lint |
| `lint:fix`        | `eslint --fix .`     | Lint with auto-fix |
| `format:check`    | `prettier --check .` | Check formatting |
| `format:write`    | `prettier --write .` | Format files |

---

## API overview

Prefix every path with **`/api/v1`**.

### Auth — `/auth`

Sessions use **httpOnly cookies** (`access_token` ~15m, `refresh_token` ~7d). The client must send **`credentials: 'include'`** / **`withCredentials: true`**. Tokens are not returned in JSON.

**CORS:** set `CLIENT_URL` / `CLIENT_URL_DEV` to your frontend origin (e.g. `http://localhost:3001`). In development, `http://localhost:3001` and `http://127.0.0.1:3001` are always allowed.

**Legacy:** `x-access-token` header is still read if the cookie is absent (tools / gradual migration).

| Method | Path | Notes |
| ------ | ---- | ----- |
| `POST` | `/register` | Body: `username`, `email`, `password` |
| `GET`  | `/me` | Session user from cookie; requires valid access |
| `GET`  | `/verify/:token` | Email verification link |
| `POST` | `/login` | Body: `username`, `password` — sets auth cookies |
| `POST` | `/accessToken` | New access cookie from refresh cookie |
| `GET`  | `/logout` | Clears cookies; requires auth |
| `POST` | `/password` | Body: `email` (reset flow) |
| `POST` | `/password/reset` | Body: `token`, `password` |

### Home — `/home`

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET`  | `/latest` | Latest title + entries |
| `GET`  | `/leftframe` | Sidebar-style data |
| `GET`  | `/rightframe` | Authenticated home frame |

### Users — `/users`

| Method   | Path | Notes |
| -------- | ---- | ----- |
| `GET`    | `/:username` | Public profile; optional auth enriches response |
| `PUT`    | `/:username` | Update own profile |
| `GET`    | `/:username/entries` | Requires `entry_read` permission |
| `GET`    | `/:username/follow` | Follow user (must be logged in) |
| `DELETE` | `/:username/unfollow` | Unfollow |

### Titles — `/titles`

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET`  | `/` | Paginated list |
| `POST` | `/` | Create title (auth) |
| `GET`  | `/:id` | Title + paginated entries |
| `POST` | `/:id/entries` | Add entry under title (auth) |

### Entries — `/entries`

| Method   | Path | Notes |
| -------- | ---- | ----- |
| `GET`    | `/:id` | Single entry |
| `PUT`    | `/:id` | Update (auth) |
| `DELETE` | `/:id` | Delete (auth) |
| `POST`   | `/:id/votes` | Vote (auth) |
| `DELETE` | `/:id/votes` | Remove vote (auth) |

### Notifications — `/notification`

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET`  | `/` | List (auth) |
| `GET`  | `/:id/read` | Mark read (auth) |

### Mounted placeholders

Routers **`/roles`** and **`/report`** are registered but their route handlers are currently commented out in the codebase—useful for future admin or moderation APIs.

---

## Project layout

```
sozluk-api/
├── app.js                 # Express app, CORS, routes, error handler
├── bin/www                # HTTP server entry
├── controllers/           # Route handlers / business logic
├── db/
│   ├── postgres.js        # Sequelize instance + sync
│   ├── models/            # Sequelize models
│   ├── seed/              # Optional seed helpers
│   └── models.js          # Model wiring
├── middlewares/           # Auth, pagination, body/param checks
├── routes/                # Routers per resource
└── utils/                 # Errors, email, JWT helpers, templates
```

---

## Debugging SQL

Database logging uses the `debug` package. To print SQL in the console:

```bash
DEBUG=sql npm run dev
```

---

## License

[MIT](LICENSE) — Copyright (c) 2022 Coşkun Atak

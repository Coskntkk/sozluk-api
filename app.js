// Libraries
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const compression = require("compression");
const cors = require("cors");

// Express app instance
const app = express();

// Database connections
require("./db/postgres");

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_DEV,
    ...(process.env.NODE_ENV !== "production"
      ? ["http://localhost:3001", "http://127.0.0.1:3001"]
      : []),
  ].filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: ["x-total-count"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Importing Global Error Handler
const globalErrorHandler = require("./utils/globalErrorHandler");

// Routes
const checkAuthenticationOptional = require("./middlewares/checkAuthenticationOptional");
const indexRouter = require("./routes/index");
app.use("/api/v1",
  checkAuthenticationOptional(), indexRouter);

// Error handling middleware
app.use(globalErrorHandler);
const { getGlobalValues } = require("./utils/getGlobals");

const { fillDb } = require('./db/seed/dumps');
const { createDb } = require('./db/seed/seed');
(async () => {
  const { roles, permissions } = await getGlobalValues();
  global.roles = roles;
  global.permissions = permissions;

  let isFillDb = null;
  if (isFillDb !== null) {
    if (isFillDb === true) await fillDb()
    else await createDb()
  }
})();

// Export app
module.exports = app;

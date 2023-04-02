// Libraries
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const compression = require('compression');
const cors = require('cors');

// Express app instance
const app = express();

// Database connections
require('./db/postgres');

// Express middlewares
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        exposedHeaders: ["x-total-count", "x-access-token", "x-refresh-token"],
        domain: ["http://localhost:3030", "http://localhost:3030"]
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Importing Global Error Handler
const globalErrorHandler = require('./utils/globalErrorHandler');

// Routes
const indexRouter = require('./routes/index');
app.use('/api/v1', require("./middlewares/configureReq")(), indexRouter);

// Error handling middleware
app.use(globalErrorHandler);

// Export app
module.exports = app;

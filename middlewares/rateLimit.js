const rateLimit = require("express-rate-limit");

// Global rate limiter: 5 requests per second per IP
const globalLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 10, // 5 requests per second
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // eslint-disable-next-line no-unused-vars
    skip: (req) => {
        // Skip rate limiting for health checks or internal routes if needed
        return false;
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later.",
        });
    },
});

module.exports = { globalLimiter };

// Utils
const responses = require("../utils/responses.json");

// Configure the request
const configureReq = () => {
    return function (req, res, next) {
        try {
            // Set language
            let lang = req.headers["accept-language"] || "en";
            req.msg = responses[lang] || responses["en"];
            // Continue
            next();
        } catch (error) {
            console.log(error);
            res.status(400).send({ success: false, message: error.message, data: null });
        }
    };
}

// Export
module.exports = configureReq;
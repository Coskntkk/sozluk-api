// Utils
const respEn = require("../utils/responses/en.json");
const respTr = require("../utils/responses/tr.json");

// Configure the request
const configureReq = () => {
    return function (req, res, next) {
        try {
            // Set language
            let lang = req.headers["accept-language"] || "en";
            req.resps = lang === "en" ? respEn : respTr;
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
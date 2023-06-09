// 3rd party
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require('util');

// Generate a random string
const getRandomBytes = async (size) => {
    const key = await promisify(crypto.randomBytes)(size);
    return key.toString('hex');
};

const generateRandomString = (length) => {
    // Declare all characters
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // Pick characers randomly
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Return the result
    return result;
};

const encryptToken = async (token) => {
    try {
        // check if token exists and is a string
        if (!token || typeof (token) !== 'string') {
            return null;
        };
        // encrypt the token with Base64
        const encryptedToken = Buffer.from(token).toString('base64');
        // create a random string and encrypt to prefix the encrypted token
        const randomStringPrefix = await getRandomBytes(10);
        const encryptedPrefix = Buffer.from(randomStringPrefix).toString('base64');
        const configuredPrefix = encryptedPrefix.slice(0, encryptedPrefix.length - 1); // 27 chars long
        // create a random string and encrypt to inject in the middle of the encrypted token
        const randomStringMiddle = await getRandomBytes(20);
        const encryptedMiddle = Buffer.from(randomStringMiddle).toString('base64');
        const configuredMiddle = encryptedMiddle.slice(0, encryptedMiddle.length - 2); // 54 chars long
        // create seesion cookie
        const cookie = `${configuredPrefix}${encryptedToken.slice(0, 15)}${configuredMiddle}${encryptedToken.slice(15, encryptedToken.length)}`;
        // return the session cookie
        return cookie;
    } catch (e) {
        return null;
    }
};

const decryptToken = async (cookie) => {
    try {
        // check if token exists and is a string, and has the min length to be decrypted
        if (typeof (cookie) !== 'string' || cookie.length < 43) {
            return null;
        };
        // extract encrypted token from the cookie
        const unprefixedCookie = cookie.slice(27, cookie.length);
        const sanitizedCookie = unprefixedCookie.slice(0, 15) + unprefixedCookie.slice(69, unprefixedCookie.length);
        // decrypt the token to ascii
        const token = Buffer.from(sanitizedCookie, 'base64').toString('ascii');
        // return the session cookie
        return token;
    } catch (error) {
        console.log(error);
        return null;
    }
};

// Check password
const isPasswordCorrect = async (user, password) => {
    // Compare passwords and return result
    return await bcrypt.compare(password, user.password);
}

const generateInitialTokens = async (user) => {
    // Set refresh token payload
    const refresh_token_payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_id,
        key: generateRandomString(10),
    };
    // Create refresh token
    const refresh_token = await jwt.sign(refresh_token_payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    // Encrypt refresh token
    const refresh_token_encrypted = await encryptToken(refresh_token);
    // Save refresh token to database
    user.refresh_token = refresh_token_encrypted;
    // Set access token payload
    const access_token_payload = {
        id: user.id,
        key: refresh_token_payload.key,
    };
    // Create access token
    const access_token = await jwt.sign(access_token_payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });
    // Save user
    await user.save();
    // Return tokens
    return { refresh_token, access_token };
};

// Generate access token from refresh token
const generateAccessToken = async (refresh_token) => {
    // Get user's refresh token
    const refresh_token_decoded = await jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    // Generate new access token
    const payload = {
        id: refresh_token_decoded.id,
        key: refresh_token_decoded.key,
    };
    const access_token = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });
    // Return access token
    return access_token;
};

// Check if access token is valid
const checkIsAccessTokenValid = async (access_token, user) => {
    // Check if access token is valid and matches the refresh token
    let access_decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
    let refresh_decrypted = await decryptToken(user.refresh_token);
    let refresh_decoded = jwt.verify(refresh_decrypted, process.env.REFRESH_TOKEN_SECRET);
    // Check if access token key matches refresh token key
    if (access_decoded.key === refresh_decoded.key) {
        return true;
    } else {
        return false;
    }
};

const createVerificationToken = async (user) => {
    // Set payload
    const payload = {
        id: user.id,
        email: user.email,
    };
    // Create verification token
    const verification_token = await jwt.sign(payload, process.env.VERIFICATION_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    // Return verification token
    return verification_token;
};

const verifyVerificationToken = async (token) => {
    // Verify token
    const token_decoded = await jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
    // Return decoded token
    return token_decoded;
};

module.exports = {
    decryptToken,
    isPasswordCorrect,
    generateAccessToken,
    generateInitialTokens,
    checkIsAccessTokenValid,
    createVerificationToken,
    verifyVerificationToken
};
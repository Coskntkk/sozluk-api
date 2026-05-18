// 3rd party
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { User } = require("../db/models");
const AppError = require("./appError");

const getRandomBytes = async (size) => {
  const key = await promisify(crypto.randomBytes)(size);
  return key.toString("hex");
};

const generateSecureKey = async () => getRandomBytes(5);

const buildAccessTokenPayload = (user, key) => ({
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role_id,
    is_active: user.is_active,
  },
  key,
});

const signAccessToken = (user, key) =>
  jwt.sign(
    buildAccessTokenPayload(user, key),
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

const encryptToken = async (token) => {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }
    const encryptedToken = Buffer.from(token).toString("base64");
    const randomStringPrefix = await getRandomBytes(10);
    const encryptedPrefix = Buffer.from(randomStringPrefix).toString("base64");
    const configuredPrefix = encryptedPrefix.slice(
      0,
      encryptedPrefix.length - 1,
    );
    const randomStringMiddle = await getRandomBytes(20);
    const encryptedMiddle = Buffer.from(randomStringMiddle).toString("base64");
    const configuredMiddle = encryptedMiddle.slice(
      0,
      encryptedMiddle.length - 2,
    );
    return `${configuredPrefix}${encryptedToken.slice(0, 15)}${configuredMiddle}${encryptedToken.slice(15, encryptedToken.length)}`;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const decryptToken = async (cookie) => {
  try {
    if (typeof cookie !== "string" || cookie.length < 43) {
      return null;
    }
    const unprefixedCookie = cookie.slice(27, cookie.length);
    const sanitizedCookie =
      unprefixedCookie.slice(0, 15) +
      unprefixedCookie.slice(69, unprefixedCookie.length);
    return Buffer.from(sanitizedCookie, "base64").toString("ascii");
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getStoredRefreshToken = async (user) => {
  if (!user?.refresh_token) return null;
  return await decryptToken(user.refresh_token);
};

const verifyRefreshTokenForUser = async (refresh_token, user) => {
  if (!user?.refresh_token) {
    throw new AppError("Invalid refresh token", 401);
  }
  const storedRefresh = await getStoredRefreshToken(user);
  if (!storedRefresh || storedRefresh !== refresh_token) {
    throw new AppError("Invalid refresh token", 401);
  }
  const refresh_decoded = jwt.verify(
    refresh_token,
    process.env.REFRESH_TOKEN_SECRET,
  );
  if (refresh_decoded.id !== user.id) {
    throw new AppError("Invalid refresh token", 401);
  }
  return refresh_decoded;
};

const isPasswordCorrect = async (user, password) =>
  bcrypt.compare(password, user.password);

const generateInitialTokens = async (user) => {
  const key = await generateSecureKey();
  const refresh_token_payload = {
    id: user.id,
    key,
  };
  const refresh_token = jwt.sign(
    refresh_token_payload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  const refresh_token_encrypted = await encryptToken(refresh_token);
  user.refresh_token = refresh_token_encrypted;
  await user.save();

  const access_token = signAccessToken(user, key);
  return { refresh_token, access_token };
};

const generateAccessToken = async (refresh_token) => {
  let refresh_decoded;
  try {
    refresh_decoded = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findOne({ where: { id: refresh_decoded.id } });
  if (!user || !user.is_active) {
    throw new AppError("Invalid refresh token", 401);
  }

  await verifyRefreshTokenForUser(refresh_token, user);
  return signAccessToken(user, refresh_decoded.key);
};

const checkIsAccessTokenValid = async (access_token, user) => {
  try {
    const access_decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN_SECRET,
    );
    if (!access_decoded.key) return false;
    const storedRefresh = await getStoredRefreshToken(user);
    if (!storedRefresh) return false;
    const refresh_decoded = jwt.verify(
      storedRefresh,
      process.env.REFRESH_TOKEN_SECRET,
    );
    return access_decoded.key === refresh_decoded.key;
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // If refresh token verification fails, return false (session is invalid)
    return false;
  }
};

const createVerificationToken = async (user) => {
  const key = await generateSecureKey();
  const payload = {
    id: user.id,
    key,
  };
  const verification_token = jwt.sign(
    payload,
    process.env.VERIFICATION_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  return { verification_token, key };
};

const verifyVerificationToken = async (token) =>
  jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);

module.exports = {
  decryptToken,
  getStoredRefreshToken,
  isPasswordCorrect,
  generateAccessToken,
  generateInitialTokens,
  checkIsAccessTokenValid,
  createVerificationToken,
  verifyVerificationToken,
};

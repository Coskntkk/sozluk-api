const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const isProduction = () => process.env.NODE_ENV === "production";

/** Match Set-Cookie so clearCookie works in all browsers */
const baseCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  path: "/",
});

const setAuthCookies = (res, { access_token, refresh_token }) => {
  const base = baseCookieOptions();
  res.cookie(ACCESS_COOKIE, access_token, {
    ...base,
    maxAge: FIFTEEN_MIN_MS,
  });
  res.cookie(REFRESH_COOKIE, refresh_token, {
    ...base,
    maxAge: SEVEN_DAYS_MS,
  });
};

const setAccessTokenCookie = (res, access_token) => {
  res.cookie(ACCESS_COOKIE, access_token, {
    ...baseCookieOptions(),
    maxAge: FIFTEEN_MIN_MS,
  });
};

const clearAuthCookies = (res) => {
  const base = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
};

/** Authorization Bearer first; fallback to legacy headers or cookie */
const getAccessToken = (req) => {
  const authHeader = req.headers?.authorization;
  if (typeof authHeader === "string") {
    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) return token;
  }

  if (typeof req.headers["x-access-token"] === "string") {
    return req.headers["x-access-token"];
  }

  return req.cookies?.[ACCESS_COOKIE] ?? null;
};

const getRefreshToken = (req) => req.cookies?.[REFRESH_COOKIE] ?? null;

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setAuthCookies,
  setAccessTokenCookie,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
};

const crypto = require("crypto");

const IS_DEV = process.env.NODE_ENV === "development";

const SESSION_COOKIE = "quiz_control_session";
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const CONTROL_PASSWORD = process.env.CONTROL_PASSWORD || "911";

const sessions = new Map();

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach(function (part) {
    const idx = part.indexOf("=");
    if (idx < 0) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function getTokenFromCookies(cookies) {
  return cookies && cookies[SESSION_COOKIE] ? cookies[SESSION_COOKIE] : null;
}

function getTokenFromRequest(req) {
  return getTokenFromCookies(parseCookies(req.headers.cookie));
}

function getTokenFromHandshake(handshake) {
  return getTokenFromCookies(parseCookies(handshake.headers.cookie));
}

function isValidSession(token) {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() >= expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function isAuthBypassed() {
  return IS_DEV;
}

function isAuthenticatedRequest(req) {
  if (isAuthBypassed()) return true;
  return isValidSession(getTokenFromRequest(req));
}

function isAuthenticatedHandshake(handshake) {
  if (isAuthBypassed()) return true;
  return isValidSession(getTokenFromHandshake(handshake));
}

function validatePassword(password) {
  return String(password) === CONTROL_PASSWORD;
}

function setSessionCookie(res, token) {
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    SESSION_COOKIE +
      "=" +
      encodeURIComponent(token) +
      "; HttpOnly; SameSite=Lax; Path=/; Max-Age=" +
      maxAgeSec
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    SESSION_COOKIE + "=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
  );
}

function createSession(res) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, expiresAt);
  setSessionCookie(res, token);
  return { expiresAt: expiresAt };
}

function clearSession(req, res) {
  const token = getTokenFromRequest(req);
  if (token) sessions.delete(token);
  clearSessionCookie(res);
}

function sessionInfo(req) {
  if (isAuthBypassed()) {
    return { authenticated: true, devBypass: true };
  }
  const token = getTokenFromRequest(req);
  if (!isValidSession(token)) {
    return { authenticated: false };
  }
  return {
    authenticated: true,
    expiresAt: sessions.get(token),
  };
}

function requireControlAuth(req, res, next) {
  if (isAuthBypassed() || isAuthenticatedRequest(req)) {
    next();
    return;
  }
  const nextPath = encodeURIComponent(req.originalUrl || req.path);
  res.redirect("/login?next=" + nextPath);
}

module.exports = {
  SESSION_COOKIE: SESSION_COOKIE,
  SESSION_TTL_MS: SESSION_TTL_MS,
  parseCookies: parseCookies,
  isAuthenticatedRequest: isAuthenticatedRequest,
  isAuthenticatedHandshake: isAuthenticatedHandshake,
  validatePassword: validatePassword,
  createSession: createSession,
  clearSession: clearSession,
  sessionInfo: sessionInfo,
  requireControlAuth: requireControlAuth,
};

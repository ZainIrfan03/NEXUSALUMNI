const {
  AUTH_COOKIE_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  HTTP_STATUS,
} = require("../constants");
const { IS_PRODUCTION } = require("../config/env");
const authService = require("../services/authService");

const cookieOptions = () => ({
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax",
});

const registerUser = async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(HTTP_STATUS.CREATED).json(user);
};

const loginUser = async (req, res) => {
  const keepSignedIn = req.body.keepSignedIn ?? false;
  const { token, user } = await authService.authenticateUser({
    email: req.body.email,
    password: req.body.password,
    keepSignedIn,
  });
  const options = cookieOptions();
  if (keepSignedIn) options.maxAge = AUTH_COOKIE_MAX_AGE_MS;
  res.cookie(AUTH_COOKIE_NAME, token, options);
  res.json(user);
};

const logoutUser = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
  res.json({ message: "Logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  res.json(await authService.getCurrentUser(req.user.id));
};

module.exports = { getCurrentUser, loginUser, logoutUser, registerUser };

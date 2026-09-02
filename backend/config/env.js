require("dotenv").config();

const requiredVariables = ["JWT_SECRET", "MONGO_URI"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`,
  );
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  SERVER_PORT: Number(process.env.PORT) || 5000,
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

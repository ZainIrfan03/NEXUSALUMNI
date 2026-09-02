const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { SERVER_PORT } = require("./config/env");
const initializeSocket = require("./config/socket");

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initializeSocket(httpServer, app);

  httpServer.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

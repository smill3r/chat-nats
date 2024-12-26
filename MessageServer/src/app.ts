import { createServer } from "http";
import { PublicSocket } from "./app/publicSocket";

// Create an HTTP server
const server = createServer();

const publicSocket = new PublicSocket(server);

const port = 3000;
server.listen(port, () => {
  console.log(`Socket.IO server listening on http://localhost:${port}`);
});

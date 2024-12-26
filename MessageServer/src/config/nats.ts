export const NATS_CONFIG = {
    servers: process.env.NATS_URL || "nats://nats:4222",
    user: process.env.NATS_USER || "myuser",
    pass: process.env.NATS_PASS || "mypassword",
  };
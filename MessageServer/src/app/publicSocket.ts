import { NatsConnection } from "@nats-io/nats-core";
import { connect } from "@nats-io/transport-node";
import { Server as httpServer } from "http";
import { Server, Socket } from "socket.io";
import { NATS_CONFIG } from "../config/nats";
import { ChatPublisher } from "./chat/chatPublisher";
import { ChatSubscriptionsManager } from "./chat/chatSubscriptionsManager";
import databaseManager from "./database/databaseManager";
import { DatabaseSubscriber } from "./database/databaseSubscriber";

export class PublicSocket {
  private ioServer: Server;
  private chatPublisher: ChatPublisher | undefined;
  private chatSubscriptionsManager: ChatSubscriptionsManager | undefined;
  private databaseSubscription: DatabaseSubscriber | undefined;
  private natsConnection: NatsConnection | undefined;
  constructor(httpServer: httpServer) {
    this.ioServer = new Server(httpServer, {
      cors: {
        origin: "*", // Allow your frontend's origin
        methods: ["GET", "POST"], // HTTP methods allowed
      },
    });
    this.handleConnections();
    this.init();
  }

  async init() {
    try {
      this.natsConnection = await connect(NATS_CONFIG);
      this.chatPublisher = new ChatPublisher(this.natsConnection);
      this.databaseSubscription = new DatabaseSubscriber(this.natsConnection);
      this.chatSubscriptionsManager = new ChatSubscriptionsManager(
        this.natsConnection
      );
    } catch (error) {
      console.log(error);
    }
  }

  handleConnections() {
    this.ioServer.on("connection", (socket: Socket) => {

      // Receive message from the client and publish it to NATS
      socket.on("sendMessage", (msg) => {
        const { payload, channel } = msg;
        if (payload && channel) {
          this.chatPublisher!.publish(channel, payload);
        }
      });

      socket.on("joinChannel", (data) => {
        const { channel } = data;
        if (channel) {
          this.chatSubscriptionsManager!.subscribeToChannel(
            socket.id,
            socket,
            channel
          );
        }
      });

      socket.on("loadPreviousMessages", (data) => {
        const { channel, lastMessageTimeStamp } = data;

        const messages = databaseManager.getPreviousMessages(
          lastMessageTimeStamp,
          channel
        );
        socket.emit("previousMessages", messages);
      });

      // Handle client disconnection
      socket.on("disconnect", () => {
        this.chatSubscriptionsManager!.unsubscribeToAll(socket.id);
        console.log(`Socket.IO client disconnected: ${socket.id}`);
      });
    });
  }
}

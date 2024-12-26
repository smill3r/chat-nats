import { Socket } from "socket.io";
import { CustomSubscriber } from "../shared/customSubscriber";
import { NatsConnection } from "@nats-io/transport-node";

export class ChannelSubscriber extends CustomSubscriber {
  private clients: Map<string, Socket> = new Map();

  constructor(natsConnection: NatsConnection, topic: string) {
    super(natsConnection, topic);
  }

  public addClient(clientId: string, socket: Socket) {
    this.clients.set(clientId, socket);
  }

  public removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  async processMessages() {
    // Read messages in a loop
    for await (const msg of this.sub!) {
      const message = JSON.parse(msg.data.toString());

      this.clients.forEach((clientSocket) => {
        clientSocket.emit("message", message);
      });
    }
  }
}

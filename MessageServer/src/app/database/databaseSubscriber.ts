import { NatsConnection } from "@nats-io/transport-node";
import { CustomSubscriber } from "../shared/customSubscriber";
import databaseManager from "./databaseManager";

export class DatabaseSubscriber extends CustomSubscriber {
  constructor(natsConnection: NatsConnection) {
    super(natsConnection);
  }

  async processMessages() {
    // Read messages in a loop
    for await (const msg of this.sub!) {
      const message = JSON.parse(msg.data.toString());
      databaseManager.insertMessage(message);
    }
  }
}

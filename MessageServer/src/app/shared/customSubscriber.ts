import { NatsConnection, Subscription } from "@nats-io/transport-node";

export class CustomSubscriber {
  protected natsConnection: NatsConnection | undefined;
  protected sub: Subscription | undefined;

  constructor(natsConnection: NatsConnection, topic?: string) {
    this.initialize(natsConnection, topic);
    this.processMessages();
  }

  private initialize(natsConnection: NatsConnection, topic?: string) {
    this.natsConnection = natsConnection;
    if (topic) {
      this.sub = this.natsConnection.subscribe(topic);
    } else {
      this.sub = this.natsConnection.subscribe('>');
    }
  }

  async processMessages() {
    // Read messages in a loop
    for await (const msg of this.sub!) {
      console.log(
        `Received from NATS - Topic: ${msg.subject}, Message: ${msg.data.toString()})}`
      );
    }
  }
}

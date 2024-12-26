import crypto from "crypto";
import { MessagePayload } from "../../types/message";
import { Message } from "../database/models/messages";
import { NatsConnection } from "@nats-io/nats-core";

export class ChatPublisher {
  private natsConnection: NatsConnection;
  constructor(natsConnection: NatsConnection) {
    this.natsConnection = natsConnection;
  }

  public publish(topic: string, message: MessagePayload) {
    const idMessage: Message = {
      id: crypto.randomUUID(),
      channel: topic,
      ...message,
    };
    this.natsConnection.publish(topic, JSON.stringify(idMessage));
  }
}

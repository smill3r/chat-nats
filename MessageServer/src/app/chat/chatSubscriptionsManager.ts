import { NatsConnection } from "@nats-io/transport-node";
import { Socket } from "socket.io";
import { ChannelSubscriber } from "../channel/channelSubscriber";

export class ChatSubscriptionsManager {
  private channelSubscriptions: Map<string, ChannelSubscriber> = new Map();
  private clientSubscriptions: Map<string, Set<string>> = new Map();
  private natsConnection: NatsConnection;

  constructor(natsConnection: NatsConnection) {
    this.natsConnection = natsConnection;
  }

  public subscribeToChannel(clientId: string, socket: Socket, channel: string) {
    const channelSubscription = this.channelSubscriptions.get(channel);
    if (!channelSubscription) {
      const subscriber = new ChannelSubscriber(this.natsConnection, channel);
      subscriber.addClient(socket.id, socket);
      this.channelSubscriptions.set(channel, subscriber);
    } else {
      channelSubscription.addClient(socket.id, socket);
    }
    this.storeClientSubscription(clientId, channel);
  }

  public unsubscribeToAll(clientId: string) {
    const clientSubscriptions = this.clientSubscriptions.get(clientId);
    clientSubscriptions?.forEach((channel) => {
      const channelSubscription = this.channelSubscriptions.get(channel);
      channelSubscription?.removeClient(clientId);
    });
  }

  private storeClientSubscription(clientId: string, channel: string) {
    let subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      subscriptions.add(channel);
    } else {
      subscriptions = new Set([channel]);
    }
    this.clientSubscriptions.set(clientId, subscriptions);
  }
}

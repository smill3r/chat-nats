import { MessagePayload } from "src/types/message";
import { db } from "./database";

class DatabaseManager {
  constructor() {}

  insertMessage(message: MessagePayload) {
    const messages = db.getCollection("messages");
    messages.insert(message);
  }

  getPreviousMessages(lastMessageTimestamp: number, channel: string) {
    const pageSize = 5; // Default to 5 messages per page
    const messages = db.getCollection("messages");

    if (!lastMessageTimestamp || lastMessageTimestamp == 0) {
      lastMessageTimestamp = Date.now();
    }

    // Query for messages older than the given timestamp
    const previousMessages = messages
      .chain()
      .find({
        channel: channel,
        dateSent: { $lt: lastMessageTimestamp }, // Filter for older messages
      })
      .simplesort("dateSent", true) // Sort by dateSent in descending order (newest first)
      .limit(pageSize) // Limit to the page size
      .data(); // Get the resulting data

    return previousMessages;
  }
}

export default new DatabaseManager();

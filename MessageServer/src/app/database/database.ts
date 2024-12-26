import crypto from "crypto";
import Loki from "lokijs";
import { Message } from "./models/messages";

const databaseInitialize = () => {
  let messages = db.getCollection("messages");
  if (!messages) {
    messages = db.addCollection<Message>("messages");
  }

  // Only populate messages if the collection is empty
  if (messages.count() === 0) {
    prepopulateMessages(messages);
  }
};

// Initialize the LokiJS database
export const db = new Loki("database.json", {
  autoload: true, // Automatically load the database on startup
  autoloadCallback: databaseInitialize, // Callback after loading
  autosave: true, // Enable autosave
  autosaveInterval: 4000, // Autosave interval in milliseconds (e.g., every 4 seconds)
});

// Function to prepopulate the database
const prepopulateMessages = (collection: Collection<any>) => {
    const now = new Date();
    const yesterday = new Date(now.setDate(now.getDate() - 1));
    yesterday.setHours(0, 0, 0, 0); // Set to midnight

  const users: string[] = ["Juan", "Silvia", "Ana", "Ramon", "Pedro"];
  // Create 10 messages with increasing timestamps
  for (let i = 1; i <= 50; i++) {
    // Increment the timestamp by 2 minutes for each iteration
    const messageTimestamp = new Date(yesterday.getTime() + (i * 2 * 60000)).getTime(); // Add 2 minutes per message
    const randomIndex = Math.floor(Math.random() * users.length);
    collection.insert({
      id: crypto.randomUUID(),
      channel: "Oficina",
      body: `Test message oficina ${i}`,
      dateSent: messageTimestamp,
      from: users[randomIndex],
    });

    collection.insert({
      id: crypto.randomUUID(),
      channel: "Proyecto Diseño",
      body: `Test message diseño ${i}`,
      dateSent: messageTimestamp,
      from: users[randomIndex],
    });
  }

  console.log("Database initialized with test messages.");
};

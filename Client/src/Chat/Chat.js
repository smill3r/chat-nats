import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:3000"); // Update this with your backend URL

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [currentChannel, setCurrentChannel] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const channels = ["Oficina", "Proyecto Diseño", "General"]; // Hardcoded channels

  const handleLogin = () => {
    if (username.trim()) {
      setCurrentUser(username.trim());
    }
  };

  const joinChannel = (channel) => {
    if (channel !== currentChannel) {
      setCurrentChannel(channel);
      setMessages([]);
      socket.emit("joinChannel", { channel });
      socket.emit("loadPreviousMessages", {
        channel,
        lastMessageTimeStamp: Date.now(),
      });
    }
  };

  const sendMessage = () => {
    if (message.trim() && currentUser && currentChannel) {
      const payload = {
        body: message,
        dateSent: Date.now(),
        from: currentUser,
      };
      socket.emit("sendMessage", { payload, channel: currentChannel });
      setMessage("");
    }
  };

  const handleScroll = (e) => {
    const realHeight = e.target.scrollHeight - e.target.clientHeight;
    if (realHeight + e.target.scrollTop === 0 && messages.length > 0) {
      const lastMessageTimestamp =
        messages[messages.length - 1]?.dateSent || Date.now();
      setLoadingMessages(true);
      socket.emit("loadPreviousMessages", {
        channel: currentChannel,
        lastMessageTimeStamp: lastMessageTimestamp,
      });
    }
  };

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [msg, ...prev]);
    });

    socket.on("previousMessages", (prevMessages) => {
      setMessages((prev) => [...prev, ...prevMessages]);
      setLoadingMessages(false);
    });

    joinChannel(channels[0]);

    return () => {
      socket.off("message");
      socket.off("previousMessages");
    };
  }, []);

  return (
    <div className="container">
      {!currentUser ? (
        <div className="login">
          <h2>Enter Your Name</h2>
          <input
            className="input"
            type="text"
            value={username}
            placeholder="Your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="button" onClick={handleLogin}>
            Join Chat
          </button>
        </div>
      ) : (
        <div className="chatApp">
          <div className="channelSelector">
            <h3>Channels</h3>
            {channels.map((channel) => (
              <button
                key={channel}
                className={`channelButton ${
                  channel === currentChannel ? "activeChannel" : ""
                }`}
                onClick={() => joinChannel(channel)}
              >
                {channel}
              </button>
            ))}
          </div>
          <div className="chatArea">
            <div className="messages" onScroll={(e) => handleScroll(e)}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.from === currentUser ? "myMessage" : "otherMessage"
                  }
                >
                  <strong>{msg.from}</strong>
                  <p>{msg.body}</p>
                  <small>{new Date(msg.dateSent).toLocaleTimeString()}</small>
                </div>
              ))}
              {loadingMessages && <p>Loading previous messages...</p>}
            </div>
            <div className="inputContainer">
              <input
                className="input"
                type="text"
                value={message}
                placeholder="Type a message..."
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="button" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;

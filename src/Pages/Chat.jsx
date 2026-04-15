import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/chat.css";
import { socket } from "../socket";

export default function Chat() {

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3131/api/auth/getAllUsers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Response From GetAllusers Api :-",res);
      
        setUsers(res.data.data);
      } catch (error) {
        console.log("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("userOnline", currentUser._id);
    }

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          text: msg.text,
          type: msg.sender === currentUser._id ? "sent" : "received",
        },
      ]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const res = await axios.get(`http://localhost:3131/api/messages/getMessages/${currentUser._id}/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formatted = res.data.data.map((msg) => ({
          text: msg.text,
          type: msg.sender === currentUser._id ? "sent" : "received",
        }));

        setMessages(formatted);
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    fetchMessages();

    if (selectedUser) {
      socket.emit("joinChat", {
        userId: currentUser._id,
        receiverId: selectedUser._id,
      });
    }
  }, [selectedUser]);

  const sendMessage = () => {
    if (!message || !selectedUser) return;

    socket.emit("sendMessage", {
      sender: currentUser._id,
      receiver: selectedUser._id,
      text: message,
    });

    setMessage("");
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">Chats</div>

        <div className="user-list">
          {users.map((user) => (
            <div
              key={user._id}
              className="user"
              onClick={() => setSelectedUser(user)}
            >
              {user.Name}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-box">
        <div className="chat-header">
          {selectedUser ? selectedUser.Name : "Select User"}
        </div>

        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import "../Styles/chat.css";
import { socket } from "../socket";

export default function Chat() {

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  const selectedUserRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/api/auth/getAllUsers", {headers: {Authorization: `Bearer ${token}`,},});
        console.log("Response From GetAllUsers Api :-",res);
        
        setUsers(res.data.data);

      } catch (error) {
        console.log("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("userOnline", currentUser._id);
    }

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: msg._id,
          text: msg.text,
          type: msg.sender === currentUser._id ? "sent" : "received",
        },
      ]);
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing", ({ sender }) => {
      if (sender === selectedUserRef.current?._id) {
        setTyping(true);

        clearTimeout(window.typingTimer);
        window.typingTimer = setTimeout(() => {
          setTyping(false);
        }, 1000);
      }
    });

    socket.on("messageSeen", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg,
        ),
      );
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("getOnlineUsers");
      socket.off("typing");
      socket.off("messageSeen");
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const res = await API.get(`/api/messages/getMessages/${currentUser._id}/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("Response From Get Messages Api :-",res);

        const formatted = res.data.data.map((msg) => ({
          _id: msg._id,
          text: msg.text,
          type: msg.sender === currentUser._id ? "sent" : "received",
          seen: msg.seen,
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

  useEffect(() => {
    const el = document.querySelector(".messages");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const sendMessage = () => {
    if (!message || !selectedUser) return;

    socket.emit("sendMessage", {
      sender: currentUser._id,
      receiver: selectedUser._id,
      text: message,
    });

    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (selectedUser) {
      socket.emit("typing", {
        sender: currentUser._id,
        receiver: selectedUser._id,
      });
    }
  };

  return (
    <div className="chat-container">
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
              {onlineUsers.includes(user._id) && (
                <span className="online-dot"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-box">
        <div className="chat-header">
          {selectedUser ? selectedUser.Name : "Select User"}
        </div>

        {typing && <p style={{ padding: "10px" }}>Typing...</p>}

        <div className="messages">
          {messages.map((msg) => (
            <div key={msg._id} className={`message ${msg.type}`}>
              {msg.text}
              {msg.type === "sent" && <span> {msg.seen ? "✔✔" : "✔"}</span>}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../api/axios";
import "../Styles/chat.css";
import {
  setUsers,
  setSelectedUser,
  setMessages,
  addMessage,
  setOnlineUsers,
  setTyping,
  updateMessageSeen,
  incrementUnread,
  clearUnread,
} from "../Redux/slices/chatSlice";
import { socket } from "../socket";

export default function Chat() {
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();

  const { users, selectedUser, messages, onlineUsers, typing, unreadCounts } =
    useSelector((state) => state.chat);

  const selectedUserRef = useRef(null);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/api/auth/getAllUsers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Response From GetAllUsers Api :- ", res);

        dispatch(setUsers(res.data.data));
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
      dispatch(
        addMessage({
          _id: msg._id,
          text: msg.text,
          type: msg.sender === currentUser._id ? "sent" : "received",
        })
      );

      if (msg.sender !== currentUser._id) {
        if (selectedUserRef.current?._id !== msg.sender) {
          dispatch(incrementUnread(msg.sender));
        }
      }
    });

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("typing", ({ sender }) => {
      if (sender === selectedUserRef.current?._id) {
        dispatch(setTyping(true));

        clearTimeout(window.typingTimer);
        window.typingTimer = setTimeout(() => {
          dispatch(setTyping(false));
        }, 1000);
      }
    });

    socket.on("messageSeen", ({ messageId }) => {
      dispatch(updateMessageSeen(messageId));
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
        const res = await API.get(
          `/api/messages/getMessages/${currentUser._id}/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Response From GetMessages Api :- ", res);

        const formatted = res.data.data.map((msg) => ({
          _id: msg._id,
          text: msg.text,
          type: msg.sender === currentUser._id ? "sent" : "received",
          seen: msg.seen,
        }));

        dispatch(setMessages(formatted));
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
              onClick={() => {
                dispatch(setSelectedUser(user));
                dispatch(clearUnread(user._id));
              }}
            >
              {user.Name}
              {onlineUsers.includes(user._id) && (
                <span className="online-dot"></span>
              )}
              {unreadCounts?.[user._id] > 0 && (
                <span className="unread-badge">
                  {unreadCounts[user._id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-box">
        {!selectedUser ? (
          <div className="no-chat">
            <h2>Select User</h2>
          </div>
        ) : (
          <>
            <div className="chat-header">{selectedUser.Name}</div>

            {typing && <p style={{ padding: "10px" }}>Typing...</p>}

            <div className="messages">
              {messages.map((msg) => (
                <div key={msg._id} className={`message ${msg.type}`}>
                  {msg.text}
                  {msg.type === "sent" && (
                    <span> {msg.seen ? "✔✔" : "✔"}</span>
                  )}
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
          </>
        )}
      </div>
    </div>
  );
}
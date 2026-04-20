import React from "react";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../api/axios";
import {
  setUsers,
  setSelectedUser,
  setUnreadCounts,
  setMessages,
  addMessage,
  setOnlineUsers,
  setTyping,
  updateMessageSeen,
  incrementUnread,
  clearUnread,
} from "../Redux/slices/chatSlice";
import { socket } from "../socket";
import { updateUser } from "../Redux/slices/userSlice";
import "../Styles/chat.css";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    Name: "",
    Mobile: "",
    bio: "",
  });
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const dispatch = useDispatch();

  const { users, selectedUser, messages, onlineUsers, typing, unreadCounts } =
    useSelector((state) => state.chat);

  const selectedUserRef = useRef(null);
  const messagesRef = useRef([]);
  const typingTimeoutRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/api/auth/getAllUsers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Response From GetAllUsers Api :-", res);

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
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!selectedUser && !localStorage.getItem("selectedUser")) {
      dispatch(setMessages([]));
    }
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      const msgSenderId = msg.sender?._id
        ? msg.sender._id.toString()
        : msg.sender.toString();
      const currentId = currentUser?._id?.toString();

      const alreadyExists = messagesRef.current.some((m) => m._id === msg._id);

      if (!alreadyExists) {
        dispatch(
          addMessage({
            ...msg,
            type: msgSenderId === currentId ? "sent" : "received",
          }),
        );
      }

      if (msgSenderId !== currentId) {
        if (selectedUserRef.current?._id !== msgSenderId) {
          dispatch(incrementUnread(msgSenderId));
        } else {
          socket.emit("markSeen", {
            messageId: msg._id,
            senderId: msgSenderId,
          });
        }
      }
    });

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("typing", ({ sender }) => {
      if (sender.toString() === selectedUserRef.current?._id?.toString()) {
        dispatch(setTyping(true));

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
          dispatch(setTyping(false));
        }, 1500);
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
  }, [currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !currentUser?._id) return;

      try {
        const res = await API.get(
          `/api/messages/getMessages/${currentUser._id}/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("Response From Getmessages Api :-", res);

        const formatted = res.data.data.map((msg) => {
          const senderId = msg.sender?._id
            ? msg.sender._id.toString()
            : msg.sender.toString();

          return {
            _id: msg._id,
            text: msg.text,
            sender: senderId,
            createdAt: msg.createdAt,
            type:
              msg.sender.toString() === currentUser?._id?.toString()
                ? "sent"
                : "received",
            seen: msg.seen,
          };
        });

        dispatch(setMessages(formatted));

        const response = await API.post(
          "/api/messages/markSeen",
          {
            senderId: selectedUser._id,
            receiverId: currentUser._id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log("Response From MarkSeen Api :-", response);

        formatted.forEach((msg) => {
          if (msg.type === "received") {
            dispatch(updateMessageSeen(msg._id));
          }
        });
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    fetchMessages();

    if (selectedUser) {
      socket.emit("joinChat", {
        receiverId: selectedUser._id,
      });
    }
  }, [selectedUser, currentUser]);

  useEffect(() => {
    const el = document.querySelector(".messages");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await API.get(`/api/messages/unread/${currentUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Response From Unread Message Api :-", res);

        dispatch(setUnreadCounts(res.data.data));
      } catch (error) {
        console.log("Error fetching unread counts:", error);
      }
    };

    if (currentUser?._id) {
      fetchUnreadCounts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (users.length > 0) {
      const savedUser = localStorage.getItem("selectedUser");

      if (savedUser) {
        const parsed = JSON.parse(savedUser);

        const matchedUser = users.find((u) => u._id === parsed._id);

        if (matchedUser) {
          dispatch(setSelectedUser(matchedUser));
        }
      }
    }
  }, [users]);

  const sendMessage = () => {
    if (!message || !selectedUser) return;

    socket.emit("sendMessage", {
      receiver: selectedUser._id,
      text: message,
    });

    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!selectedUser) return;

    socket.emit("typing", {
      receiver: selectedUser._id,
    });
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();

      formData.append("Name", profileForm.Name);
      formData.append("Mobile", profileForm.Mobile);
      formData.append("bio", profileForm.bio);

      if (file) {
        formData.append("profilePic", file);
      }

      const res = await API.put("/api/user/updateProfile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Updated:", res);

      dispatch(updateUser(res.data.data));

      dispatch(
        setUsers(
          users.map((u) => (u._id === res.data.data._id ? res.data.data : u)),
        ),
      );

      localStorage.setItem("user", JSON.stringify(res.data.data));

      setEditMode(false);
      setShowProfile(false);
    } catch (err) {
      console.log(err);
    }
  };

  console.log("selectedUser:", selectedUser);
  console.log("currentUser:", currentUser);

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">Chats</div>

        <div className="user-list">
          {users.map((user) => (
            <div
              key={user._id}
              className={`user ${selectedUser?._id === user._id ? "active" : ""}`}
              onClick={() => {
                dispatch(setSelectedUser(user));
                dispatch(clearUnread(user._id));

                localStorage.setItem("selectedUser", JSON.stringify(user));
              }}
            >
              <div className="user-info">
                <img
                  src={user.profilePicture}
                  alt="profile"
                  className="avatar"
                />
                <span className="user-name">{user.Name}</span>
              </div>

              {onlineUsers.includes(user._id) && (
                <span className="online-dot"></span>
              )}

              {unreadCounts?.[user._id] > 0 && (
                <span className="unread-badge">{unreadCounts[user._id]}</span>
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

            {typing && <div className="typing-indicator">Typing...</div>}

            <div className="messages">
              {messages.map((msg) => {
                const rawSenderId = msg.sender?._id || msg.sender;
                const msgSenderId = rawSenderId ? rawSenderId.toString() : "";
                const currentUserId = currentUser?._id?.toString();

                const isSent = msgSenderId === currentUserId;
                const displayType = isSent ? "sent" : "received";

                return (
                  <div
                    key={msg._id}
                    className={`message-wrapper ${displayType}`}
                  >
                    <div className={`message ${displayType}`}>
                      <span className="text">{msg.text}</span>
                      <div className="message-info">
                        <span className="time">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                        {displayType === "sent" && (
                          <span className={msg.seen ? "tick seen" : "tick"}>
                            {msg.seen ? "✔✔" : "✔"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="chat-input">
              <input
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

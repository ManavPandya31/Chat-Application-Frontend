import React from "react";
import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { socket } from "../socket";
import { useDispatch , useSelector } from "react-redux";
import {setGroups,setSelectedGroup,setGroupMessages,addGroupMessage,setGroupTyping,} from "../Redux/slices/groupSlice";

export default function GroupChat() {

  const [message, setMessage] = useState("");

  const dispatch = useDispatch();

  const { groups, selectedGroup, groupMessages, groupTyping } = useSelector(
    (state) => state.group,
  );

  const currentUser = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");

  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = groupMessages;
  }, [groupMessages]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/api/groups/getGroups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Response From GetGroups API :-",res);
        
        dispatch(setGroups(res.data.data));

      } catch (err) {
        console.log(err);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    socket.on("receiveGroupMessage", (msg) => {
      dispatch(addGroupMessage(msg));
    });

    socket.on("typingGroup", ({ sender }) => {
      if (sender !== currentUser._id) {
        dispatch(setGroupTyping(true));

        setTimeout(() => {
          dispatch(setGroupTyping(false));
        }, 2000);
      }
    });

    return () => {
      socket.off("receiveGroupMessage");
      socket.off("typingGroup");
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedGroup) return;

      const res = await API.get(`/api/groups/getGroupMessages/${selectedGroup._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Response From getGroupMessages API :-",res);      

      dispatch(setGroupMessages(res.data.data));

      socket.emit("joinGroup", {
        groupId: selectedGroup._id,
      });
    };

    fetchMessages();
  }, [selectedGroup]);

  const sendMessage = () => {

    if (!message || !selectedGroup) return;

    socket.emit("sendGroupMessage", {
      groupId: selectedGroup._id,
      text: message,
    });

    setMessage("");
  };

  const handleTyping = (e) => {

    setMessage(e.target.value);

    socket.emit("typingGroup", {
      groupId: selectedGroup._id,
    });
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">Groups</div>

        {groups.map((group) => (
          <div
            key={group._id}
            className={`user ${selectedGroup?._id === group._id ? "active" : ""}`}
            onClick={() => dispatch(setSelectedGroup(group))}
          >
            {group.name}
          </div>
        ))}
      </div>

      <div className="chat-box">
        {!selectedGroup ? (
          <h2>Select Group</h2>
        ) : (
          <>
            <div className="chat-header">{selectedGroup.name}</div>

            {groupTyping && <div>Someone typing...</div>}

            <div className="messages">
              {groupMessages.map((msg) => (
                <div key={msg._id} className="message received">
                  <b>{msg.sender?.Name || "User"}:</b> {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

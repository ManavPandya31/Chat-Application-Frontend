import React from "react";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Profile() {

  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/api/user/getMyProfile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Profile:", res);

        setUser(res.data.data);

      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Profile</h2>

      <img
        src={user.profilePicture}
        alt="profile"
        width="120"
        style={{ borderRadius: "50%" }}
      />

      <p><b>Name:</b> {user.Name}</p>
      <p><b>Email:</b> {user.Email}</p>
      <p><b>Mobile:</b> {user.Mobile}</p>
      <p><b>Gender:</b> {user.Gender}</p>
      <p><b>Bio:</b> {user.bio}</p>
    </div>
  );
}
import { useState, useEffect } from "react";
import './Settings.css';

export default function Settings() {
  const [user, setUser] = useState({
    fullname: "",
    email: "",
    role: "user",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]); // For Admin: Manage Users
  const [error, setError] = useState("");

  useEffect(() => {
    let storedUser = localStorage.getItem("currentUser");
  
    try {
      storedUser = storedUser ? JSON.parse(storedUser) : { fullname: "", email: "", role: "user" };
    } catch (error) {
      console.error("Error parsing user data:", error);
      storedUser = { fullname: "", email: "", role: "user" }; // Default fallback
    }
  
    setUser(storedUser);
    setIsAdmin(storedUser.role === "admin");
  
    if (storedUser.role === "admin") {
      const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
      setUsers(storedUsers);
    }
  }, []);
  

  // Update Profile Details
  const handleUpdateProfile = () => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Profile updated successfully!");
  };

  // Change Password
  const handleChangePassword = async () => {
    try {
      // Reset error
      setError("");

      // Validate passwords
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError("All password fields are required");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("New password must be at least 6 characters long");
        return;
      }

      const response = await fetch("http://192.168.1.215:8000/api/v1/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      alert("Password updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update password");
    }
  };

  // Admin: Manage Roles
  const handleRoleChange = (userId, newRole) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    alert("User role updated!");
  };

  // Admin: Enable/Disable Features
  const toggleFeature = (userId) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, featureEnabled: !u.featureEnabled } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  return (
    <div className="content">
      <div className="settings-container">
        {/* Profile Settings Section */}
        <h3>Profile Settings</h3>
        <label>Name:</label>
        <input
          type="text"
          value={user.fullname}
        />
        <label>Email:</label>
        <input
          type="email"
          value={user.email}
        />

        {/* Change Password Section */}
        <h3>Change Password</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="password-section">
          <label>Current Password:</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            placeholder="Enter current password"
          />
          
          <label>New Password:</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            placeholder="Enter new password"
          />
          
          <label>Confirm New Password:</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
          />
          
          <button onClick={handleChangePassword}>Update Password</button>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div>
            <h3>Admin Panel</h3>
            <h4>Manage User Roles</h4>
            {users.map((u) => (
              <div key={u.id}>
                <span>{u.name} ({u.role})</span>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}

            <h4>Enable/Disable Features</h4>
            {users.map((u) => (
              <div key={u.id}>
                <span>{u.name}</span>
                <button onClick={() => toggleFeature(u.id)}>
                  {u.featureEnabled ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

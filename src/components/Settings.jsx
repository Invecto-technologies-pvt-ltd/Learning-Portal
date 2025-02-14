import { useState, useEffect } from "react";
import './Settings.css';
export default function Settings() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]); // For Admin: Manage Users

  useEffect(() => {
    let storedUser = localStorage.getItem("currentUser");
  
    try {
      storedUser = storedUser ? JSON.parse(storedUser) : { name: "", email: "", role: "user" };
    } catch (error) {
      console.error("Error parsing user data:", error);
      storedUser = { name: "", email: "", role: "user" }; // Default fallback
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
  const handleChangePassword = () => {
    if (user.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Password updated successfully!");
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
      <h2>Settings</h2>
      <div className="settings-container">
        {/* Update Profile Section */}
        <h3>Profile Settings</h3>
        <label>Name:</label>
        <input
          type="text"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        <label>Email:</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        <button onClick={handleUpdateProfile}>Update Profile</button>

        {/* Change Password Section */}
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="New Password"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
        <button onClick={handleChangePassword}>Update Password</button>

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

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [learningData, setLearningData] = useState({});
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is an admin

  useEffect(() => {
    // Get the logged-in user's id and role from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Logged-in user from localStorage:", loggedInUser);
    if (loggedInUser) {
      setLoggedInUserId(loggedInUser.id);
      setCurrentUser(loggedInUser);
      // Check if the logged-in user has the admin role
      setIsAdmin(loggedInUser.roles.includes("ROLE_ADMIN"));
    }

    const storedData = JSON.parse(localStorage.getItem("learningTimes")) || {};
    setLearningData(storedData);
  }, []);

  // Fetch users from API with custom headers
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/test/all", {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true", 
            "Content-Type": "application/json", 
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users: " + response.statusText);
        }

        const data = await response.json();
        console.log("Fetched users data:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0h 0m 0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const downloadReport = (user) => {
    const userLearning = learningData[user.username] || {};

    if (Object.keys(userLearning).length === 0) {
      alert("No learning data available for this user.");
      return;
    }

    // Prepare Excel data
    const data = [
      [`Username: ${user.username}`, ""],
      ["", ""],
      ["OEM", "Time Spent"],
      ...Object.entries(userLearning).map(([oem, time]) => [
        oem,
        formatTime(time),
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Learning Report");

    // Apply column widths
    ws["!cols"] = [{ wch: 25 }, { wch: 20 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
    ws["A1"].v = `Username: ${user.username}`;
    ws["A1"].s = { font: { bold: true, sz: 14 } };

    XLSX.writeFile(wb, `Learning_Report_${user.username}.xlsx`);
  };

  return (
    <div className="users-page">
      <div className="content">
        <h1>Users</h1>
        <div className="users-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Learning Report</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.id === loggedInUserId || isAdmin ? (
                        <button
                          onClick={() => downloadReport(user)}
                          className="download-btn"
                        >
                          Download Report
                        </button>
                      ) : (
                        <button className="download-btn" disabled>
                          Not Available
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

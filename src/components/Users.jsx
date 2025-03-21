import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./Users.css";
import { Navigate } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [excelData, setExcelData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // First useEffect for user data and learning times
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
    // console.log("Logged-in user from localStorage:", loggedInUser);
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setIsAdmin(loggedInUser.role?.toUpperCase() === "ADMIN");
    }

    const storedData = JSON.parse(localStorage.getItem("learningTimes")) || {};
    setExcelData(storedData);
  }, []);

  // Second useEffect for fetching users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use different endpoints based on user role
        const endpoint = isAdmin 
          ? "http://192.168.1.215:8000/api/v1/users/all-users"
          : "http://192.168.1.215:8000/api/v1/users/current-user"; // Endpoint for current user's profile

        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const { data } = await response.json();
        
        // Handle the response based on user role
        if (isAdmin) {
          setUsers(Array.isArray(data) ? data : []);
        } else {
          // For non-admin users, wrap single user data in array
          setUsers([data]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load user data. Please try again later.");
        // Fallback to showing current user from localStorage
        if (loggedInUser) {
          setUsers([loggedInUser]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  // Add debug log for isAdmin state
  useEffect(() => {
    // console.log("isAdmin state changed:", isAdmin);
  }, [isAdmin]);

  // Add debug log for users state
  useEffect(() => {
    // console.log("users state changed:", users);
  }, [users]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0h 0m 0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const downloadReport = async (user) => {
    try {
      const response = await fetch(`http://192.168.1.215:8000/api/v1/reports/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch learning data: ${response.status}`);
      }

      const responseData = await response.json();
      // console.log("Raw response data:", responseData);

      const { data: userData } = responseData;
      
      if (!userData || !userData.report) {
        // Still create report but with zero durations
        const oemResponse = await fetch("http://192.168.1.215:8000/api/v1/oem", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!oemResponse.ok) {
          throw new Error("Failed to fetch OEMs");
        }
        
        const { data: oemData } = await oemResponse.json();
        userData.report = oemData.map(oem => ({
          oemId: oem.id,
          oemName: oem.name,
          totalDuration: 0
        }));
      }

      // Prepare Excel data using the report data
      const excelData = [
        [`User: ${userData.fullname}`, ""],
        [`Email: ${userData.email}`, ""],
        [`Department: ${userData.department}`, ""],
        ["", ""],
        ["OEM", "Time Spent"],
        ...userData.report.map(entry => [
          entry.oemName,
          formatTime(entry.totalDuration || 0)
        ])
      ];

      // console.log("Final Excel data:", excelData);

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Learning Report");

      // Apply column widths
      ws["!cols"] = [{ wch: 25 }, { wch: 20 }];
      // Merge cells for user info
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }
      ];

      // Style headers
      ws["A1"].s = { font: { bold: true, sz: 14 } };
      ws["A2"].s = { font: { bold: true, sz: 12 } };
      ws["A3"].s = { font: { bold: true, sz: 12 } };

      XLSX.writeFile(wb, `Learning_Report_${userData.fullname.replace(/\s+/g, '_')}.xlsx`);
      // console.log("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
      alert("Failed to generate report. Please try again.");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://192.168.1.215:8000/api/v1/users/change-role/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: userId,
          newRole: newRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      // Update the local state with the new role
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      alert("Role updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update role");
      alert("Failed to update role. Please try again.");
    }
  };

  // Show loading state
  if (isLoading) {
    return <div className="users-page">Loading...</div>;
  }

  return (
    <div className="users-page">
      <div className="content">
        <h1>Users</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="users-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Reports</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fullname}</td>
                    <td>{user.email}</td>
                    <td>{user.department}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === currentUser?.id} // Prevent changing own role
                        className="role-select"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      {(isAdmin || user.id === currentUser.id) && (
                        <button
                          onClick={() => downloadReport(user)}
                          className="download-btn"
                        >
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// const styleSheet = `
// .role-select {
//   padding: 5px;
//   border-radius: 4px;
//   border: 1px solid #ccc;
//   background-color: white;
//   cursor: pointer;
// }

// .role-select:disabled {
//   background-color: #f5f5f5;
//   cursor: not-allowed;
// }

// .error-message {
//   color: #dc3545;
//   padding: 10px;
//   margin: 10px 0;
//   border: 1px solid #dc3545;
//   border-radius: 4px;
//   background-color: #f8d7da;
// }
// `;

// const styleElement = document.createElement('style');
// styleElement.textContent = styleSheet;
// document.head.appendChild(styleElement);

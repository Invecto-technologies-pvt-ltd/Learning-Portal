import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./Users.css";
import { Navigate } from "react-router-dom";
const ApiUrl = import.meta.env.VITE_BASE_API_URL;

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
          ? `${ApiUrl}/users/all-users`
          : `${ApiUrl}/users/current-user`; // Endpoint for current user's profile

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
      const response = await fetch(`${ApiUrl}/activity/log/${user.id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch learning data: ${response.status}`);
      }
  
      const { data: userData } = await response.json();
  
      if (!userData || !userData.userActivities || userData.userActivities.length === 0) {
        alert("No learning activities found for this user.");
        return;
      }
  
      // Group activities by date
      const groupedByDate = {};
      userData.userActivities.forEach(activity => {
        const date = new Date(activity.startTime).toLocaleDateString();
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(activity);
      });
  
      const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0h 0m 0s";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      };
  
      const excelData = [
        [`User: ${userData.fullname}`, ""],
        [`Email: ${userData.email}`, ""],
        [`Department: ${userData.department || ''}`, ""],
        [""]
      ];
  
      // Loop over grouped dates
      Object.entries(groupedByDate).forEach(([date, activities]) => {
        excelData.push([`Date: ${date}`, ""]);
        excelData.push(["OEM", "Start Time", "End Time", "Duration"]);
  
        activities.forEach(entry => {
          excelData.push([
            entry.oem.name,
            new Date(entry.startTime).toLocaleTimeString(),
            new Date(entry.endTime).toLocaleTimeString(),
            formatDuration(entry.duration || 0)
          ]);
        });
  
        excelData.push(["", ""]); // Spacer between days
      });
  
      // Create Excel sheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Learning Report");
  
      // Column width
      ws["!cols"] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 }
      ];
  
      XLSX.writeFile(wb, `Learning_Report_${userData.fullname.replace(/\s+/g, '_')}.xlsx`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };  


  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${ApiUrl}/users/change-role/`, {
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

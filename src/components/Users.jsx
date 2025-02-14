import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./Users.css";

export default function Users() {
  const users = JSON.parse(import.meta.env.VITE_USERS || "[]");
  const [learningData, setLearningData] = useState({});

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("learningTimes")) || {};
    setLearningData(storedData);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0h 0m 0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const downloadReport = (user) => {
    const userLearning = learningData || {};

    if (Object.keys(userLearning).length === 0) {
      alert("No learning data available for this user.");
      return;
    }

    // Prepare Excel data
    const data = [
      [`Username: ${user.username}`, ""], // First row with username
      ["", ""], // Blank row for spacing
      ["OEM", "Time Spent"], // Table header
      ...Object.entries(userLearning).map(([oem, time]) => [
        oem,
        formatTime(time),
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data); // Convert array of arrays to sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Learning Report");

    // Apply column widths for better visibility
    ws["!cols"] = [{ wch: 25 }, { wch: 20 }];

    // Merge first row for username
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    // Ensure username row is not skipped
    ws["A1"].v = `Username: ${user.username}`; // Set value explicitly
    ws["A1"].s = { font: { bold: true, sz: 14 } }; // Apply styling (optional)

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
                <th>Role</th>
                <th>Learning Report</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => downloadReport(user)} className="download-btn">
                      Download Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

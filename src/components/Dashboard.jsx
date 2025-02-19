import { useState, useEffect } from "react";
import { useLearningTime } from "./Context/LearningTimeContext"; // Import the context
import "./Dashboard.css";

export default function Dashboard() {
  const { learningTimes, updateLearningTime } = useLearningTime();
  const [activePortal, setActivePortal] = useState(null);
  const [portalWindow, setPortalWindow] = useState(null);
  const [timeSpent, setTimeSpent] = useState({}); // Track time locally

  const oems = [
    { id: "Palo Alto", name: "Palo Alto", color: "#FF6B6B", link: "https://beacon.paloaltonetworks.com/" },
    { id: "Cisco SalesConnect", name: "Cisco SalesConnect", color: "#4ECDC4", link: "https://salesconnect.cisco.com/" },
    { id: "CrowdStrike", name: "CrowdStrike", color: "#45B7D1", link: "https://supportportal.crowdstrike.com/" },
    { id: "Fortinet", name: "Fortinet", color: "#96CEB4", link: "https://oem4.com" },
  ];

  useEffect(() => {
    let timer;
    if (activePortal) {
      timer = setInterval(() => {
        updateLearningTime(activePortal);
        setTimeSpent((prev) => ({
          ...prev,
          [activePortal]: (prev[activePortal] || 0) + 1, // Update UI instantly
        }));
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [activePortal, updateLearningTime]);

  useEffect(() => {
    const checkPortalClosed = () => {
      if (portalWindow && portalWindow.closed) {
        setActivePortal(null);
        setPortalWindow(null);
      }
    };

    const interval = setInterval(checkPortalClosed, 1000);
    return () => clearInterval(interval);
  }, [portalWindow]);

  const openLearningPortal = (oem) => {
    if (portalWindow) portalWindow.close();
    const newWindow = window.open(oem.link, "_blank");
    if (newWindow) {
      setPortalWindow(newWindow);
      setActivePortal(oem.id);
    } else {
      alert("Popup blocked! Please allow popups for this site.");
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="content">
      <h1>Dashboard</h1>
      <div className="portal-grid">
        {oems.map((oem) => (
          <div key={oem.id} className={`portal-card ${activePortal === oem.id ? "active" : ""}`} style={{ "--card-color": oem.color }}>
            <h2>{oem.name}</h2>
            <p>Time Spent: {formatTime(timeSpent[oem.id] || learningTimes[oem.id] || 0)}</p>
            <button onClick={() => openLearningPortal(oem)} className="portal-button">Start Learning</button>
          </div>
        ))}
      </div>
    </div>
  );
}

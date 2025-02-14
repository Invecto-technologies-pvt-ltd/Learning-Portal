import { useState, useEffect } from "react";

export default function Dashboard() {
  const [activePortal, setActivePortal] = useState(null);
  const [timeSpent, setTimeSpent] = useState({
    oem1: 0,
    oem2: 0,
    oem3: 0,
    oem4: 0,
  });
  const [portalWindow, setPortalWindow] = useState(null);

  const oems = [
    { id: "oem1", name: "Palo Alto", color: "#FF6B6B", link: "https://beacon.paloaltonetworks.com/" },
    { id: "oem2", name: "Cisco SalesConnect", color: "#4ECDC4", link: "https://salesconnect.cisco.com/" },
    { id: "oem3", name: "CrowdStrike", color: "#45B7D1", link: "https://supportportal.crowdstrike.com/s/login/?ec=302&inst=6T&startURL=%2Fidp%2Flogin%3Fapp%3D0sp6T000001pHxa%26RelayState%3Dhttps%253A%252F%252Funiversity.crowdstrike.com%252Flms%252Findex.php%253Fr%253Dsite%252Fsso%2526sso_type%253Dsaml%2526device%253Dundefined%26binding%3DHttpPost%26inresponseto%3D_bb3588afb28eb02ef561ebcb1f3708cb8445cbd4e8" },
    { id: "oem4", name: "Fortinet", color: "#96CEB4", link: "https://oem4.com" },
  ];

  useEffect(() => {
    let timer;

    if (activePortal) {
      timer = setInterval(() => {
        setTimeSpent((prev) => ({
          ...prev,
          [activePortal]: prev[activePortal] + 1,
        }));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [activePortal]);

  // Detects if the learning portal tab is closed
  useEffect(() => {
    const handlePortalClose = () => {
      if (portalWindow && portalWindow.closed) {
        setActivePortal(null);
        setPortalWindow(null);
      }
    };

    const interval = setInterval(handlePortalClose, 1000);
    return () => clearInterval(interval);
  }, [portalWindow]);

  const openLearningPortal = (oem) => {
    if (portalWindow) {
      portalWindow.close();
    }

    const newWindow = window.open(oem.link, "_blank");
    setPortalWindow(newWindow);
    setActivePortal(oem.id);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="content">
      <h2>Dashboard</h2>
      <div className="portal-grid">
        {oems.map((oem) => (
          <div
            key={oem.id}
            className={`portal-card ${activePortal === oem.id ? "active" : ""}`}
            style={{ "--card-color": oem.color }}
          >
            <h2>{oem.name}</h2>
            <p>Time Spent: {formatTime(timeSpent[oem.id])}</p>
            <button onClick={() => openLearningPortal(oem)} className="portal-button">
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

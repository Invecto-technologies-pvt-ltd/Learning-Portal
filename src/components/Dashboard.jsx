
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [activePortal, setActivePortal] = useState(null);
  const [timeSpent, setTimeSpent] = useState({
    oem1: 0,
    oem2: 0,
    oem3: 0,
    oem4: 0
  });

  const oems = [
    { id: 'oem1', name: 'OEM 1', color: '#FF6B6B' },
    { id: 'oem2', name: 'OEM 2', color: '#4ECDC4' },
    { id: 'oem3', name: 'OEM 3', color: '#45B7D1' },
    { id: 'oem4', name: 'OEM 4', color: '#96CEB4' }
  ];

  useEffect(() => {
    let timer;
    if (activePortal) {
      timer = setInterval(() => {
        setTimeSpent(prev => ({
          ...prev,
          [activePortal]: prev[activePortal] + 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activePortal]);

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
        {oems.map(oem => (
          <div
            key={oem.id}
            className={`portal-card ${activePortal === oem.id ? 'active' : ''}`}
            style={{ '--card-color': oem.color }}
          >
            <h2>{oem.name}</h2>
            <p>Time Spent: {formatTime(timeSpent[oem.id])}</p>
            <button
              onClick={() => setActivePortal(activePortal === oem.id ? null : oem.id)}
              className="portal-button"
            >
              {activePortal === oem.id ? 'Stop Learning' : 'Start Learning'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

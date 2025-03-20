import { useState, useEffect } from "react";
import { useLearningTime } from "./Context/LearningTimeContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { learningTimes, activeSessions, startLearningSession, stopLearningSession } = useLearningTime();
  const [portalWindow, setPortalWindow] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [oems, setOems] = useState([]);
  const [elapsedTimes, setElapsedTimes] = useState(() => {
    const storedTimes = JSON.parse(localStorage.getItem("learningTimes")) || {};
    return storedTimes[currentUser?.id] || {};
  });
  const [activeOem, setActiveOem] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const fetchOems = async () => {
      try {
        const response = await fetch("http://192.168.1.215:8000/api/v1/oem", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch OEMs");
        }
        
        const { data } = await response.json();
        // Format the data to match the required structure
        const formattedOems = data.map(oem => ({
          id: oem.id.toString(),
          name: oem.name,
          color: "rgba(13, 71, 161, 0.5)", // Semi-transparent dark blue
          link: oem.url // Using url from API response
        }));
        
        console.log("Fetched OEMs:", formattedOems);
        setOems(formattedOems);
      } catch (error) {
        console.error("Error fetching OEMs:", error);
        setOems([]);
      }
    };

    fetchOems();
  }, []);

  useEffect(() => {
    let intervals = {};

    // Only run timer if there's both an activeOem and an active session for it
    if (currentUser && 
        activeOem && 
        activeSessions[currentUser.id]?.[activeOem]) {
      
      const startTime = activeSessions[currentUser.id][activeOem];
      const baseTime = learningTimes[currentUser.id]?.[activeOem] || 0;
      
      intervals[activeOem] = setInterval(() => {
        // Check if session is still active before updating
        if (activeSessions[currentUser.id]?.[activeOem]) {
          const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
          setElapsedTimes(prev => ({
            ...prev,
            [activeOem]: baseTime + currentElapsed
          }));
        } else {
          // If session is no longer active, clear the interval
          clearInterval(intervals[activeOem]);
          delete intervals[activeOem];
        }
      }, 1000);
    } else {
      // If no active session, ensure elapsed time reflects the stored learning time
      if (activeOem && learningTimes[currentUser?.id]?.[activeOem]) {
        setElapsedTimes(prev => ({
          ...prev,
          [activeOem]: learningTimes[currentUser.id][activeOem]
        }));
      }
    }

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [activeSessions, currentUser, activeOem, learningTimes]);

  const sendLearningDataToBackend = async (learningData) => {
    try {
      // Send all learning data entries
      const promises = learningData.map(data => 
        fetch("http://192.168.1.215:8000/api/v1/activity/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            startTime: data.startTime,
            duration: data.duration,
            oemId: parseInt(data.oemId)
          })
        })
      );

      // Wait for all requests to complete
      const responses = await Promise.all(promises);
      
      // Check if any request failed
      const hasError = responses.some(response => !response.ok);
      if (hasError) {
        throw new Error("Failed to send some learning data");
      }

      // Only clear localStorage if all requests were successful
      localStorage.setItem("learningData", JSON.stringify([]));
    } catch (error) {
      console.error("Error sending learning data:", error);
    }
  };

  const openLearningPortal = (oem) => {
    if (!currentUser || !currentUser.id) {
      alert("User not logged in!");
      return;
    }

    // If there's already an active session, stop it and store data
    if (activeOem && portalWindow) {
      const currentElapsedTime = elapsedTimes[activeOem] || 0;
      
      const sessionData = {
        oem: activeOem,
        startTime: new Date(activeSessions[currentUser.id][activeOem]).toISOString(),
        endTime: new Date().toISOString(),
        duration: currentElapsedTime
      };

      const existingData = JSON.parse(localStorage.getItem("learningData")) || [];
      existingData.push(sessionData);
      localStorage.setItem("learningData", JSON.stringify(existingData));

      stopLearningSession(currentUser.id, activeOem);
      setPortalWindow(null);
      setActiveOem(null);
    }

    // Only try to open a new window if we're not handling a closure
    if (!portalWindow?.closed) {
      const newWindow = window.open(oem.link, "_blank");

      if (newWindow) {
        const startTime = Date.now();
        setPortalWindow(newWindow);
        setActiveOem(oem.id);
        startLearningSession(currentUser.id, oem.id);

        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkClosed);
            
            // Stop the session first to ensure context is updated
            stopLearningSession(currentUser.id, oem.id);
            
            const endTime = Date.now();
            const durationInSeconds = Math.floor((endTime - startTime) / 1000);
            const baseTime = learningTimes[currentUser.id]?.[oem.id] || 0;
            const finalTime = baseTime + durationInSeconds;

            // Update final elapsed time immediately
            setElapsedTimes(prev => ({
              ...prev,
              [oem.id]: finalTime
            }));

            // Store session data
            const sessionData = {
              oemId: oem.id,
              startTime: new Date(startTime).toISOString(),
              // endTime: new Date(endTime).toISOString(),
              duration: durationInSeconds
            };

            const existingData = JSON.parse(localStorage.getItem("learningData")) || [];
            existingData.push(sessionData);
            localStorage.setItem("learningData", JSON.stringify(existingData));

            // Update learning times in localStorage
            const updatedTimes = {
              ...JSON.parse(localStorage.getItem("learningTimes")) || {},
              [currentUser.id]: {
                ...(learningTimes[currentUser.id] || {}),
                [oem.id]: finalTime
              }
            };
            localStorage.setItem("learningTimes", JSON.stringify(updatedTimes));

            // Clear window state last
            setPortalWindow(null);
            setActiveOem(null);
          }
        }, 100);
      } else {
        alert("Popup blocked! Please allow popups for this site.");
      }
    }
  };

  // Add cleanup effect for logout and sync
  useEffect(() => {
    const handleLogout = () => {
      if (currentUser?.id) {
        const learningData = JSON.parse(localStorage.getItem("learningData")) || [];
        if (learningData.length > 0) {
          sendLearningDataToBackend(learningData);
        }
      }
    };

    window.addEventListener('beforeunload', handleLogout);
    return () => {
      window.removeEventListener('beforeunload', handleLogout);
      handleLogout(); // Send data when component unmounts
    };
  }, [currentUser]);

  const syncLearningData = () => {
    const learningData = JSON.parse(localStorage.getItem("learningData")) || [];
    if (learningData.length > 0) {
      sendLearningDataToBackend(learningData);
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
      {currentUser && (
        <>
          <h2>Welcome, {currentUser.fullname}!</h2>
          {/* <button onClick={syncLearningData} className="sync-button">
            Sync Learning Data
          </button> */}
        </>
      )}
      <div className="portal-grid">
        {oems.map((oem) => {
          const accumulatedTime = elapsedTimes[oem.id] || 0;
          const isActive = activeOem === oem.id;

          return (
            <div
              key={oem.id}
              className={`portal-card ${isActive ? 'active' : ''}`}
              style={{ "--card-color": oem.color }}
            >
              <h2>{oem.name}</h2>
              <p>
                Time Spent: {formatTime(accumulatedTime)}
              </p>
              <button 
                onClick={() => openLearningPortal(oem)} 
                className={`portal-button ${isActive ? 'active' : ''}`}
              >
                {isActive ? 'Learning...' : 'Start Learning'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect } from "react";

const LearningTimeContext = createContext();

export function LearningTimeProvider({ children }) {
  const [learningTimes, setLearningTimes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("learningTimes")) || {};
    } catch (error) {
      console.error("Error parsing learningTimes from localStorage:", error);
      return {};
    }
  });

  const [activeSessions, setActiveSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("activeSessions")) || {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("learningTimes", JSON.stringify(learningTimes));
  }, [learningTimes]);

  useEffect(() => {
    localStorage.setItem("activeSessions", JSON.stringify(activeSessions));
  }, [activeSessions]);

  const startLearningSession = (userId, oemId, accumulatedTime = 0) => {
    if (!userId) {
      console.error("No logged-in user found!");
      return;
    }

    // Start new session with current time
    setActiveSessions(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [oemId]: Date.now()
      }
    }));

    // Set initial accumulated time if not already set
    if (accumulatedTime > 0) {
      setLearningTimes(prev => ({
        ...prev,
        [userId]: {
          ...(prev[userId] || {}),
          [oemId]: accumulatedTime
        }
      }));
    }
  };

  const stopLearningSession = (userId, oemId) => {
    if (!userId || !oemId || !activeSessions[userId]?.[oemId]) {
      return;
    }

    const startTime = activeSessions[userId][oemId];
    const currentTime = Date.now();
    const sessionDuration = Math.floor((currentTime - startTime) / 1000);
    const previousTime = learningTimes[userId]?.[oemId] || 0;
    const totalTime = previousTime + sessionDuration;

    // Update total learning time
    setLearningTimes(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [oemId]: totalTime
      }
    }));

    // Clear active session
    setActiveSessions(prev => {
      const newSessions = { ...prev };
      if (newSessions[userId]) {
        delete newSessions[userId][oemId];
        // Remove user entry if no active sessions
        if (Object.keys(newSessions[userId]).length === 0) {
          delete newSessions[userId];
        }
      }
      return newSessions;
    });

    // Return the total accumulated time
    return totalTime;
  };

  return (
    <LearningTimeContext.Provider value={{ 
      learningTimes, 
      activeSessions, 
      startLearningSession, 
      stopLearningSession 
    }}>
      {children}
    </LearningTimeContext.Provider>
  );
}

export function useLearningTime() {
  const context = useContext(LearningTimeContext);
  if (!context) {
    throw new Error('useLearningTime must be used within a LearningTimeProvider');
  }
  return context;
}

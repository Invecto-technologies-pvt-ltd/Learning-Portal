import { createContext, useContext, useEffect, useState } from "react";

const LearningTimeContext = createContext();

export function LearningTimeProvider({ children }) {
  const [learningTimes, setLearningTimes] = useState(() => {
    return JSON.parse(localStorage.getItem("learningTimes")) || {};
  });

  useEffect(() => {
    localStorage.setItem("learningTimes", JSON.stringify(learningTimes));
  }, [learningTimes]);

  const updateLearningTime = (oemId) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.username) {
      console.error("No logged-in user found!");
      return;
    }

    const username = currentUser.username;

    setLearningTimes((prev) => {
      const updatedData = {
        ...prev,
        [username]: {
          ...prev[username],
          [oemId]: (prev[username]?.[oemId] || 0) + 1,
        },
      };

      // Store in localStorage & trigger state update
      localStorage.setItem("learningTimes", JSON.stringify(updatedData));
      return { ...updatedData };
    });
  };

  return (
    <LearningTimeContext.Provider value={{ learningTimes, updateLearningTime }}>
      {children}
    </LearningTimeContext.Provider>
  );
}

export function useLearningTime() {
  return useContext(LearningTimeContext);
}

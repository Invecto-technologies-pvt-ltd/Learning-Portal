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
    setLearningTimes((prev) => ({
      ...prev,
      [oemId]: (prev[oemId] || 0) + 1,
    }));
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

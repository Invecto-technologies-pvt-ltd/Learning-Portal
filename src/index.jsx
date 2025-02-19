import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LearningTimeProvider } from "./components/Context/LearningTimeContext"; // Import the provider

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <LearningTimeProvider> {/* Wrap the App with the provider */}
      <App />
    </LearningTimeProvider>
  // </React.StrictMode>
);

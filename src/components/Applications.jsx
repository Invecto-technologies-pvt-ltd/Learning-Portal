import { useState, useEffect } from "react";
import "./Applications.css";

export default function Application() {
  const [portalWindow, setPortalWindow] = useState(null);

  const apps = [
    { 
      id: "App1", 
      name: "SFDC", 
      color: "#FFB347", 
      ssoUrl: "https://sso-88ce2422.sso.duosecurity.com/saml2/sp/DI1PUEQ02VRLKZ33BUDL/sso" // Direct SSO URL
    },
    { 
      id: "App2", 
      name: "Keka", 
      color: "#77DD77", 
      link: "https://example.com/app2" 
    },
  ];

  useEffect(() => {
    const checkPortalClosed = () => {
      if (portalWindow && portalWindow.closed) {
        setPortalWindow(null);
      }
    };
    const interval = setInterval(checkPortalClosed, 1000);
    return () => clearInterval(interval);
  }, [portalWindow]);

  const openPortal = (app) => {
    if (portalWindow) portalWindow.close();
  
    if (app.ssoUrl) {
      // Open Salesforce SSO URL in a new tab
      const newWindow = window.open(app.ssoUrl, "_blank");
      if (newWindow) {
        setPortalWindow(newWindow);
      } else {
        alert("Popup blocked! Please allow popups for this site.");
      }
    } else if (app.link) {
      // Open other applications normally
      const newWindow = window.open(app.link, "_blank");
      if (newWindow) {
        setPortalWindow(newWindow);
      } else {
        alert("Popup blocked! Please allow popups for this site.");
      }
    }
  };  

  return (
    <div className="application-content">
      <h1>Applications</h1>
      <div className="application-portal-grid">
        {apps.map((app) => (
          <div
            key={app.id}
            className="application-portal-card"
            style={{ "--card-color": app.color }}
          >
            <h2>{app.name}</h2>
            <button onClick={() => openPortal(app)} className="application-portal-button">
              Open Application
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

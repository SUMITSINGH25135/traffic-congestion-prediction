import React from "react";
import "../styles/RouteSidebar.css"; 

const RouteSidebar = ({ data, onClose }) => {
  if (!data) return null;

  const formatTime = (hour) => {
    if (hour === 0) return "12:00 AM";
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
  };

  return (
    <div className="route-sidebar">
      <div className="route-sidebar-title">Route Summary</div>

      {/* Global Route Data */}
      <div className="route-sidebar-info">
        <span className="route-sidebar-label">Total Distance</span>
        <span>{data.distance} km</span>
      </div>

      {/* Route Conditions Section */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#4ade80", marginBottom: "4px", fontWeight: "bold" }}>
          Route Conditions
        </div>
        <div className="route-sidebar-info">
          <span className="route-sidebar-label">Ideal ETA (No Traffic)</span>
          <span>{data.freeFlowTime} min</span>
        </div>
        <div className="route-sidebar-info">
          <span className="route-sidebar-label">Congested Distance</span>
          <span>{data.trafficLength} km</span>
        </div>
      </div>

      {/* Live Data Section */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#4aa8ff", marginBottom: "4px", fontWeight: "bold" }}>
          Live Traffic (TomTom)
        </div>
        <div className="route-sidebar-info">
          <span className="route-sidebar-label">Current ETA</span>
          <span style={{ fontWeight: "bold", color: "#4aa8ff" }}>{data.trafficTime} min</span>
        </div>
        <div className="route-sidebar-info">
          <span className="route-sidebar-label">Traffic Delay</span>
          <span>{data.delay > 0 ? `+${data.delay} min` : "None"}</span>
        </div>
      </div>

      {/* 🤖 AI Data Section */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#b967ff", marginBottom: "4px", fontWeight: "bold" }}>
          AI Prediction
        </div>
        
        {data.aiPrediction ? (
          <>
            <div className="route-sidebar-info">
              <span className="route-sidebar-label">ETA at {formatTime(data.selectedHour)}</span>
              <span style={{ fontWeight: "bold", color: "#b967ff" }}>{data.aiPrediction} min</span>
            </div>
            <div style={{ fontSize: "11px", color: "#a0a0b0", marginTop: "6px", fontStyle: "italic", textAlign: "right" }}>
              *Based on historical weekday patterns
            </div>
          </>
        ) : (
          <div className="route-sidebar-info" style={{ justifyContent: "center", color: "#ffb74d", fontSize: "12px" }}>
            Prediction not available for this route/time.
          </div>
        )}
      </div>

      {/* Close Button */}
      <button className="route-sidebar-close" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default RouteSidebar;
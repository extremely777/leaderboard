// src/components/MissionBlock.js
import React from "react";
import "./MissionBlock.css";

function MissionBlock({ title, time, goal, current }) {
  return (
    <div className="mission-section">
      <div className="mission-inner">
        <div className="mission-left">
          <div className="mission-title">🔸 {title}</div>
          <div className="mission-time">{time}</div>
        </div>

        <div className="stack-bar-container">
          <div className="stack-bar-label">
            {current}건 / <span style={{ color: "red", fontWeight: "bold" }}>{goal}</span>건
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionBlock;

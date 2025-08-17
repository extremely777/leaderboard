// src/components/GoalSummary.js
import React from "react";
import GoalChart from "./GoalChart";

const goalValues = {
  total: 480,
  morning: 132,
  afternoon: 88,
  evening: 140,
  night: 120,
};

const GoalSummary = ({ stats }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" }}>
      <GoalChart label="총합" current={stats.total} goal={goalValues.total} />
      <GoalChart label="아침점심" current={stats.morning} goal={goalValues.morning} />
      <GoalChart label="오후" current={stats.afternoon} goal={goalValues.afternoon} />
      <GoalChart label="저녁" current={stats.evening} goal={goalValues.evening} />
      <GoalChart label="심야" current={stats.night} goal={goalValues.night} />
    </div>
  );
};

export default GoalSummary;
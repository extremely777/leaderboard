// src/components/GoalDoughnutChart.js
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const GoalDoughnutChart = ({ label, value, goal }) => {
  const percentage = Math.round((value / goal) * 100);
  const data = {
    labels: [],
    datasets: [
      {
        data: [value, Math.max(goal - value, 0)],
        backgroundColor: ["#C8B6A6", "#eee"], // 파스텔 브라운 & 회색
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div style={{ width: "120px", textAlign: "center", margin: "0 10px" }}>
      <div style={{ position: "relative", width: "100%", height: "100px" }}>
        <Doughnut data={data} options={options} />
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontWeight: "bold",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {percentage}%
        </div>
      </div>

      {/* 아래 텍스트 여백 조정 */}
      <div style={{ marginTop: "12px", lineHeight: "1.5", fontSize: "14px", fontWeight: "bold" }}>
        {label}
        <br />
        <span style={{ fontWeight: "normal" }}>{value} / {goal}</span>
      </div>
    </div>
  );
};

export default GoalDoughnutChart;
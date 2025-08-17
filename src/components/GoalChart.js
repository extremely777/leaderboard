import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

function GoalChart({ goals, stats }) {
  const totalPercent = Math.min(
    Math.round((stats.totalDone / goals.total) * 100),
    100
  );
  const morningPercent = Math.min(
    Math.round((stats.timeSegments.morning / goals.morning) * 100),
    100
  );
  const afternoonPercent = Math.min(
    Math.round((stats.timeSegments.afternoon / goals.afternoon) * 100),
    100
  );
  const eveningPercent = Math.min(
    Math.round((stats.timeSegments.evening / goals.evening) * 100),
    100
  );
  const nightPercent = Math.min(
    Math.round((stats.timeSegments.night / goals.night) * 100),
    100
  );

  const chartData = (percent, label) => ({
    labels: [label],
    datasets: [
      {
        data: [percent, 100 - percent],
        backgroundColor: ["#FF6384", "#FFE5EC"],
        borderWidth: 0,
      },
    ],
  });

  const chartOptions = {
    cutout: "70%",
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  const renderChart = (percent, label) => (
    <div style={{ textAlign: "center", width: "90px" }}>
      <Doughnut data={chartData(percent, label)} options={chartOptions} />
      <div style={{ marginTop: "-60px", fontWeight: "bold", fontSize: "14px" }}>
        {percent}%
      </div>
      <div style={{ fontSize: "12px", color: "#666" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
      {renderChart(totalPercent, "총 배달")}
      {renderChart(morningPercent, "아침점심")}
      {renderChart(afternoonPercent, "오후")}
      {renderChart(eveningPercent, "저녁")}
      {renderChart(nightPercent, "심야")}
    </div>
  );
}

export default GoalChart;
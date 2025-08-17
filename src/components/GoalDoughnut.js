// GoalDoughnut.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";

/** 간단한 다크닝: 검정과 섞어서 hover용으로 약간 더 진하게 */
function darken(hex, p = 0.1) {
  const c = hex.replace('#', '');
  let r = parseInt(c.slice(0, 2), 16);
  let g = parseInt(c.slice(2, 4), 16);
  let b = parseInt(c.slice(4, 6), 16);
  r = Math.max(0, Math.floor(r * (1 - p)));
  g = Math.max(0, Math.floor(g * (1 - p)));
  b = Math.max(0, Math.floor(b * (1 - p)));
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

/** 요청하신 최종색(#0B8F2D)을 기준으로 단계별 톤 */
const GREEN_STEPS = {
  // 25% 이하: 가장 연한 톤
  s25:  "#8EDFA5",  // 밝은 연녹
  // 50% 이하
  s50:  "#4CCB73",
  // 75% 이하
  s75:  "#1BAE4A",
  // 100% (최종): 요청색
  s100: "#0B8F2D",
};

function colorByPct(pct) {
  if (pct >= 100) return GREEN_STEPS.s100;
  if (pct >= 75)  return GREEN_STEPS.s75;
  if (pct >= 50)  return GREEN_STEPS.s50;
  return GREEN_STEPS.s25;
}

function GoalDoughnut({ label, current, goal }) {
  const safeGoal = Number(goal) || 0;
  const safeCurrent = Number(current) || 0;

  const pct = safeGoal > 0 ? Math.round((safeCurrent / safeGoal) * 100) : 0;
  const isOver = safeGoal > 0 && safeCurrent >= safeGoal;

  // ✅ 구간별 색상 선택 (100%는 #0B8F2D)
  const ACH_COLOR = colorByPct(pct);
  const ACH_HOVER = darken(ACH_COLOR, 0.12); // hover 시 12% 더 진하게

  const data = {
    labels: ["달성", "남은 비율"],
    datasets: [
      {
        // 남은 트랙은 여전히 숨김(투명)
        data: isOver ? [100, 0] : [pct, 100 - pct],
        backgroundColor: [ACH_COLOR, "rgba(0,0,0,0)"],
        hoverBackgroundColor: [ACH_HOVER, "rgba(0,0,0,0)"],
        borderWidth: 0,
        cutout: "72%",
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutout: "72%",
    plugins: { tooltip: { enabled: false }, legend: { display: false } },
    elements: { arc: { borderJoinStyle: "round" } },
    animation: { duration: 600, easing: "easeOutQuart" },
  };

  return (
    <div className="goal-doughnut hover-effect">
      <div className="chart-wrapper">
        <Doughnut data={data} options={options} />
        <div className="percentage">{pct}%</div>
      </div>

      <div className="label">{label}</div>

      {/* 목표값은 항상 빨강/굵게, 현재값은 목표 도달 시만 빨강/굵게 (기존 CSS 규칙 사용) */}
      <div className="count">
        <span className={isOver ? "goal-reached" : ""}>
          {safeCurrent.toLocaleString()}
        </span>
        {" / "}
        <span className="goal-value">{safeGoal.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default GoalDoughnut;


import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

function TimeChart({ data }) {
  // 필수 항목 목록
  const requiredKeys = ["이름", "아침점심피크", "오후논피크", "저녁피크", "심야논피크"];

  // 유효한 데이터만 필터링 (공백, NaN 방지)
  const isValidRow = (row) => {
    const result = row &&
      requiredKeys.every(
        (key) => row.hasOwnProperty(key) && !isNaN(Number(row[key]))
      );
    
    // 디버깅 로그 (개발용)
    if (!result) {
      console.log("🚫 유효하지 않은 row:", row);
    }

    return result;
  };

  const chartData = data
    .filter(isValidRow)
    .map((row) => ({
      이름: row["이름"],
      아침: Number(row["아침점심피크"]),
      오후: Number(row["오후논피크"]),
      저녁: Number(row["저녁피크"]),
      심야: Number(row["심야논피크"]),
    }));

  return (
    <div style={{ width: "100%", height: 400 }}>
      {chartData.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>📉 차트에 표시할 데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="이름" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="아침" fill="#8884d8" />
            <Bar dataKey="오후" fill="#82ca9d" />
            <Bar dataKey="저녁" fill="#ffc658" />
            <Bar dataKey="심야" fill="#d84f4f" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default TimeChart;
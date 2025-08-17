// src/utils/fetchGoals.js

export async function fetchGoalData(csvUrl) {
  const response = await fetch(csvUrl);
  const text = await response.text();

  const rows = text.trim().split("\n").map(row => row.split(","));
  const headerRow = rows[1]; // 목표 항목들이 있는 두 번째 줄
  const valuesRow = rows[2]; // 값들이 있는 세 번째 줄

  const goals = {};
  for (let i = 0; i < headerRow.length; i++) {
    const key = headerRow[i].trim();
    const value = Number(valuesRow[i]);
    if (!isNaN(value)) {
      goals[key] = value;
    }
  }

  return goals;
}
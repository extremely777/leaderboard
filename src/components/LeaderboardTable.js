// src/components/LeaderboardTable.js

import React, { useEffect, useState } from "react";

function LeaderboardTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/leaderboard")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.error("데이터 로딩 오류:", error));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>아이디</th>
          <th>배달수</th>
          <th>아침점심</th>
          <th>오후</th>
          <th>저녁</th>
          <th>심야</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td>{row["아이디"]}</td>
            <td>{row["배달 완료"]}</td>
            <td>{row["아침점심피크"]}</td>
            <td>{row["오후논피크"]}</td>
            <td>{row["저녁피크"]}</td>
            <td>{row["심야논피크"]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default LeaderboardTable;

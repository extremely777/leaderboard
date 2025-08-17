// src/components/LeaderboardTable.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LeaderboardTable.css";

function LeaderboardTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/leaderboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>순위</th>
          <th>라이더</th>
          <th>운행상태</th>
          <th>완료</th>
          <th>거절</th>
          <th>배차취소</th>
          <th>라이더귀책</th>
          <th>아침점심</th>
          <th>오후</th>
          <th>심야</th>
        </tr>
      </thead>
      <tbody>
        {data.map((rider, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{rider.name}</td>
            <td><span className="badge">운행중</span></td>
            <td>{rider.complete}</td>
            <td>{rider.reject}</td>
            <td>{rider.cancel}</td>
            <td>{rider.fault}</td>
            <td>{rider.morning}</td>
            <td>{rider.afternoon}</td>
            <td>{rider.night}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default LeaderboardTable;
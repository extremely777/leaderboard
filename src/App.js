import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./App.css";
import GoalDoughnut from "./components/GoalDoughnut";

function App() {
  const [data, setData] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [goalValues, setGoalValues] = useState({
    total: 0,
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  });
  const [missionData, setMissionData] = useState(null);

  const csvUrl =
    "https://docs.google.com/spreadsheets/d/1hB4VvKXW265xGTOyodfh56eADx_7qUrKK-T2cfJHi28/export?format=csv&id=1hB4VvKXW265xGTOyodfh56eADx_7qUrKK-T2cfJHi28&gid=0";

  // ✅ 자동 최신화(+ 캐시 무력화)
  useEffect(() => {
    const load = async () => {
      try {
        const noCacheUrl = `${csvUrl}${csvUrl.includes("?") ? "&" : "?"}_=${Date.now()}`;
        const res = await fetch(noCacheUrl, { cache: "no-store" });
        const text = await res.text();

        const parsed = Papa.parse(text, { skipEmptyLines: true });
        const rows = parsed.data;

        // 🎯 목표값
        const goalHeaders = rows[1].slice(13, 19);
        const goalValuesRaw = rows[2].slice(13, 19);
        const goalMap = {};
        goalHeaders.forEach((key, idx) => {
          const raw = (goalValuesRaw[idx] || "").toString().replace(",", "").trim();
          goalMap[key] = Number(raw) || 0;
        });
        setGoalValues({
          total: goalMap["총 완료"] || 0,
          morning: goalMap["아점"] || goalMap["아침"] || 0,
          afternoon: goalMap["오후"] || 0,
          evening: goalMap["저녁"] || 0,
          night: goalMap["심야"] || 0,
        });

        // 🕒 오전 + 오후 미션 정보
        const mission = {
          // 오전
          morningTime: rows[9]?.[14] || "",
          morningStage1: Number(rows[10]?.[14]) || 0,
          morningStage1Personal: Number(rows[11]?.[14]) || 0,
          morningStage2: Number(rows[12]?.[14]) || 0,
          morningStage2Personal: Number(rows[13]?.[14]) || 0,

          // 오후
          afternoonTime: rows[15]?.[14] || "",
          afternoonStage1: Number(rows[16]?.[14]) || 0,
          afternoonStage1Personal: Number(rows[17]?.[14]) || 0,
          afternoonStage2: Number(rows[18]?.[14]) || 0,
          afternoonStage2Personal: Number(rows[19]?.[14]) || 0,
        };
        setMissionData(mission);

        // 📊 리더보드
        const headers = rows[0].map((h) => h.trim());
        const bodyRows = rows.slice(1).filter((row) => row[0] && row[0] !== "");
        const dataObjects = bodyRows.map((row) => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });
        const sorted = dataObjects.sort(
          (a, b) => Number(b["완료"]) - Number(a["완료"])
        );
        setData(sorted.slice(0, 10));

        // ⏰ 업데이트 시간
        const now = new Date();
        const timeStr = now.toLocaleString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        setUpdatedAt(timeStr);
      } catch (e) {
        console.error(e);
      }
    };

    load(); // 최초 1회 로드
    const id = setInterval(load, 60_000); // 60초마다 자동 갱신
    return () => clearInterval(id);
  }, [csvUrl]);

  // ✅ 통계 계산
  const stats = {
    totalDone: 0,
    timeSegments: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
  };

  data.forEach((row) => {
    stats.totalDone += Number(row["완료"]) || 0;
    stats.timeSegments.morning += Number(row["아침점심피크"]) || 0;
    stats.timeSegments.afternoon += Number(row["오후논피크"]) || 0;
    stats.timeSegments.evening += Number(row["저녁피크"]) || 0;
    stats.timeSegments.night += Number(row["심야논피크"]) || 0;
  });

  return (
    <>
      {/* 흐린 배경 */}
      <div
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/bg.png)`,
          backgroundSize: "60%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.08,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
        }}
      />

      <div className="container">
        {/* 🎯 오늘의 목표 */}
        <div className="goal-box">
          <h1>🔸 오늘의 목표</h1>
          <div className="goals-grid">
            <div className="goal-doughnut">
              <GoalDoughnut label="총 완료" current={stats.totalDone} goal={goalValues.total} />
            </div>
            <div className="goal-doughnut">
              <GoalDoughnut label="아점" current={stats.timeSegments.morning} goal={goalValues.morning} />
              <div className="time-range">
                <div>평일 : 06:00 ~ 12:59</div>
                <div>주말 : 06:00 ~ 13:59</div>
              </div>
            </div>
            <div className="goal-doughnut">
              <GoalDoughnut label="오후" current={stats.timeSegments.afternoon} goal={goalValues.afternoon} />
              <div className="time-range">
                <div>평일 : 13:00 ~ 16:59</div>
                <div>주말 : 14:00 ~ 16:59</div>
              </div>
            </div>
            <div className="goal-doughnut">
              <GoalDoughnut label="저녁" current={stats.timeSegments.evening} goal={goalValues.evening} />
              <div className="time-range">17:00 ~ 19:59</div>
            </div>
            <div className="goal-doughnut">
              <GoalDoughnut label="심야" current={stats.timeSegments.night} goal={goalValues.night} />
              <div className="time-range">20:00 ~ 02:59</div>
            </div>
          </div>
        </div>

        {missionData && (
          <div className="mission-box">
            <h1>🔸 오늘의 미션</h1>

            <div className="mission-duo-container">
              {/* 오전 미션 */}
              <div className="mission-block">
                <div className="mission-title">
                  <span className="black-square" /> 오전 미션
                </div>
                <div className="mission-time">{missionData.morningTime}</div>

                <div className="mission-stages">
                  <div className="mission-stage">
                    <strong>1단계</strong>
                    <div>그룹 : {missionData.morningStage1}</div>
                    <div>개인 : {missionData.morningStage1Personal}</div>
                  </div>
                  <div className="mission-stage">
                    <strong>2단계</strong>
                    <div>그룹 : {missionData.morningStage2}</div>
                    <div>개인 : {missionData.morningStage2Personal}</div>
                  </div>
                </div>
              </div>

              {/* 오후 미션 */}
              <div className="mission-block">
                <div className="mission-title">
                  <span className="black-square" /> 오후 미션
                </div>
                <div className="mission-time">{missionData.afternoonTime}</div>

                <div className="mission-stages">
                  <div className="mission-stage">
                    <strong>1단계</strong>
                    <div>그룹 : {missionData.afternoonStage1}</div>
                    <div>개인 : {missionData.afternoonStage1Personal}</div>
                  </div>
                  <div className="mission-stage">
                    <strong>2단계</strong>
                    <div>그룹 : {missionData.afternoonStage2}</div>
                    <div>개인 : {missionData.afternoonStage2Personal}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🏆 배달 완료 순위 */}
        <h1>🔸 배달 완료 순위</h1>
        <p className="update-time">마지막 업데이트: {updatedAt}</p>
        <table className="leaderboard">
          <thead>
            <tr>
              <th>순위</th>
              <th>라이더</th>
              <th>운행상태</th>
              <th>완료</th>
              <th>거절</th>
              <th>배차취소</th>
              <th>라이더귀책</th>
              <th>시간대별 배달</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}</td>
                <td>{row["이름"]}</td>
                <td>
                  <span
                    className={
                      row["운행상태"] === "운행중" ? "status status-running" : "status status-ended"
                    }
                  >
                    {row["운행상태"]}
                  </span>
                </td>
                <td>{row["완료"]}</td>
                <td>{row["거절"]}</td>
                <td>{row["배차취소"]}</td>
                <td>{row["배달취소(라이더귀책)"]}</td>
                <td className="time-col">
                  <div className="time-grid">
                    <div><span>아점</span><span className="time-num">{row["아침점심피크"]}</span></div>
                    <div><span>오후</span><span className="time-num">{row["오후논피크"]}</span></div>
                    <div><span>저녁</span><span className="time-num">{row["저녁피크"]}</span></div>
                    <div><span>심야</span><span className="time-num">{row["심야논피크"]}</span></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;

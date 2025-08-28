// src/App.js
import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import "./App.css";
import GoalDoughnut from "./components/GoalDoughnut";

function App() {
  const [data, setData] = useState([]);        // 👀 리더보드 표시용(상위 10명)
  const [allRows, setAllRows] = useState([]);  // 📊 도넛 통계용(전체)
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

  // 안전 숫자 파서 (콤마/원/공백 제거)
  const toNumber = (v) => Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0;

  // 통화 포맷
  const fmtCurrency = (n) => `${(Number(n) || 0).toLocaleString("ko-KR")}원`;

  useEffect(() => {
    const load = async () => {
      try {
        const noCacheUrl = `${csvUrl}${csvUrl.includes("?") ? "&" : "?"}_=${Date.now()}`;
        const res = await fetch(noCacheUrl, { cache: "no-store" });
        const text = await res.text();

        const parsed = Papa.parse(text, { skipEmptyLines: true });
        const rows = parsed.data;

        // 🎯 목표값 (N~S열 영역: slice(13,19) = index 13~18)
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

        /* 🕒 미션 정보 (N/P 좌표)
           - 열: N = index 13, P = index 15
           - 행: 10 → index 9
        */
        const colN = 13;
        const colP = 15;

        const mission = {
          // 오전 미션
          morningTitle: rows[9]?.[colN] || "",         // N10
          morningTime: rows[9]?.[colP] || "",          // P10
          morningStage1Label: rows[10]?.[colN] || "",  // N11
          morningStage1Team: toNumber(rows[10]?.[colP]),      // P11
          morningStage1Personal: toNumber(rows[11]?.[colP]),  // P12
          morningStage1Reward: toNumber(rows[12]?.[colP]),    // P13
          morningStage2Label: rows[13]?.[colN] || "",         // N14
          morningStage2Team: toNumber(rows[13]?.[colP]),      // P14
          morningStage2Personal: toNumber(rows[14]?.[colP]),  // P15
          morningStage2Reward: toNumber(rows[15]?.[colP]),    // P16

          // 오후 미션
          afternoonTitle: rows[16]?.[colN] || "",       // N17
          afternoonTime: rows[16]?.[colP] || "",        // P17
          afternoonStage1Label: rows[17]?.[colN] || "", // N18
          afternoonStage1Team: toNumber(rows[17]?.[colP]),     // P18
          afternoonStage1Personal: toNumber(rows[18]?.[colP]), // P19
          afternoonStage1Reward: toNumber(rows[19]?.[colP]),   // P20
          afternoonStage2Label: rows[20]?.[colN] || "",        // N21
          afternoonStage2Team: toNumber(rows[20]?.[colP]),     // P21
          afternoonStage2Personal: toNumber(rows[21]?.[colP]), // P22
          afternoonStage2Reward: toNumber(rows[22]?.[colP]),   // P23
        };
        setMissionData(mission);

        // 📊 리더보드 파싱
        const headers = rows[0].map((h) => h.trim());
        const bodyRows = rows.slice(1).filter((row) => row[0] && row[0] !== "");
        const dataObjects = bodyRows.map((row) => {
          const obj = {};
          headers.forEach((header, i) => { obj[header] = row[i]; });
          return obj;
        });

        const sorted = dataObjects.sort((a, b) => Number(b["완료"]) - Number(a["완료"]));
        setAllRows(sorted);           // ✅ 도넛 계산은 전체 기준
        setData(sorted.slice(0, 10)); // ✅ 표시는 상위 10명만

        // ⏰ 업데이트 시간
        const now = new Date();
        const timeStr = now.toLocaleString("ko-KR", {
          year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
        setUpdatedAt(timeStr);
      } catch (e) {
        console.error(e);
      }
    };

    load();                     // 최초 1회 로드
    const id = setInterval(load, 60_000); // 60초마다 자동 갱신
    return () => clearInterval(id);
  }, [csvUrl]);

  // ✅ 도넛 통계는 전체(allRows)로 계산
  const stats = useMemo(() => {
    const acc = {
      totalDone: 0,
      timeSegments: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    };
    allRows.forEach((row) => {
      acc.totalDone += Number(row["완료"]) || 0;
      acc.timeSegments.morning += Number(row["아침점심피크"]) || 0;
      acc.timeSegments.afternoon += Number(row["오후논피크"]) || 0;
      acc.timeSegments.evening += Number(row["저녁피크"]) || 0;
      acc.timeSegments.night += Number(row["심야논피크"]) || 0;
    });
    return acc;
  }, [allRows]);

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
        {/* 🎯 오늘의 목표 (상단 고정) */}
        <div className="goal-sticky">
          <div className="goal-box">
            <h1>🔸 오늘의 목표</h1>
            <div className="goals-grid">
              <div className="goal-doughnut">
                <GoalDoughnut label="총 완료" current={stats.totalDone} goal={goalValues.total} />
              </div>

              {/* 아점 */}
              <div className="goal-doughnut">
                <GoalDoughnut label="아점" current={stats.timeSegments.morning} goal={goalValues.morning} />
                <div className="time-range">
                  <div className="tr">
                    <span className="tr-label weekday">평일</span>
                    <span className="tr-value">06:00 ~ 12:59</span>
                  </div>
                  <div className="tr">
                    <span className="tr-label weekend">주말</span>
                    <span className="tr-value">06:00 ~ 13:59</span>
                  </div>
                </div>
              </div>

              {/* 오후 */}
              <div className="goal-doughnut">
                <GoalDoughnut label="오후" current={stats.timeSegments.afternoon} goal={goalValues.afternoon} />
                <div className="time-range">
                  <div className="tr">
                    <span className="tr-label weekday">평일</span>
                    <span className="tr-value">13:00 ~ 16:59</span>
                  </div>
                  <div className="tr">
                    <span className="tr-label weekend">주말</span>
                    <span className="tr-value">14:00 ~ 16:59</span>
                  </div>
                </div>
              </div>

              {/* 저녁 — 라벨 제거, 시간만 */}
              <div className="goal-doughnut">
                <GoalDoughnut label="저녁" current={stats.timeSegments.evening} goal={goalValues.evening} />
                <div className="time-range">
                  <div className="tr">
                    <span className="tr-value">17:00 ~ 19:59</span>
                  </div>
                </div>
              </div>

              {/* 심야 — 라벨 제거, 시간만 */}
              <div className="goal-doughnut">
                <GoalDoughnut label="심야" current={stats.timeSegments.night} goal={goalValues.night} />
                <div className="time-range">
                  <div className="tr">
                    <span className="tr-value">20:00 ~ 02:59</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔸 오늘의 미션 */}
        {missionData && (
          <div className="mission-box">
            <h1>🔸 오늘의 미션</h1>

            <div className="mission-duo-container">
              {/* 오전 미션 */}
              <div className="mission-block">
                <div className="mission-title">
                  <span className="black-square" /> {missionData.morningTitle || "오전 미션"}
                </div>
                <div className="mission-time">{missionData.morningTime}</div>

                <div className="mission-stages">
                  <div className="mission-stage">
                    <strong>{missionData.morningStage1Label || "1단계"}</strong>
                    <div>그룹 : {missionData.morningStage1Team}</div>
                    <div>개인 : {missionData.morningStage1Personal}</div>
                    <div>보상 : {fmtCurrency(missionData.morningStage1Reward)}</div>
                  </div>
                  <div className="mission-stage">
                    <strong>{missionData.morningStage2Label || "2단계"}</strong>
                    <div>그룹 : {missionData.morningStage2Team}</div>
                    <div>개인 : {missionData.morningStage2Personal}</div>
                    <div>보상 : {fmtCurrency(missionData.morningStage2Reward)}</div>
                  </div>
                </div>
              </div>

              {/* 오후 미션 */}
              <div className="mission-block">
                <div className="mission-title">
                  <span className="black-square" /> {missionData.afternoonTitle || "오후 미션"}
                </div>
                <div className="mission-time">{missionData.afternoonTime}</div>

                <div className="mission-stages">
                  <div className="mission-stage">
                    <strong>{missionData.afternoonStage1Label || "1단계"}</strong>
                    <div>그룹 : {missionData.afternoonStage1Team}</div>
                    <div>개인 : {missionData.afternoonStage1Personal}</div>
                    <div>보상 : {fmtCurrency(missionData.afternoonStage1Reward)}</div>
                  </div>
                  <div className="mission-stage">
                    <strong>{missionData.afternoonStage2Label || "2단계"}</strong>
                    <div>그룹 : {missionData.afternoonStage2Team}</div>
                    <div>개인 : {missionData.afternoonStage2Personal}</div>
                    <div>보상 : {fmtCurrency(missionData.afternoonStage2Reward)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🏆 배달 완료 순위 */}
        <h1>🔸 배달 완료 순위</h1>
        <p className="update-time">마지막 업데이트: {updatedAt}</p>

        {/* 가로 스크롤 래퍼 */}
        <div className="table-scroll">
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

      </div>
    </>
  );
}

export default App;


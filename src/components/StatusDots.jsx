import React from "react";

function StatusDots() {
  const status = ["done", "canceled", "notDone", "postponed"];
  const dotStyle = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "block",
    margin: "5px",
  };

  const dotColors = {
    done: "#4CAF50",
    canceled: "#FF5722",
    notDone: "#2196F3",
    postponed: "#FFEB3B",
  };
  const statusNepali = {
    done: "भएको",
    notDone: "नभएको",
    postponed: " हुने तर नभएको",
    canceled: "रद्द गरिएको",
  };
  return (
    <div>
      {status.map((item, index) => (
        <div className="inline-flex gap-3 items-center px-10">
          <span
            className=" "
            key={index}
            style={{ ...dotStyle, backgroundColor: dotColors[item] }}
          ></span>
          <span className="capitalize">{statusNepali[item]}</span>
        </div>
      ))}
    </div>
  );
}

export default StatusDots;

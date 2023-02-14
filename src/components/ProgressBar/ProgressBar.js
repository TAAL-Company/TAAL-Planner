import React, { useState, useEffect } from "react";
import "./ProgressBar.css"


const ProgressBar = (props) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const roundedPercent = Math.ceil(props.percent);

    console.log("percent", roundedPercent)
    if (roundedPercent > 100) {
      setPercent(100);
      props.setProgressBarFlag(false)
    }
    else {
      setPercent(roundedPercent);
    }
  }, [props.percent]);

  return (
    <div className="ProgressBarWrapper">
      <div className="ProgressBarBorder">
        <div className="ProgressBar" style={{ width: `${props.percent}%` }}>
          {props.percent > 100 ? 100 : props.percent}%</div>
      </div>
    </div>
  );
};

export default ProgressBar;
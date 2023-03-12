import "./Status.css";

const Status = (props) => {
  const flagColor = props.classification;

  if (flagColor === "red") {
    return (
      <div className="statusRTL" style={{ background: "#DD001A" }}>
        <div className="contentStatusRTL">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 23.85 23.85"
          >
            <g id="degel_adom" transform="translate(1 1)">
              <circle
                id="Ellipse_27"
                data-name="Ellipse 27"
                cx="10.925"
                cy="10.925"
                r="10.925"
                fill="white"
                stroke="#fd0000"
                strokeWidth="2"
              />
              <path
                id="Path_6402"
                data-name="Path 6402"
                d="M158.072,15.671l-3.539-3.539L158.067,8.6,156.14,6.673l-3.532,3.533L149.08,6.678l-1.927,1.927,3.528,3.527-3.533,3.533,1.927,1.927,3.533-3.533,3.538,3.539Z"
                transform="translate(-141.685 -1.21)"
                fill="#fd0000"
              />
            </g>
          </svg>
          <div className="textStatusRTL" style={{ color: "white" }}>
            לא תקין
          </div>
        </div>
      </div>
    );
  } else if (flagColor === "yellow") {
    return (
      <div className="statusRTL" style={{ background: "#F49A40" }}>
        <div className="contentStatusRTL">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23.85"
            height="29"
            viewBox="0 0 23.85 29"
          >
            <g id="Degel_tzhov" transform="translate(1)">
              <path
                id="Path_6406"
                data-name="Path 6406"
                d="M10.925,0A10.925,10.925,0,1,1,0,10.925,10.925,10.925,0,0,1,10.925,0Z"
                transform="translate(0 1.876)"
                fill="white"
                stroke="#f3ae69"
                // strokeWidtextStatusRTLth="2"
              />
              <text
                id="_"
                data-name="?"
                transform="translate(6.217 20)"
                fill="#f3ae69"
                fontSize=" "
                fontFamily="SimplerPro_HLAR-Black, SimplerPro_HLAR"
                fontWeight="800"
              >
                <tspan x="9" y="-2">
                  ?
                </tspan>
              </text>
            </g>
          </svg>
          <div className="textStatusRTL" style={{ color: "white" }}>
            להתאמה
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="statusRTL" style={{ background: "#71AA6F" }}>
        <div className="contentStatusRTL">
          <div className="iconStatus"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23.85"
            height="23.85"
            viewBox="0 0 23.85 23.85"
          >
            <g id="degel_yarok" transform="translate(1 1)">
              <circle
                id="Ellipse_28"
                data-name="Ellipse 28"
                cx="10.925"
                cy="10.925"
                r="10.925"
                fill="white"
                stroke="#6eb85e"
                strokeWidth="2"
              />
              <path
                id="Path_6404"
                data-name="Path 6404"
                d="M158.363,8.606,156.828,7.3l-5.641,6.634-2.465-3.088L147.147,12.1l3.994,5Z"
                transform="translate(-141.539 -0.988)"
                fill="#6eb85e"
                stroke="#6eb85e"
                strokeWidth="0.5"
              />
            </g>
          </svg>
          <div className="textStatusRTL" style={{ color: "white" }}>
            תקין
          </div>
        </div>
      </div>
    );
  }
};

export default Status;

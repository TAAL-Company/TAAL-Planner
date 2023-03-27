import React, { useState, useEffect } from "react";
import "./Modal.css";

//--------------------------

//--------------------------
function Modal_dropdown(props) {
  return (
    <>
      <div id="dropdown" className="button-dropdown-content">
        <a onClick={() => props.setRequestForEditing("edit")}>עריכה</a>
        <a onClick={() => props.setRequestForEditing("duplication")}>שכפול</a>
        <a onClick={() => props.setRequestForEditing("details")}>פרטים</a>
        <a onClick={() => props.setRequestForEditing("delete")}>מחיקה</a>
      </div>
    </>
  );
}
export default Modal_dropdown;

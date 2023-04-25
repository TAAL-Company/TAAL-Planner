import React, { useState, useEffect } from "react";
import "./Modal.css";

//--------------------------

//--------------------------
function Modal_dropdown(props) {
  return (
    <>
      <div id="dropdown" className="button-dropdown-content">
        {props.editable ? (
          <a onClick={() => props.setRequestForEditing("edit")}>עריכה</a>
        ) : (
          <></>
        )}
        {props.Reproducible ? (
          <a onClick={() => props.setRequestForEditing("duplication")}>שכפול</a>
        ) : (
          <></>
        )}
        {props.details ? (
          <a onClick={() => props.setRequestForEditing("details")}>פרטים</a>
        ) : (
          <></>
        )}
        {props.erasable ? (
          <a onClick={() => props.setRequestForEditing("delete")}>מחיקה</a>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
export default Modal_dropdown;

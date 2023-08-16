import React, { useState, useEffect, useRef } from "react";
import "./Modal.css";

//--------------------------

//--------------------------
function Modal_dropdown(props) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        props.setOpenThreeDotsVertical(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef}>
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
    </div>
  );
}
export default Modal_dropdown;

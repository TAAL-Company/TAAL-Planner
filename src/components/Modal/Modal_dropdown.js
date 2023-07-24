import React, { useState, useEffect, useRef } from "react";
import "./Modal.css";

//--------------------------

//--------------------------
function Modal_dropdown(props) {
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && !open) {
        props.setOpenThreeDotsVertical(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  function Requestedit() {
    setOpen(true)
    props.setRequestForEditing("edit")
  }

  function Requestduplication() {
    setOpen(true)
    props.setRequestForEditing("duplication")
  }

  function Requestdetails() {
    setOpen(true)
    props.setRequestForEditing("details")
  }

  function Requestdelete() {
    setOpen(true)
    props.setRequestForEditing("delete")
  }

  return (
    <div ref={menuRef}>
      <div id="dropdown" className="button-dropdown-content">
        {props.editable ? (
          <a onClick={Requestedit}>עריכה</a>
        ) : (
          <></>
        )}
        {props.Reproducible ? (
          <a onClick={Requestduplication}>שכפול</a>
        ) : (
          <></>
        )}
        {props.details ? (
          <a onClick={Requestdetails}>פרטים</a>
        ) : (
          <></>
        )}
        {props.erasable ? (
          <a onClick={Requestdelete}>מחיקה</a>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
export default Modal_dropdown;

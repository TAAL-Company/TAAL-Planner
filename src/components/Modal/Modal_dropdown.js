import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

//--------------------------

//--------------------------
function Modal_dropdown(props) {
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const myDiv = document.getElementById('dropdown');

  useEffect(() => {
    if (props.setOpenThreeDotsVertical !== -1 && open) {
      props.setOpenThreeDotsVertical(-1);
    }

    document.addEventListener('click', function (event) {
      const targetElement = event.target;

      if (menuRef.current && !menuRef.current.contains(targetElement)) {
        props.setOpenThreeDotsVertical(-1);
      }
    });
  });

  function Requestedit() {
    setOpen(true);
    props.setRequestForEditing('edit');
  }

  function Requestduplication() {
    setOpen(true);
    props.setRequestForEditing('duplication');
  }

  function Requestdetails() {
    setOpen(true);
    props.setRequestForEditing('details');
  }

  function Requestdelete() {
    setOpen(true);
    props.setRequestForEditing('delete');
  }

  return (
    <div ref={menuRef}>
      <div id='dropdown' className='button-dropdown-content'>
        {props.editable ? <Link onClick={Requestedit}>עריכה</Link> : <></>}
        {props.Reproducible ? (
          <Link onClick={Requestduplication}>שכפול</Link>
        ) : (
          <></>
        )}
        {props.details ? <Link onClick={Requestdetails}>פרטים</Link> : <></>}
        {props.erasable ? <Link onClick={Requestdelete}>מחיקה</Link> : <></>}
      </div>
    </div>
  );
}
export default Modal_dropdown;

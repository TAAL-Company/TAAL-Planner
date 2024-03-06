import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

//--------------------------

//--------------------------
function Modal_Dropdown(props) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        props.setOpenThreeDotsVertical(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <div style={{ position: 'absolute', top: '0', left: '100%' }} id='dropdown' className='button-dropdown-content'>
        {props.editable ? (
          <Link onClick={() => props.setRequestForEditing('edit')}>עריכה</Link>
        ) : (
          <></>
        )}
        {props.Reproducible ? (
          <Link onClick={() => props.setRequestForEditing('duplication')}>
            שכפול
          </Link>
        ) : (
          <></>
        )}
        {props.details ? (
          <Link onClick={() => props.setRequestForEditing('details')}>
            פרטים
          </Link>
        ) : (
          <></>
        )}
        {props.erasable ? (
          <Link onClick={() => props.setRequestForEditing('delete')}>
            מחיקה
          </Link>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
export default Modal_Dropdown;

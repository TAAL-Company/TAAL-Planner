import React, { useState, useEffect } from 'react';
import "./Modal.css";

//--------------------------

//--------------------------
function Modal_dropdown(props) {

    return (
        <>
            <div id="dropdown" className="button-dropdown-content">
                <a href="#home">עריכה</a>
                <a href="#about">שכפול</a>
                <a href="#contact">פרטים</a>
            </div>
        </>
    );
}
export default Modal_dropdown;
import './Modal.css';
import stopIcon from '../../../Pictures/stopIcon.svg';
import React, { useState, useEffect } from 'react';

const Modal_route_chosen = (props) => {

  const [isBoardChanged, setIsBoardChanged] = useState(false);

  useEffect(() => {
    let changetasksRoutes = localStorage.getItem('changetasksRoutes');
    setIsBoardChanged(changetasksRoutes);
  }, []);

  return (
    <>
      <div className='modal_route_chosen'>
        <div className='stopIconContainer'>
          <img src={stopIcon} alt='logo'></img>
        </div>
        <div className='body' style={{ textAlign: 'center', direction: 'rtl' }}>
          <h4>{props.language !== 'English' ? 'Changing Route' : 'שינוי מסלול'} </h4>
          {isBoardChanged === 'true' ? (
          <div>{props.language !== 'English' ? 'Changing route will delete the changes you made on the current route if not saved' : 'שינוי מסלול ימחק את השינויים שביצעת במסלול הנוכחי אם לא יישמרו'}</div>
          ) : (<></>)}
        </div>
        <div className='footer' style={{ display: 'flex' }}>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setOpenModalRouteChosen(false);
            }}
          >
            {props.language !== 'English' ? 'Cancel' : 'ביטול'}
          </button>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setReplaceRouteFlag(true);
            }}
          >
           {props.language !== 'English' ? 'Replace' : 'החלף מסלול'}
          </button>
        </div>
      </div>
    </>
  );
};
export default Modal_route_chosen;

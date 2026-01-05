
import './Modal.css';
import stopIcon from '../../../Pictures/stopIcon.svg';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Modal_route_chosen = (props) => {
  const { t } = useTranslation();
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
          <h4>{t('plannerPage.Changing_Route')}</h4>
          {isBoardChanged === 'true' ? (
            <div>{t('plannerPage.Changing_route_will_delete_the_changes_you_made_on_the_current_route_if_not_saved')}</div>
          ) : (<></>)}
        </div>
        <div className='footer' style={{ display: 'flex' }}>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setOpenModalRouteChosen(false);
            }}
          >
            {t('plannerPage.Cancel')}
          </button>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setReplaceRouteFlag(true);
            }}
          >
            {t('plannerPage.Replace')}
          </button>
        </div>
      </div>
    </>
  );
};
export default Modal_route_chosen;

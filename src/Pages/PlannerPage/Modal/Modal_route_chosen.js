
import './Modal.css';
import stopIcon from '../../../Pictures/stopIcon.svg';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';

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
          <h4><I18nHoverText translationKey="plannerPage.Changing_Route">{t('plannerPage.Changing_Route')}</I18nHoverText></h4>
          {isBoardChanged === 'true' ? (
            <div>
              <I18nHoverText translationKey="plannerPage.Changing_route_will_delete_the_changes_you_made_on_the_current_route_if_not_saved">
                {t('plannerPage.Changing_route_will_delete_the_changes_you_made_on_the_current_route_if_not_saved')}
              </I18nHoverText>
            </div>
          ) : (<></>)}
        </div>
        <div className='footer' style={{ display: 'flex' }}>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setOpenModalRouteChosen(false);
            }}
          >
            <I18nHoverText translationKey="plannerPage.Cancel">{t('plannerPage.Cancel')}</I18nHoverText>
          </button>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setReplaceRouteFlag(true);
            }}
          >
            <I18nHoverText translationKey="plannerPage.Replace">{t('plannerPage.Replace')}</I18nHoverText>
          </button>
        </div>
      </div>
    </>
  );
};
export default Modal_route_chosen;

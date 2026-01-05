
import './Modal.css';
import stopIcon from '../../../Pictures/stopIcon.svg';
import { useTranslation } from 'react-i18next';

const Modal_Site_Chosen = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <div className='modal_route_chosen'>
        <div className='stopIconContainer'>
          <img src={stopIcon} alt='logo'></img>
        </div>
        <div className='body' style={{ textAlign: 'center', direction: 'rtl' }}>
          <h4>{t('plannerPage.Chose_another_site')}</h4>
          <div>{t('plannerPage.Changing_site_will_delete_the_changes_you_made_on_the_current_site')}</div>
        </div>
        <div className='footer' style={{ display: 'flex' }}>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setOpenModalSiteChosen(false);
            }}
          >
            {t('plannerPage.Cancel')}
          </button>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setReplaceSiteFlag(true);
            }}
          >
            {t('plannerPage.Replace')}
          </button>
        </div>
      </div>
    </>
  );
};
export default Modal_Site_Chosen;

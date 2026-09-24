
import './Modal.css';
import stopIcon from '../../../Pictures/stopIcon.svg';
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';

const Modal_Site_Chosen = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <div className='modal_route_chosen'>
        <div className='stopIconContainer'>
          <img src={stopIcon} alt='logo'></img>
        </div>
        <div className='body' style={{ textAlign: 'center', direction: 'rtl' }}>
          <h4><I18nHoverText translationKey="plannerPage.Chose_another_site">{t('plannerPage.Chose_another_site')}</I18nHoverText></h4>
          <div>
            <I18nHoverText translationKey="plannerPage.Changing_site_will_delete_the_changes_you_made_on_the_current_site">
              {t('plannerPage.Changing_site_will_delete_the_changes_you_made_on_the_current_site')}
            </I18nHoverText>
          </div>
        </div>
        <div className='footer' style={{ display: 'flex' }}>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setOpenModalSiteChosen(false);
            }}
          >
            <I18nHoverText translationKey="plannerPage.Cancel">{t('plannerPage.Cancel')}</I18nHoverText>
          </button>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setReplaceSiteFlag(true);
            }}
          >
            <I18nHoverText translationKey="plannerPage.Replace">{t('plannerPage.Replace')}</I18nHoverText>
          </button>
        </div>
      </div>
    </>
  );
};
export default Modal_Site_Chosen;


import "./Modal.css"
import stopIcon from '../../../Pictures/stopIcon.svg';
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';

const Modal_No_Site_Selected = (props) => {
    const { t } = useTranslation();
    return (
        <>
            <div className="modalContainerPlases" style={ props.styleTransform }>
                <div className="stopIconContainer">
                    <img
                        src={stopIcon}
                        alt="logo"
                    ></img>
                </div>
                <div className="body" style={{ textAlign: "center" }}>
                    <h4>
                        <I18nHoverText translationKey="plannerPage.You_must_choose_a_site">
                          {t('plannerPage.You_must_choose_a_site')}
                        </I18nHoverText>
                    </h4>
                </div>
                <div className="footer">
                    <button
                        className="cancelBtn"
                        onClick={() => {
                            props.setOpenModal(false);
                        }}
                    >
                       <I18nHoverText translationKey="Cancel">{t('Cancel')}</I18nHoverText>
                    </button>
                </div>
            </div>
        </>
    );
}
export default Modal_No_Site_Selected;
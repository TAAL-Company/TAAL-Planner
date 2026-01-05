
import "./Modal.css"
import stopIcon from '../../../Pictures/stopIcon.svg';
import { useTranslation } from 'react-i18next';

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
                        {t('plannerPage.You_must_choose_a_site')}
                    </h4>
                </div>
                <div className="footer">
                    <button
                        className="cancelBtn"
                        onClick={() => {
                            props.setOpenModal(false);
                        }}
                    >
                       {t('Cancel')}
                    </button>
                </div>
            </div>
        </>
    );
}
export default Modal_No_Site_Selected;
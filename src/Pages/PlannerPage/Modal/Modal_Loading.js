
import "./Modal.css";
import ReactLoading from "react-loading";
import CircularProgressWithLabel from "./progressbar";
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';

const Modal_Loading = (props) => {
  const { t } = useTranslation();
  return (
    <>
      {props.props === false ? (
        <>
          <div className="modalContainerLittleLoading">
            <h2 style={{ color: "white" }}><I18nHoverText translationKey="plannerPage.Loading">{t('plannerPage.Loading')}</I18nHoverText></h2>
            <ReactLoading />
          </div>
        </>
      ) : (
        <>
          <div className="modalContainerLoading">
            <div>
              <h1 style={{ color: "" }}><I18nHoverText translationKey="plannerPage.Loading">{t('plannerPage.Loading')}</I18nHoverText></h1>
              <ReactLoading
                type={"bars"}
                className="loading"
                color={"rgb(180, 175, 199)"}
                height={"12%"}
                width={"12%"}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default Modal_Loading;

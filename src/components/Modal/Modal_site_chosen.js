import "./Modal.css"
import stopIcon from '../../Pictures/stopIcon.svg'

const Modal_site_chosen = (props) => {

    console.log('Modal_site_chosen')
    return (
        <>

            <div className="modal_route_chosen">
                <div className="stopIconContainer">
                    <img
                        src={stopIcon}
                        alt="logo"

                    ></img>
                </div>
                <div className="body" style={{ textAlign: "center", direction: "rtl" }}>
                    <h4>
                        בחרת כבר באתר אחר, ברצונך להחליף?
                    </h4>
                    <div>
                        החלפת אתר תמחק את השינויים שביצעת באתר הנוכחי
                    </div>
                </div>
                <div className="footer" style={{ display: "flex" }}>
                    <button
                        className="cancelBtn"
                        onClick={() => {
                            props.setOpenModalSiteChosen(false);
                        }}
                    >
                        ביטול
                    </button>
                    <button
                        className="cancelBtn"
                        onClick={() => {
                            props.setReplaceSiteFlag(true);
                        }}
                    >
                        החלף אתר
                    </button>
                </div>
            </div>

        </>

    );
}
export default Modal_site_chosen;
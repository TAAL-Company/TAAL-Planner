import "./Modal.css"
import stopIcon from '../../Pictures/stopIcon.svg'

const Modal_no_site_selected = (props) => {


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
                        {" "}
                        עליך לבחור אתר
                    </h4>

                </div>
                <div className="footer">
                    <button
                        className="cancelBtn"
                        onClick={() => {
                            props.setOpenModal(false);
                        }}
                    >
                        סגור
                    </button>
                </div>
            </div>
        </>

    );
}
export default Modal_no_site_selected;
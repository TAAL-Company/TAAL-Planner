import "./Modal.css"
import stopIcon from '../../../Pictures/stopIcon.svg';

const Modal_No_Site_Selected = (props) => {


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
                    {props.language !== 'English' ? 'You must choose a site' : 'עליך לבחור אתר'}
                    </h4>

                </div>
                <div className="footer">
                    <button
                        className="cancelBtn"
                        onClick={() => {
                            props.setOpenModal(false);
                        }}
                    >
                       {props.language !== 'English' ? 'Cancel' : 'ביטול'}
                    </button>
                </div>
            </div>
        </>

    );
}
export default Modal_No_Site_Selected;
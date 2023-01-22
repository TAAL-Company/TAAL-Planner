import "./Modal.css"
import stopIcon from '../../Pictures/stopIcon.svg'

const Modal_route_chosen = (props) => {

    console.log('Modal_route_chosen')
    return (
        <>

            <div className="modal_route_chosen">
                <div className="stopIconContainer">
                    <img
                        src={stopIcon}
                        alt="logo"

                    ></img>
                </div>
                <div className="body" style={{ textAlign: "center" , direction: "rtl"}}>
                    <h4>
                        {" "}
                        בחרת כבר במסלול אחר, ברצונך להחליף?
                    </h4>

                </div>
                <div className="footer">
                    <button
                        className="cancelBtn"
                        onClick={() => {
                            props.setOpenModalRouteChosen(false);
                        }}
                    >
                        ביטול
                    </button>
                </div>
            </div>

        </>

    );
}
export default Modal_route_chosen;
import './Modal.css';
import stopIcon from '../../Pictures/stopIcon.svg';

const Modal_route_chosen = (props) => {
  return (
    <>
      <div className='modal_route_chosen'>
        <div className='stopIconContainer'>
          <img src={stopIcon} alt='logo'></img>
        </div>
        <div className='body' style={{ textAlign: 'center', direction: 'rtl' }}>
          <h4>בחרת כבר במסלול אחר, ברצונך להחליף?</h4>
          <div>החלפת מסלול תמחק את השינויים שביצעת במסלול הנוכחי</div>
        </div>
        <div className='footer' style={{ display: 'flex' }}>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setOpenModalRouteChosen(false);
            }}
          >
            ביטול
          </button>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setReplaceRouteFlag(true);
            }}
          >
            החלף מסלול
          </button>
        </div>
      </div>
    </>
  );
};
export default Modal_route_chosen;

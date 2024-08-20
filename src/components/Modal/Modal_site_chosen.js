import './Modal.css';
import stopIcon from '../../Pictures/stopIcon.svg';

const Modal_Site_Chosen = (props) => {
  return (
    <>
      <div className='modal_route_chosen'>
        <div className='stopIconContainer'>
          <img src={stopIcon} alt='logo'></img>
        </div>
        <div className='body' style={{ textAlign: 'center', direction: 'rtl' }}>
          <h4>{props.language !== 'English' ? 'Chose another site' : 'בחרת כבר באתר אחר, ברצונך להחליף?'}</h4>
          <div>{props.language !== 'English' ? 'Changing site will delete the changes you made on the current site' : 'החלפת אתר תמחק את השינויים שביצעת באתר הנוכחי'} </div>
        </div>
        <div className='footer' style={{ display: 'flex' }}>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setOpenModalSiteChosen(false);
            }}
          >
            {props.language !== 'English' ? 'Cancel' : 'ביטול'}
          </button>
          <button
            className='cancelBtn'
            onClick={() => {
              props.setReplaceSiteFlag(true);
            }}
          >
            {props.language !== 'English' ? 'Replace' : 'החלף אתר'}
          </button>
        </div>
      </div>
    </>
  );
};
export default Modal_Site_Chosen;

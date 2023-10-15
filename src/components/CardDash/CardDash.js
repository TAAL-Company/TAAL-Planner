import { useHistory } from 'react-router-dom';
import { AiOutlinePlus } from 'react-icons/ai';
import './style.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const CardDash = (props) => {
  console.log(props.cards);
  const headline = props.cards.headline;
  const addLabel = props.cards.addLabel;
  const image = props.cards.image;

  const history = useHistory();

  const handleAddLink = (id) => {
    if (id === 1) {
      history.replace('/places');
    } else if (id === 2) {
      history.replace('/student');
    } else if (id === 3) {
      history.replace('/planner');
    } else if (id === 4) {
      window.location('www.google.com');
    } else console.log('fail');
  };

  const handleHeadlineLink = (id) => {
    console.log('done headline link');
    if (id === 1) {
      history.replace('/places');
    } else if (id === 2) {
      history.replace('/student');
    } else if (id === 3) {
      history.replace('/routes_cards');
    } else if (id === 4) {
      history.replace('/subjects');
    } else if (id === 5) {
      history.replace('/gallery');
    } else if (id === 6) {
      history.replace('/coaches');
    } else if (id === 8) {
      history.replace('/community');
    } else if (id === 9) {
      history.replace('/planner');
    } else console.log('fail');
  };

  return (
    <div className='CardDash'>
      <Link
        className='headlineClick'
        onClick={() => handleHeadlineLink(props.cards.id)}
      >
        <div className='headline'>{headline}</div>
        <div className='image_background'>
          <img className='cardPhoto' src={image} alt='Card Logo'></img>
        </div>
      </Link>
      {addLabel == '' ? null :
        <Link className='add' onClick={() => handleAddLink(props.cards.id)}>
          {addLabel}
          <AiOutlinePlus className='plus' />
        </Link>
      }

    </div>
  );
};

export default CardDash;

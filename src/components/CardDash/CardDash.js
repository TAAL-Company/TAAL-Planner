import { useHistory } from 'react-router-dom';
import { AiOutlinePlus } from 'react-icons/ai';
import './style.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { useState } from 'react';

const CardDash = (props) => {
  const [isHover, setIsHover] = useState(false);

  const headline = props.cards.headline;
  const addLabel = props.cards.addLabel;
  const image = props.cards.image;
  const color = props.cards.color;

  const history = useHistory();

  const handleAddLink = (id) => {
    if (id === 1) {
      history.replace('/places');
    } else if (id === 2) {
      history.replace('/student');
    } else if (id === 3) {
      history.replace('/planner');
    } else if (id === 4) {
      window.location('/subjects');
    } else console.log('fail');
  };

  const handleHeadlineLink = (id) => {
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

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const divStyles = {
    boxShadow: isHover ? '0 6px 20px 0 ' + color : '',
    border: isHover ? 'solid 5px' + color : '',
    transition: isHover ? "border-width 0.3s linear" : ''
  };

  return (
    <div className='CardDash' style={divStyles} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} >
      <Link
        className='headlineClick'
        onClick={() => handleHeadlineLink(props.cards.id)}
      >
        <div className='headline'>{headline}</div>
        <div className='image_background'>
          <img className='cardPhoto' src={image} alt='Card Logo'></img>
        </div>
      </Link>
      {addLabel === '' ? (<></>) : (
        <Link className='add' onClick={() => handleAddLink(props.cards.id)}>
          {addLabel}
          <AiOutlinePlus className='plus' />
        </Link>
      )}
    </div>
  );
};

export default CardDash;

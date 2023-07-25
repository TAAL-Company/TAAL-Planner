import React from 'react';
import './style.css';
// import Navbar from "../Navbar/Navbar";
import CardDash from '../CardDash/CardDash';
import pic from '../../Pictures/picture_logo.png';

const Dashboard = () => {
  const cards = [
    {
      id: 1,
      headline: 'אתרים',
      addLabel: 'הוספת אתר',
      image: pic,
    },
    {
      id: 2,
      headline: 'עובדים',
      addLabel: 'הוספת חניך',
      image: pic,
    },
    {
      id: 3,
      headline: 'מסלולים',
      addLabel: 'הוספת מסלול',
      image: pic,
    },
    {
      id: 4,
      headline: 'מקצועות',
      addLabel: 'הוספת מקצוע',
      image: pic,
    },
    {
      id: 5,
      headline: 'גלריה',
      addLabel: 'הוספת תמונה',
      image: pic,
    },
    {
      id: 6,
      headline: 'מדריכים',
      addLabel: 'הוספת מדריך',
      image: pic,
    },
  ];

  return (
    <div className='Dashboard'>
      {/* <Navbar /> */}
      <div className='content'>
        <div className='left'>Dashboards</div>
        <div className='right'>
          <div className='cardsLine'>
            <CardDash cards={cards[0]} />
            <CardDash cards={cards[1]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[2]} />
            <CardDash cards={cards[3]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[4]} />
            <CardDash cards={cards[5]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

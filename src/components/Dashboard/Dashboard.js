import React from 'react';
import './style.css';
// import Navbar from "../Navbar/Navbar";
import CardDash from '../CardDash/CardDash';
import location from '../../Pictures/location.svg';
import route from '../../Pictures/route.svg';
import group from '../../Pictures/Group.svg';
import kashrut from '../../Pictures/הכשרות.svg';
import Professions from '../../Pictures/Professions.svg';
import coachImage from '../../Pictures/coach.png';
import galleryImage from '../../Pictures/gallery.png';
import pic from '../../Pictures/defualtSiteImg.svg';
import Barchart from '../Charts/Barchart'
import Piechart from '../Charts/Piechart'

const Dashboard = () => {
  const cards = [
    {
      id: 1,
      headline: 'אתרים',
      addLabel: 'הוספת אתר',
      image: location,
    },
    {
      id: 2,
      headline: 'עובדים',
      addLabel: 'הוספת חניך',
      image: group,
    },
    {
      id: 7,
      headline: 'הכשרות',
      addLabel: 'הוספת חניך',
      image: kashrut,
    },
    {
      id: 3,
      headline: 'מסלולים',
      addLabel: 'הוספת מסלול',
      image: route,
    },
    {
      id: 4,
      headline: 'מקצועות',
      addLabel: 'הוספת מקצוע',
      image: Professions,
    },
    {
      id: 5,
      headline: 'גלריה',
      addLabel: 'הוספת תמונה',
      image: galleryImage,
    },
    {
      id: 6,
      headline: 'מדריכים',
      addLabel: 'הוספת מדריך',
      image: coachImage,
    },
  ];

  return (
    <div className='Dashboard'>
      {/* <Navbar /> */}
      <div className='content'>
        <div className='left'>
        <Barchart />
        <Piechart />
        </div>
        <div className='right'>
          <div className='cardsLine'>
            <CardDash cards={cards[2]} />
            <CardDash cards={cards[1]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[3]} />
            <CardDash cards={cards[0]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[5]} />
            <CardDash cards={cards[4]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[6]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

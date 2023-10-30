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
import communityImage from '../../Pictures/community.png';
import pic from '../../Pictures/defualtSiteImg.svg';
import Barchart from '../Charts/Barchart';
import Piechart from '../Charts/Piechart';

const Dashboard = () => {
  const cards = [
    {
      id: 1,
      headline: 'אתרים',
      addLabel: 'הוספת אתר',
      image: location,
      color: '#f29d38'
    },
    {
      id: 2,
      headline: 'עובדים',
      addLabel: 'הוספת עובד',
      image: group,
      color: '#b1cdf9'
    },
    {
      id: 3,
      headline: 'מְתַכנֵן',
      addLabel: '',
      image: route,
      color: '#5bcfd0'
    },
    {
      id: 4,
      headline: 'מקצועות',
      addLabel: 'הוספת מקצוע',
      image: Professions,
      color: '#f191c2'
    },
    {
      id: 5,
      headline: 'גלריה',
      addLabel: 'הוספת תמונה',
      image: galleryImage,
      color: '#c5d1da'
    },
    {
      id: 6,
      headline: 'מדריכים',
      addLabel: 'הוספת מדריך',
      image: coachImage,
      color: '#3eacec'
    },
    {
      id: 7,
      headline: 'הכשרות',
      addLabel: 'הוספת הכשרה',
      image: kashrut,
      color: '#57c47d'
    },
    {
      id: 8,
      headline: 'קהילה',
      addLabel: 'הוספת הודעה',
      image: communityImage,
      color: '#65befc'
    },
    {
      id: 9,
      headline: 'הוספת תכנֵון',
      addLabel: '',
      image: route,
      color: '#57c8ca'
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
            <CardDash cards={cards[6]} />
            <CardDash cards={cards[1]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[2]} />
            <CardDash cards={cards[8]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[0]} />
            <CardDash cards={cards[5]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[3]} />
            <CardDash cards={cards[4]} />
          </div>
          <div className='cardsLine'>
            <CardDash cards={cards[7]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

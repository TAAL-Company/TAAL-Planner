import React, { useEffect, useState } from 'react';
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
// import pic from '../../Pictures/defualtSiteImg.svg';
// import Barchart from '../charts/Barchart';
// import Piechart from '../charts/Piechart';

const Dashboard = () => {



  const currentLanguage = sessionStorage.getItem('language');


  const cardsHebrew = [
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
    {
      id: 10,
      headline: 'עורך',
      addLabel: 'עורך',
      image: coachImage,
      color: '#57c8ca'
    },
  ]

  const cardsEnglish = [
    {
      id: 1,
      headline: 'Sites',
      addLabel: 'Add Site',
      image: location,
      color: '#f29d38'
    },
    {
      id: 2,
      headline: 'Students',
      addLabel: 'Add Student',
      image: group,
      color: '#b1cdf9'
    },
    {
      id: 3,
      headline: 'Routes',
      addLabel: '',
      image: route,
      color: '#5bcfd0'
    },
    {
      id: 4,
      headline: 'Professions',
      addLabel: 'Add Profession',
      image: Professions,
      color: '#f191c2'
    },
    {
      id: 5,
      headline: 'Gallery',
      addLabel: 'Add Image',
      image: galleryImage,
      color: '#c5d1da'
    },
    {
      id: 6,
      headline: 'Coaches',
      addLabel: 'Add Coach',
      image: coachImage,
      color: '#3eacec'
    },
    {
      id: 7,
      headline: 'Health',
      addLabel: 'Add Health',
      image: kashrut,
      color: '#57c47d'
    },
    {
      id: 8,
      headline: 'Community',
      addLabel: 'Add Community',
      image: communityImage,
      color: '#65befc'
    },
    {
      id: 9,
      headline: 'Add Route',
      addLabel: '',
      image: route,
      color: '#57c8ca'
    },
    {
      id: 10,
      headline: 'Editor',
      addLabel: 'Add Editor',
      image: coachImage,
      color: '#57c8ca'
    },
  ]

  const selectedCards = {
    "English": cardsEnglish,
    "Hebrew": cardsHebrew,
    // "Arabic": cardsArabic,
    // Add more languages as needed
  };

  const cards = selectedCards[currentLanguage] || cardsEnglish;

  const jwt = sessionStorage.getItem('jwt');
  const jwtEditor = sessionStorage.getItem('jwt-EDITOR');
  const role = jwt ? JSON.parse(jwt)?.role : null;
  const editorId = jwtEditor && jwtEditor !== "undefined" ? JSON.parse(jwtEditor)?.id : "ADMIN";

  const leftElements = [
    <div className='right'>
      <div className='cardsLine'>
        <CardDash cards={cards[6]} />
        <CardDash cards={cards[1]} />
      </div><div className='cardsLine'>
        <CardDash cards={cards[2]} />
        <CardDash cards={cards[8]} />
      </div><div className='cardsLine'>
        <CardDash cards={cards[0]} />
        <CardDash cards={cards[5]} />
      </div><div className='cardsLine'>
        <CardDash cards={cards[3]} />
        <CardDash cards={cards[4]} />
      </div><div className='cardsLine'>
        <CardDash cards={cards[7]} />
        {role === "ADMIN" ? (
          <CardDash cards={cards[9]} />
        ) : (<></>)}
      </div>
    </div>

  ]

  const rightElements = [
    <div className='left'> {
      <iframe
        width="100%"
        height="100%"
        src={`https://dashboardskillsservice.azurewebsites.net/?embed=true&role=${role}&data=${editorId}&Language=${currentLanguage}`}
      ></iframe>
    } </div>
  ]

  // const elements = currentLanguage === "English" ? (
  //   [leftElements, rightElements]
  // ) : (
  //   [rightElements, leftElements]
  // );

  const elements = [rightElements, leftElements];
  return (
    <div className='Dashboard'>
      {/* <Navbar /> */}
      <div className='content'>
        {elements}
      </div>
    </div>
  );
};

export default Dashboard;

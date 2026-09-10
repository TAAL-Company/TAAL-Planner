import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';
// import Navbar from "../Navbar/Navbar";
import CardDash from '../../components/CardDash/CardDash';
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
import { baseUrl } from '../../config';
// import Charts from '../../components/junk/charts/Charts';
import { Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
// import ScatterChartEditor from '../../components/ScatterChartEditor/ScatterChartEditor';
 

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    textAlign: 'center',
    height: '100%',
    backgroundColor: (props) => props.color,
    color: '#fff',
  },
  media: {
    height: 100,
    width: 100,
    marginBottom: '16px',
  },
  gridContainer: {
    padding: '16px',
  },
});

const Dashboard = () => {
  const { t } = useTranslation();
  const currentLanguage = sessionStorage.getItem('language');

  // Cards using i18n translations
  const cards = [
    {
      id: 1,
      headline: t('Dashboard.sites'),
      addLabel: t('Dashboard.addSite'),
      image: location,
      color: '#f29d38'
    },
    {
      id: 2,
      headline: t('Dashboard.employees'),
      addLabel: t('Dashboard.addEmployee'),
      image: group,
      color: '#b1cdf9'
    },
    {
      id: 3,
      headline: t('Dashboard.routes'),
      addLabel: '',
      image: route,
      color: '#5bcfd0'
    },
    {
      id: 4,
      headline: t('Dashboard.professions'),
      addLabel: t('Dashboard.addProfession'),
      image: Professions,
      color: '#f191c2'
    },
    {
      id: 5,
      headline: t('Dashboard.gallery'),
      addLabel: t('Dashboard.addImage'),
      image: galleryImage,
      color: '#c5d1da'
    },
    {
      id: 6,
      headline: t('Dashboard.coaches'),
      addLabel: t('Dashboard.addCoach'),
      image: coachImage,
      color: '#3eacec'
    },
    {
      id: 7,
      headline: t('Dashboard.health'),
      addLabel: t('Dashboard.addHealth'),
      image: kashrut,
      color: '#57c47d'
    },
    {
      id: 8,
      headline: t('Dashboard.community'),
      addLabel: t('Dashboard.addCommunity'),
      image: communityImage,
      color: '#65befc'
    },
    {
      id: 9,
      headline: t('Dashboard.addRoute'),
      addLabel: '',
      image: route,
      color: '#57c8ca'
    },
    {
      id: 10,
      headline: t('Dashboard.editor'),
      addLabel: t('Dashboard.addEditor'),
      image: coachImage,
      color: '#57c8ca'
    },
  ];

  const jwt = sessionStorage.getItem('jwt');
  const jwtEditor = sessionStorage.getItem('jwt-EDITOR');
  const accessToken = sessionStorage.getItem('accessToken') ?? '';
  const role = jwt ? JSON.parse(jwt)?.role : null;
  const editorId = jwtEditor && jwtEditor !== "undefined" ? JSON.parse(jwtEditor)?.id : "ADMIN";
  const defaultdashboard = jwt ? JSON.parse(jwt)?.defaultdashboard : null;
  const SiteIDs = JSON.parse(jwt)?.sites?.filter((site) =>site.id !== null).map((site) => site.id) || [];
  const env = baseUrl+"/";
  const leftElements = [
    <div className='right' height="100%">
      {(role === "ADMIN" || role === "EDITOR") ? (
        <div className='cardsLine'>
          <CardDash cards={cards[6]} />
          <CardDash cards={cards[1]} />
        </div>
      ) : (<></>)}
      <div className='cardsLine'>
        <CardDash cards={cards[2]} />
        <CardDash cards={cards[8]} />
      </div>
      <div className='cardsLine'>
        <CardDash cards={cards[0]} />
        <CardDash cards={cards[5]} />
      </div>
      <div className='cardsLine'>
        {(role === "ADMIN" || role === "EDITOR") ? (
          <CardDash cards={cards[3]} />
        ) : (<></>)}
        <CardDash cards={cards[4]} />
      </div>
      {(role === "ADMIN" || role === "EDITOR") ? (
        <div className='cardsLine'>
          <CardDash cards={cards[7]} />
          {role === "ADMIN" ? (
            <CardDash cards={cards[9]} />
          ) : (<></>)}
        </div>
      ) : (<></>)}
    </div >

  ]

  const rightElements = [
    <div className='left'> {
      // <Charts />
      // <ScatterChartEditor 
      //   siteIds={SiteIDs} 
      //   env={env} 
      //   role={role} 
      //   sitesId={SiteIDs} 
      // />
      <iframe
        width="100%"
        height="100%"
        src={`https://dashboard-bxfxeygddffpgxdq.israelcentral-01.azurewebsites.net/?embed=true&role=${role}&data=${editorId}&Language=${currentLanguage}&GRAPH_SELECTED_DEFAULT=${defaultdashboard}&sites=${SiteIDs}&env=${env}&token=${accessToken}`}
        // src={`https://dashboardskillsservice.azurewebsites.net/?embed=true&role=${role}&data=${editorId}&Language=${currentLanguage}&GRAPH_SELECTED_DEFAULT=${defaultdashboard}&sites=${SiteIDs}&env=${env}&token=${accessToken}`}
        // src={`http://localhost:8501/?embed=true&role=${role}&data=${editorId}&Language=${currentLanguage}&GRAPH_SELECTED_DEFAULT=${defaultdashboard}&sites=${SiteIDs}&env=${baseUrl === "https://stg-web-app0da5905.azurewebsites.net" ? "stg" : "prod"}`}
      ></iframe>
    } </div>
  ]

  const elements = currentLanguage === "English" ? (
    [leftElements, rightElements]
  ) : (
    [rightElements, leftElements]
  );

  // const elements = [rightElements, leftElements];
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

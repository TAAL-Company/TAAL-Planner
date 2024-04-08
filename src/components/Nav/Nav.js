import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FcPlus, FcCalculator } from 'react-icons/fc';

import { RiHome4Line } from 'react-icons/ri';

import './style.css';
import { FaUser, FaAddressCard, FaRoute } from 'react-icons/fa';
import { useState } from 'react';
import { baseUrl } from '../../config';
import { getingData_coaches } from '../../api/api';

import Session from 'supertokens-web-js/recipe/session';

let flag_token = false;

const Nav = () => {
  const [, login_token] = useState('');
  const [complete_name, setcomplete_name] = useState('');
  // useEffect(() => {
  //   const url2 = `https://taal.tech/wp-json/wp/v2/users/me/`;
  //   fetch(url2, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       accept: 'application/json',
  //       Authorization: 'Bearer' + sessionStorage.jwt,
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then(function (user) {
  //       if (!flag_token) {
  //         login_token((flag_token = true));
  //         setcomplete_name(user.name);
  //       }
  //     });
  // });

  useEffect(() => {
    fetch(baseUrl + '/auth/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then(async function (user) {
        if (!flag_token) {
          login_token((flag_token = true));
          const coachesData = await getingData_coaches();
          const coachWithEmail = coachesData.find(coach => coach.email === user.user.email);
          if(coachWithEmail==null||coachWithEmail==undefined){
            logout();
          }
          console.log('Coach with email:', coachWithEmail);
          setcomplete_name(coachWithEmail.name);
        }
      });
  });
async function logout () {
    await Session.signOut(); 
    window.location.href = "/auth"; // or to wherever your logic page is
  }
  return (
    <div className='nav'>
      <ul className='nav-links'>
        {/* <Link to="/Calculator" className="link">
          <li>
            <FcCalculator style={{ fontSize: "24px" }} />
            &nbsp;&nbsp; פעולות נוספות
          </li>
        </Link>
        <Link to="/student" className="link">
          <li>
            <FaAddressCard style={{ fontSize: "24px" }} />
            &nbsp;&nbsp;עובדים{" "}
          </li>
        </Link>
        <Link to="/routes_cards" className="link">
          <li>
            <FaRoute style={{ fontSize: "24px" }} />
            &nbsp;&nbsp;מסלולים{" "}
          </li>
        </Link>
        <Link to="/planner" className="link">
          <li>
            <FcPlus style={{ fontSize: "24px" }} /> &nbsp;&nbsp;הוסף מסלול{" "}
          </li>
        </Link> */}
        <Link to='/Dashboard'>
          <div className='home'></div>
        </Link>
        <Link to="/Forms">
          <div className="forms"></div>
        </Link>
      </ul>
      <div className='userName'>{complete_name}</div>
      <div className='myUser'></div>
    </div>
  );
};
export default Nav;
//----------------------------------------

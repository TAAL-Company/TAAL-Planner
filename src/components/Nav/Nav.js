import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FcPlus, FcCalculator } from 'react-icons/fc';

import { RiHome4Line } from 'react-icons/ri';

import './style.css';
import { FaUser, FaAddressCard, FaRoute } from 'react-icons/fa';
import { useState } from 'react';
import { baseUrl } from '../../config';
import TranslateIcon from '@mui/icons-material/Translate';

let flag_token = false;

const Nav = () => {
  const [, login_token] = useState('');
  const [complete_name, setcomplete_name] = useState('');

  const logout = () => {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt-EDITOR');
    sessionStorage.removeItem('logged_in');
    sessionStorage.removeItem('userName');

    localStorage.removeItem('MySite');
    localStorage.removeItem('New_Routes');
    localStorage.removeItem('myLastStation');


    window.location.replace('/');
  }
  useEffect(() => {
    // const url2 = `https://taal.tech/wp-json/wp/v2/users/me/`;
    // fetch(url2, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     accept: 'application/json',
    //     Authorization: 'Bearer' + sessionStorage.jwt,
    //   },
    // })
    //   .then((response) => response.json())
    //   .then(function (user) {
    //     if (!flag_token) {
    //       login_token((flag_token = true));
    //       setcomplete_name(user.name);
    //     }
    //   });
    setcomplete_name(JSON.parse(sessionStorage.getItem('jwt')).name);
  });
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
        <div className="languageicon" onClick={() => {
          const currentLanguage = sessionStorage.getItem('language');
          const newLanguage = currentLanguage === 'English' ? 'Hebrew' : 'English';
          sessionStorage.setItem('language', newLanguage);
          window.location.reload();
        }}></div>
        <Link to="/">
          <div onClick={logout} className="logout"></div>
        </Link>
      </ul>
      <div className='userName'>{complete_name}</div>
      <div className='myUser'></div>
    </div>
  );
};
export default Nav;
//----------------------------------------

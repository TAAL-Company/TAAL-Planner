import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import { baseUrl } from '../../config';
import {
  getingData_coaches,
  getingData_Users
} from '../../api/api';
import posthog from 'posthog-js';
import { useNotification } from "../Notification/NotificationProvider";

//---------------------
let flag_token = false;
let flag = false;
// let myStatus = 0;
//---------------------

function LoginAPI(props) {
  const [, login_token] = useState('');
  const [, setFlag] = useState(false);
  const { showNotification } = useNotification();

  async function handleLogin(response) {
    if (response.status === 403) {
      showNotification('error', 'Wrong username/mail or wrong Password');
    } else if (response.status === 404) {
      showNotification('error', 'user not found you need to register first');
    } else  if (response.status === 201)  {
      try {
        const user = await response.json();
        if (user !== undefined) {
          login_token(true);
        }
        setFlag(true);
        sessionStorage.setItem('jwt', JSON.stringify(user));
        
        if (user.role == "ADMIN") {
          const coaches = await getingData_coaches();
          const coache = coaches.filter((coache) => coache.id == user.userid);
          sessionStorage.setItem('jwt-EDITOR', JSON.stringify(coache[0]));
        } else if (user.role == "EDITOR") {
          const coaches = await getingData_coaches();
          const coache = coaches.filter((coache) => coache.id == user.userid);
          sessionStorage.setItem('jwt-EDITOR', JSON.stringify(coache[0]));
        } else if (user.role == "STUDENT") {
          const users = await getingData_Users()
          const userX = users.filter((userX) => userX.id == user.userid);
          sessionStorage.setItem('jwt-EDITOR', JSON.stringify(userX[0]));
        }

        sessionStorage.setItem('logged_in', 1);
        sessionStorage.setItem('userName', props.APIDetailsLogin.user);

        posthog.identify(user.name);
        posthog.capture('$set', { $$set: [process.env.REACT_APP_VERSION] });
        window.location.replace('/Planner');
      } catch (error) {
        console.error("Error during login:", error);
      }
    }
  }

  if (props.submit && props.APIDetailsLogin.user.length > 0) {
    props.setSubmit(false);
    fetch(baseUrl + "/editor/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        name: props.APIDetailsLogin.user,
        password: props.APIDetailsLogin.pass,
      }),
    }).then(handleLogin);
  }

  return (
    <>
      {props.getFlagLoading && flag ? (
        <>
          <h1 style={{ textAlign: 'center', color: 'white' }}>Loading</h1>
          <ReactLoading
            type={'bars'}
            className='loading'
            color={'rgb(180, 175, 199)'}
            height={'10%'}
            width={'10%'}
          />
        </>
      ) : null}
    </>
  );
}
export default LoginAPI;

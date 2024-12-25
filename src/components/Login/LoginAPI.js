import React, { useState } from 'react';
import ReactLoading from 'react-loading';
import { baseUrl } from '../../config';
import {
  getingData_coaches,
  getingData_Users
} from '../../api/api';
import posthog from 'posthog-js';
//---------------------
let flag_token = false;
let flag = false;
// let myStatus = 0;
//---------------------

function LoginAPI(props) {
  const [, login_token] = useState('');
  const [, setFlag] = useState(false);
  // if (props.APIDetailsLogin.user.length > 0) {
  //   const url = `https://taal.tech/wp-json/jwt-auth/v1/token/`;
  //   fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       accept: 'application/json',
  //     },
  //     body: JSON.stringify({
  //       username: props.APIDetailsLogin.user,
  //       password: props.APIDetailsLogin.pass,
  //     }),
  //   })
  //     .then((response) =>
  //       response.status === 403
  //         ? alert('Wrong username/mail or wrong Password')
  //         : response.json()
  //     )

  //     .then(function (user) {
  //       if (!flag_token) {
  //         if (user.message !== undefined) {
  //           if (user.message.includes('2FA')) {
  //             alert(
  //               '2FA is activated, No support for this feature, Please login with another user'
  //             );
  //             login_token((flag_token = true));
  //           }
  //         }
  //         setFlag((flag = true));
  //         sessionStorage.setItem('jwt', user.token);
  //         sessionStorage.setItem('logged_in', 1);
  //         sessionStorage.setItem('userName', props.APIDetailsLogin.user);

  //         window.location.replace('/Planner');
  //       }
  //     });
  // }

  if (props.APIDetailsLogin.user.length > 0) {
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
    })
      .then((response) =>
        response.status === 403
          ? alert('Wrong username/mail or wrong Password')
          : response.json()
      )

      .then(async (user)=> {
        console.log(user);
        if (user !== undefined) {
          login_token((flag_token = true));
        }
        setFlag((flag = true));
        // sessionStorage.setItem('jwt', user.token);
        sessionStorage.setItem('jwt', JSON.stringify(user));
        if (user.role == "ADMIN") {
          const coaches = await getingData_coaches();
          const coache = coaches.filter((coache)=>coache.id == user.userid)
          sessionStorage.setItem('jwt-EDITOR', JSON.stringify(coache[0]));
        }else if(user.role == "EDITOR"){
          const coaches = await getingData_coaches();
          const coache = coaches.filter((coache)=>coache.id == user.userid)
          sessionStorage.setItem('jwt-EDITOR', JSON.stringify(coache[0]));
        }else if(user.role == "STUDENT"){
          const users = await getingData_Users()
          const userX = users.filter((userX)=>userX.id == user.userid)
          sessionStorage.setItem('jwt-EDITOR', JSON.stringify(userX[0]));
        }
        sessionStorage.setItem('logged_in', 1);
        sessionStorage.setItem('userName', props.APIDetailsLogin.user);

        posthog.identify(user.name)
        posthog.capture(
          '$set', 
          { 
              $$set: [process.env.REACT_APP_VERSION],
          }
      )
        window.location.replace('/Planner');
      });
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

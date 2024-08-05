import React, { useState } from 'react';
import LoginAPI from './LoginAPI';
import logo from '../../Pictures/loginLogoTaal.svg';
import userLogo from '../../Pictures/user-logo.png';
import lockLogo from '../../Pictures/lock-logo.png';
import './styleLogin.css';

import Checkbox from '@mui/material/Checkbox';

let flagLoading = false;

function Login(props) {
  const [, setFlagLoading] = useState(false);
  const [APIDetailsLogin, setAPIDetailsLogin] = useState({
    user: '',
    pass: '',
  });
  const [loginDetails, setLoginDetails] = useState({
    user: '',
    pass: '',
  });

  const [checked, setChecked] = useState({
    Hebrew: true,
    English: false,
    Arabic: false,
  });

  const [passwordLanguage, setpasswordLanguage] = useState('סיסמה');
  const [usernameLanguage, setUsernameLanguage] = useState('שם משתמש');
  const [language, setLanguage] = useState('Hebrew');

  const handlecheckedChange = (event) => {
    
    const checkedLanguage = event.target.name;

    sessionStorage.setItem('language', checkedLanguage);

    setChecked({
      Hebrew: checkedLanguage === 'Hebrew',
      English: checkedLanguage === 'English',
      Arabic: checkedLanguage === 'Arabic',
    });

    if (checkedLanguage === 'Hebrew') {
      hebrew();
    } else if (checkedLanguage === 'English') {
      english();
    } else if (checkedLanguage === 'Arabic') {
      arabic();
    }
  };

  const { English, Arabic, Hebrew } = checked;

  function handleChange(e) {
    const { name, value } = e.target;
    setLoginDetails((prev) => {
      return { ...prev, [name]: value };
    });
  }

  function handleSubmit() {
    setAPIDetailsLogin({ ...loginDetails });
    setFlagLoading((flagLoading = true));
  }

  const hebrew = () => {
    setLanguage('hebrew');
    setpasswordLanguage('סיסמה');
    setUsernameLanguage('שם משתמש');
  };
  const english = () => { 
    setLanguage('english');
    setpasswordLanguage('Password');
    setUsernameLanguage('Username');
  }

  const arabic = () => {
    setLanguage('arabic');
    setpasswordLanguage('كلمة المرور');
    setUsernameLanguage('اسم المستخدم');
  };

  return (
    <>
      {sessionStorage.logged_in ? (
        <h1>
          You are not supposed to be here ! Please close the tab and log in
          again
        </h1>
      ) : (
        <>
          <div className='App-header'>
            <div className='box'>
              <div className='logoHeader'>
                <img src={logo} className='App-logo' alt='logo'></img>
              </div>
              {/* <p>{props.serverMessage}</p> */}
              <div
                className='d-flex justify-content-around'
                onKeyPress={(e) => {
                  e.key === 'Enter' && handleSubmit();
                }}
              >
                <div className='d-flex flex-column'>
                  {/* <div className="p-2">
                    <h2
                      className="Login_Title"
                      style={{ paddingTop: "7vh", marginLeft: "0.5rem" }}
                    >
                      Login
                    </h2>
                  </div> */}
                  <div className='p-2'>
                    <div className='login'>
                      
                      <div className='input-container'>
                        {language === 'english' ? (
                          <div className={`img-container ${language === 'english' ? 'english' : ''}`}>
                          <img
                            src={userLogo}
                            className='user-logo'
                            alt='logo'
                          ></img>
                        </div>
                        ):(<div></div>)}
                        <input
                          className={`inputLogin ${language === 'english' ? 'english' : ''}`}
                          type='text'
                          placeholder={usernameLanguage}
                          name='user'
                          value={loginDetails.user}
                          onChange={handleChange}
                        />
                        {language !== 'english' ? (
                          <div className={`img-container ${language === 'english' ? 'english' : ''}`}>
                          <img
                            src={userLogo}
                            className='user-logo'
                            alt='logo'
                          ></img>
                        </div>
                        ):(<div></div>)}
                      </div>
                      <div className={`input-container ${language === 'english' ? 'english' : ''}`}>
                      {language === 'english' ? (
                          <div className={`img-container ${language === 'english' ? 'english' : ''}`}>
                          <img
                            src={lockLogo}
                            className='user-logo'
                            alt='logo'
                          ></img>
                        </div>
                        ):(<div></div>)}
                        <input
                          className={`inputLogin ${language === 'english' ? 'english' : ''}`}
                          type='password'
                          placeholder={passwordLanguage}
                          name='pass'
                          value={loginDetails.pass}
                          onChange={handleChange}
                        />
                        {language !== 'english' ? (
                          <div className={`img-container ${language === 'english' ? 'english' : ''}`}>
                          <img
                            src={lockLogo}
                            className='user-logo'
                            alt='logo'
                          ></img>
                        </div>
                        ):(<div></div>)}
                      </div>

                      <div className='input-container'>
                        <Checkbox
                          checked={Hebrew}
                          name='Hebrew'
                          onClick={(event) => {
                            handlecheckedChange(event)
                          }}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                        Hebrew
                        <Checkbox
                          checked={English}
                          name='English'
                          onClick={(event) => {
                            handlecheckedChange(event)
                          }}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                        English
                      </div>

                      <div className='d-flex justify-content-center'>
                        <input
                          type='submit'
                          onClick={handleSubmit}
                          value={ language === 'english' ? 'Login' : 'התחברות'}
                        />
                      </div>
                      <div className='forgetPassword'>{language === 'english' ? '?Forget Password' : 'שכחת סיסמה?'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <LoginAPI
            APIDetailsLogin={APIDetailsLogin}
            setUsername={props.setUsername}
            setIsLoggedIn={props.setIsLoggedIn}
            setServerMessage={props.setServerMessage}
            getFlagLoading={flagLoading}
          />
        </>
      )}
    </>
  );
}
export default Login;

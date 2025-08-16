// Login.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
} from '@mui/material';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { styled } from '@mui/material/styles';
import logo from '../../Pictures/loginLogoTaal.svg';
import userLogo from '../../Pictures/user-logo.png';
import lockLogo from '../../Pictures/lock-logo.png';
import LoginAPI from './LoginAPI';
import { useNotification } from '../../components/Notification/NotificationProvider';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#0d4264',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const LoginContainer = styled(Paper)(({ theme }) => ({
  width: '670px',
  maxWidth: '90%',
  padding: theme.spacing(4),
  borderRadius: '8px',
  boxShadow: '0px 5px 20px #00000080',
}));

const Logo = styled('img')({
  width: '320px',
  height: '100px',
  display: 'block',
  margin: '0 auto',
});

const IconWrapper = styled(Box)(({ language }) => ({
  backgroundColor: '#0d4264',
  width: '56px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: language === 'English' ? '5px 0 0 5px' : '0 5px 5px 0',
}));

const InputWrapper = styled(Box)(({ language }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '1rem',
  flexDirection: language === 'English' ? 'row' : 'row-reverse',
}));

const SubmitButton = styled(Button)({
  backgroundColor: '#0d4264',
  // color: 'white',
  fontWeight: 600,
  fontSize: '1.2rem',
  height: '56px',
  marginTop: '1rem',
  '&:hover': {
    boxShadow: '2px 5px 20px #0d4364',
  },
});

const ForgetPassword = styled(Typography)(({ language }) => ({
  textAlign: 'center',
  color: '#0d4364d0',
  direction: language === 'English' ? 'ltr' : 'rtl',
  fontSize: '18px',
  marginTop: '0.5rem',
}));

function Login(props) {
  const [loginDetails, setLoginDetails] = useState({ user: '', pass: '' });
  const [language, setLanguage] = useState('Hebrew');
  const [showPassword, setShowPassword] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [apiDetailsLogin, setApiDetailsLogin] = useState({ user: '', pass: '' });

  const { showNotification } = useNotification();

  const languages = {
    Hebrew: { username: 'שם משתמש', password: 'סיסמה', dir: 'rtl', login: 'התחברות', forget: 'שכחת סיסמה?' },
    English: { username: 'Username', password: 'Password', dir: 'ltr', login: 'Login', forget: 'Forget Password?' },
  };

  const [checked, setChecked] = useState({
    Hebrew: true,
    English: false,
  });

  useEffect(() => {
    sessionStorage.setItem('language', 'Hebrew');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!loginDetails.user || !loginDetails.pass) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }
    setSubmit(true);
    setApiDetailsLogin({ ...loginDetails });
    setFlagLoading(true);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.name;
    setChecked({
      Hebrew: lang === 'Hebrew',
      English: lang === 'English',
    });
    setLanguage(lang);
    sessionStorage.setItem('language', lang);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const lang = languages[language];
  const isEnglish = language === 'English';

  return (
    <StyledBox>
      {sessionStorage.logged_in ? (
        <Typography variant="h4" color="white" align="center">
          You are not supposed to be here! Please close the tab and log in again.
        </Typography>
      ) : (
        <LoginContainer>
          <Box mb={3}>
            <Logo src={logo} alt="Logo" />
          </Box>

          <InputWrapper language={language}>
            <IconWrapper language={language}>
              <img src={userLogo} alt="User" width={24} height={24} />
            </IconWrapper>
            <TextField
              fullWidth
              variant="filled"
              placeholder={lang.username}
              name="user"
              value={loginDetails.user}
              onChange={handleChange}
              inputProps={{ dir: lang.dir }}
              sx={{ backgroundColor: '#efefef', borderRadius: 0 }}
              required
            />
          </InputWrapper>

          <InputWrapper language={language}>
            <IconWrapper language={language}>
              <img src={lockLogo} alt="Lock" width={24} height={24} />
            </IconWrapper>
            <TextField
              fullWidth
              variant="filled"
              placeholder={lang.password}
              name="pass"
              type={showPassword ? 'text' : 'password'}
              value={loginDetails.pass}
              onChange={handleChange}
              inputProps={{ dir: lang.dir }}
              sx={{ backgroundColor: '#efefef', borderRadius: 0 }}
              required
            />
            <Box
              onClick={togglePasswordVisibility}
              sx={{
                backgroundColor: '#0d4264',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                borderRadius: isEnglish ? '0 5px 5px 0' : '5px 0 0 5px',
                
              }}
            >
              {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </Box>
          </InputWrapper>

          <Box display="flex" gap={2} justifyContent="center" mt={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked.Hebrew}
                  onClick={handleLanguageChange}
                  name="Hebrew"
                />
              }
              label="Hebrew"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked.English}
                  onClick={handleLanguageChange}
                  name="English"
                />
              }
              label="English"
            />
          </Box>

          <Box display="flex" justifyContent="center">
            <SubmitButton fullWidth onClick={handleSubmit}>
              {lang.login}
            </SubmitButton>
          </Box>

          <ForgetPassword language={language}>{lang.forget}</ForgetPassword>

          <LoginAPI
            APIDetailsLogin={apiDetailsLogin}
            setUsername={props.setUsername}
            setIsLoggedIn={props.setIsLoggedIn}
            setServerMessage={props.setServerMessage}
            getFlagLoading={flagLoading}
            setSubmit={setSubmit}
            submit={submit}
          />
        </LoginContainer>
      )}
    </StyledBox>
  );
}

export default Login;

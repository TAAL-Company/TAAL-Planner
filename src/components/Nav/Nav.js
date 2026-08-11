import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TranslateIcon from '@mui/icons-material/Translate';
import HomeIcon from '@mui/icons-material/Home';
import FeedIcon from '@mui/icons-material/Feed';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Nav = () => {
  const [completeName, setCompleteName] = useState('');
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);

  useEffect(() => {
    try {
      const jwtData = sessionStorage.getItem('jwt');
      if (jwtData) {
        const parsed = JSON.parse(jwtData);
        if (parsed?.name) {
          setCompleteName(parsed.name);
        }
      }
    } catch (err) {
      console.error('Invalid JWT in sessionStorage:', err);
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt-EDITOR');
    sessionStorage.removeItem('logged_in');
    sessionStorage.removeItem('userName');

    localStorage.removeItem('MySite');
    localStorage.removeItem('New_Routes');
    localStorage.removeItem('myLastStation');

    window.location.replace('/');
  };


  const openLanguageMenu = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const closeLanguageMenu = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageSelect = (language) => {
    sessionStorage.setItem('language', language);
    closeLanguageMenu();
    window.location.reload();
  };

  return (
    <Box
      component="nav"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        backgroundColor: '#0d4264',
        color: 'white',
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Link to="/Dashboard">
          <IconButton
            sx={{
              width: 51,
              height: 45,
              // backgroundImage: "url('../../Pictures/ic_home.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 0,
              color: 'white',
            }}
          >
            <HomeIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Link>
        <Link to="/Forms">
          <IconButton
            sx={{
              width: 51,
              height: 45,
              // backgroundImage: "url('../../Pictures/ic_forms.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 0,
              color: 'white',
            }}
          >
            <FeedIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Link>

        <Link to="/TAAL_Ai">
          <IconButton
            sx={{
              width: 51,
              height: 45,
              backgroundImage: "url('../../Pictures/logo_Taal_Ai.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 1,
            }}
          />
        </Link>

        <Link to="/shifts">
          <IconButton
            sx={{
              width: 51,
              height: 45,
              borderRadius: 0,
              color: 'white',
            }}
            title="Shift Manager"
          >
            <CalendarMonthIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Link>
        <Link to="/notifications">
          <IconButton
            sx={{
              width: 51,
              height: 45,
              borderRadius: 0,
              color: 'white',
            }}
          >
            <NotificationsIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Link>

        <IconButton
          aria-controls={Boolean(languageAnchorEl) ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={Boolean(languageAnchorEl) ? 'true' : undefined}
          onClick={openLanguageMenu}
          sx={{
            width: 51,
            height: 45,
            // backgroundImage: "url('../../Pictures/language.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 0,
            color: 'white',
          }}
        >
          <TranslateIcon sx={{ fontSize: 40 }} />
        </IconButton >

        <Menu
          id="language-menu"
          anchorEl={languageAnchorEl}
          open={Boolean(languageAnchorEl)}
          onClose={closeLanguageMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {['English', 'Hebrew', 'Arabic', 'Russian'].map((language) => (
            <MenuItem
              key={language}
              onClick={() => handleLanguageSelect(language)}
              selected={sessionStorage.getItem('language') === language}
            >
              {language}
            </MenuItem>
          ))}
        </Menu>
        <IconButton
          onClick={logout}
          sx={{
            width: 51,
            height: 45,
            // backgroundImage: "url('../../Pictures/logout-svgrepo-com.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 0,
            color: 'white',
          }}
        >
          <LogoutIcon sx={{ fontSize: 40 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ whiteSpace: 'nowrap', fontSize: '16px' }}>
          {completeName}
        </Typography>
        <Box
          sx={{
            width: 50,
            height: 106,
            backgroundImage: "url('../../Pictures/logo_Taal.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 0,
          }}
        />
      </Box>
    </Box>
  );
};

export default Nav;

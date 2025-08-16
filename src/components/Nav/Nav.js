import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

const Nav = () => {
  const [completeName, setCompleteName] = useState('');

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
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt-EDITOR');
    sessionStorage.removeItem('logged_in');
    sessionStorage.removeItem('userName');

    localStorage.removeItem('MySite');
    localStorage.removeItem('New_Routes');
    localStorage.removeItem('myLastStation');

    window.location.replace('/');
  };

  const toggleLanguage = () => {
    const currentLanguage = sessionStorage.getItem('language');
    const newLanguage = currentLanguage === 'English' ? 'Hebrew' : 'English';
    sessionStorage.setItem('language', newLanguage);
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
              backgroundImage: "url('../../Pictures/ic_home.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 0,
            }}
          />
        </Link>
        <Link to="/Forms">
          <IconButton
            sx={{
              width: 51,
              height: 45,
              backgroundImage: "url('../../Pictures/ic_forms.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 0,
            }}
          />
        </Link>
        <IconButton
          onClick={toggleLanguage}
          sx={{
            width: 51,
            height: 45,
            backgroundImage: "url('../../Pictures/language.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 0,
          }}
        />
        <IconButton
          onClick={logout}
          sx={{
            width: 51,
            height: 45,
            backgroundImage: "url('../../Pictures/logout-svgrepo-com.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 0,
          }}
        />
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

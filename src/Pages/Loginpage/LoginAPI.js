// LoginAPI.jsx
import React, { useEffect } from 'react';
import { baseUrl } from '../../config';
import {
  getingData_coaches,
  getingData_Users,
} from '../../api/api';
import posthog from 'posthog-js';
import { useNotification } from '../../components/Notification/NotificationProvider';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoginAPI({
  APIDetailsLogin,
  setUsername,
  setIsLoggedIn,
  setServerMessage,
  getFlagLoading,
  setSubmit,
  submit,
}) {
  const { showNotification } = useNotification();

  useEffect(() => {
    const handleLogin = async (response) => {
      if (response.status === 403) {
        showNotification('error', 'Wrong username/mail or wrong password');
      } else if (response.status === 404) {
        showNotification('error', 'User not found — you need to register first');
      } else if (response.status === 201) {
        try {
          const { token, user } = await response.json();

          // Store the JWT access token so the axios interceptor can attach it
          sessionStorage.setItem('accessToken', token);
          // Keep 'jwt' key as the editor user object for backward compatibility
          sessionStorage.setItem('jwt', JSON.stringify(user));

          if (user.role === 'ADMIN' || user.role === 'EDITOR') {
            const coaches = await getingData_coaches();
            const coach = coaches.find((c) => c.id === user.userid);
            sessionStorage.setItem('jwt-EDITOR', JSON.stringify(coach));
          } else if (user.role === 'STUDENT') {
            const users = await getingData_Users();
            const student = users.find((u) => u.id === user.userid);
            sessionStorage.setItem('jwt-EDITOR', JSON.stringify(student));
          }

          sessionStorage.setItem('logged_in', 1);
          sessionStorage.setItem('userName', APIDetailsLogin.user);

          posthog.identify(user.name);
          posthog.capture('$set', { $$set: [process.env.REACT_APP_VERSION] });

          window.location.replace('/planner');
        } catch (err) {
          console.error('Error parsing user data', err);
          showNotification('error', 'Login failed. Please try again.');
        }
      }
    };

    if (submit && APIDetailsLogin.user.length > 0) {
      setSubmit(false);
      fetch(`${baseUrl}/editor/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          name: APIDetailsLogin.user,
          password: APIDetailsLogin.pass,
        }),
      }).then(handleLogin).catch((err) => {
        console.error('Login error:', err);
        showNotification('error', 'Server error. Please try again later.');
      });
    }
  }, [submit, APIDetailsLogin, setSubmit, showNotification]);

  if (getFlagLoading) {
    return (
      <Box mt={3} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6" color="white" gutterBottom>
          Loading...
        </Typography>
        <CircularProgress size={50} style={{ color: '#0d4264' }} />
      </Box>
    );
  }

  return null;
}

export default LoginAPI;

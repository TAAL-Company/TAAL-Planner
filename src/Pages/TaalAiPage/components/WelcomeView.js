import React from 'react';
import { Box, Typography, Icon } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InputContainer from './InputContainer';

/**
 * Shown when the chat has not started yet.
 * Renders the centred logo + title + input box.
 */
export default function WelcomeView({ direction, isRTL, theme, inputContainerProps }) {
  const { t } = useTranslation();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      width: '100%',
      maxWidth: '800px',
    }}>
      {/* Logo + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, direction }}>
        <Icon
          sx={{
            width: 100,
            height: 106,
            backgroundImage: "url('../../Pictures/logo_Taal_Ai.svg')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: 1,
            transform: isRTL ? 'none' : 'scaleX(-1)',
            filter: theme.mode === 'light' ? 'invert(1)' : 'none',
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h5">{t('TextGenerative.title')}</Typography>
          <Typography variant="body2" sx={{ color: theme.textMuted }}>
            {t('TextGenerative.subtitle')}
          </Typography>
        </Box>
      </Box>

      {/* Input */}
      <InputContainer {...inputContainerProps} />
    </Box>
  );
}

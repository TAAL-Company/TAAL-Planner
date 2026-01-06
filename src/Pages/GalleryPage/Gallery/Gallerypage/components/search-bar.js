import React from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ onSearch }) => {
  const { t } = useTranslation();
  return (
    <TextField
      fullWidth
      placeholder="Search"
      variant="outlined"
      onChange={(e) => onSearch(e.target.value)}
      sx={{ mb: 3 }}
      inputProps={{ style: { direction: t('Direction') } }}
    />
  );
};

export default SearchBar;
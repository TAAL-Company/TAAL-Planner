import React from 'react';
import { TextField } from '@mui/material';

const SearchBar = ({ onSearch }) => {
  return (
    <TextField
      fullWidth
      placeholder="Search"
      variant="outlined"
      onChange={(e) => onSearch(e.target.value)}
      sx={{ mb: 3 }}
      inputProps={{ style: { direction: 'ltr' } }}
    />
  );
};

export default SearchBar;
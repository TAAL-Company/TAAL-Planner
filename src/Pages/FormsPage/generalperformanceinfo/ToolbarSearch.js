import React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { GridToolbarQuickFilter } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const ToolbarSearch = ({ language }) => {
  const { t } = useTranslation();

  return (
    <div>
      <InputAdornment position="start">
        <GridToolbarQuickFilter
          InputProps={{ disableUnderline: true }}
          placeholder={t('FormsPage.toolbarSearchPlaceholder')}
          style={{
            paddingRight: '10px',
            width: '250px',
            position: 'relative',
            borderRadius: '8px',
            paddingBottom: '2px',
            marginTop: '2px',
            background: 'white',
          }}
          sx={{
            '& .MuiInputBase-root': {
              width: '87%',
              height: '28px',
            },
          }}
        />
        <SearchIcon
          style={{
            marginRight: '-30px',
            zIndex: 5,
          }}
        />
      </InputAdornment>
    </div>
  );
};

export default ToolbarSearch;
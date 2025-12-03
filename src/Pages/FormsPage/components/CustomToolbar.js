import React, { useState, useEffect } from 'react';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { Box, Autocomplete, TextField, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getTranslation } from '../i18n';

const CustomToolbar = ({
  isInfoUserRoute = false,
  isInfoUserSite = false,
  tableType,
  worker,
  setWorker,
  allUsers = [],
  allRoutes = [],
  allSites = [],
  handleChangeUserFlags,
  handleChangeRouteFlags,
  handleChangeUser,
  handleChangeRoute,
  SaveProfileChanges,
  routeForTasksAbility,
  setRouteForTasksAbility,
  routeName,
  language = 'he',
}) => {
  const t = (key) => getTranslation(key, language);

  const USER_COLOR = '#1e88e5';
  const ROUTE_COLOR = '#fb8c00';
  const SITE_COLOR = '#43a047';

  const indicatorStyle = (isActive, color) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: isActive ? color : '#e0e0e0',
    display: 'inline-block',
    marginRight: 8,
  });

  const handleUserChange = (event, value) => {
    if (handleChangeUserFlags) {
      handleChangeUserFlags(event, value);
    } else if (handleChangeUser) {
      handleChangeUser(event, value);
    } else if (setWorker) {
      setWorker(value);
    }
  };

  const handleRouteChange = (event, value) => {
    if (handleChangeRouteFlags) {
      handleChangeRouteFlags(event, value);
    } else if (handleChangeRoute) {
      handleChangeRoute(event, value);
    } else if (setRouteForTasksAbility) {
      setRouteForTasksAbility(value);
    }
  };

  return (
    <GridToolbarContainer sx={{ padding: '10px', gap: 1 }}>
      {/* User Selection */}
      {(isInfoUserRoute || isInfoUserSite) && allUsers.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <span style={indicatorStyle(worker && worker.id, USER_COLOR)} />
          <Autocomplete
            size='small'
            options={allUsers}
            getOptionLabel={(option) => option.name || ''}
            value={worker}
            onChange={handleUserChange}
            renderInput={(params) => (
              <TextField {...params} label={t('selectUser')} variant='outlined' />
            )}
            sx={{ minWidth: 200 }}
          />
        </Box>
      )}

      {/* Route Selection */}
      {isInfoUserRoute && allRoutes.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <span style={indicatorStyle(routeForTasksAbility?.id || routeName, ROUTE_COLOR)} />
          <Autocomplete
            size='small'
            options={allRoutes}
            getOptionLabel={(option) => option.name || ''}
            value={routeForTasksAbility || null}
            onChange={handleRouteChange}
            renderInput={(params) => (
              <TextField {...params} label={t('selectRoute')} variant='outlined' />
            )}
            sx={{ minWidth: 200 }}
          />
        </Box>
      )}

      {/* Site Selection */}
      {isInfoUserSite && allSites && allSites.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <span style={indicatorStyle(false, SITE_COLOR)} />
          <Autocomplete
            size='small'
            options={allSites}
            getOptionLabel={(option) => option.name || ''}
            renderInput={(params) => (
              <TextField {...params} label={t('site')} variant='outlined' />
            )}
            sx={{ minWidth: 200 }}
          />
        </Box>
      )}

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Standard Toolbar Buttons */}
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarQuickFilter />
      <GridToolbarExport />

      {/* Save Button for specific table types */}
      {(tableType === 'TaskPerformance' || 
        tableType === 'CognitiveProfileHE' || 
        tableType === 'TaskabilityHE') && 
        SaveProfileChanges && (
        <Button
          size='small'
          startIcon={<SaveIcon />}
          onClick={SaveProfileChanges}
          variant='contained'
          color='primary'
        >
          {t('save')}
        </Button>
      )}
    </GridToolbarContainer>
  );
};

export default CustomToolbar;

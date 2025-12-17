import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

const ROUTE_COLOR = '#fb8c00';

const indicatorStyle = (isActive, color) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  marginInlineEnd: 8,
  marginInlineStart: 8,
  backgroundColor: isActive ? color : '#d0d0d0',
});

const renderRouteOption = (props, option) => {
  const { key, ...restProps } = props;
  return (
    <li
      key={option.id ?? key}
      {...restProps}
      className="workerName-autoComplete"
      style={{
        display: 'flex',
        alignItems: 'center',
        color: option.hasTaskCognitiveRequirements ? ROUTE_COLOR : '#333',
      }}
    >
      <span
        style={indicatorStyle(option.hasTaskCognitiveRequirements, ROUTE_COLOR)}
      />
      <span>{option.name}</span>
    </li>
  );
};

const SITE_COLOR = '#1976d2';

const renderSiteOption = (props, option) => {
  const { key, ...restProps } = props;
  return (
    <li
      key={option.id ?? key}
      {...restProps}
      className="workerName-autoComplete"
      style={{
        display: 'flex',
        alignItems: 'center',
        color: '#333',
      }}
    >
      <span>{option.name}</span>
    </li>
  );
};

const TaskAbilityToolbar = ({
  language,
  allRoutes,
  routeForTasksAbility,
  handleChangeRoute,
  sites,
  selectedSite,
  handleChangeSite,
}) => {
  const { t } = useTranslation();

  return (
    <div className="infoForms">
      <div className="workerRouteForms">
        {t('FormsPage.toolbarSiteLabel')}
        <Autocomplete
          freeSolo
          style={{ width: 200, marginInlineEnd: 16 }}
          value={selectedSite}
          onChange={handleChangeSite}
          options={sites || []}
          getOptionLabel={(option) => option.name || ''}
          renderOption={renderSiteOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={selectedSite?.name || t('FormsPage.selectSite')}
              InputProps={{
                ...params.InputProps,
                type: 'search',
                style: {
                  ...(params.InputProps?.style || {}),
                  color: selectedSite ? SITE_COLOR : undefined,
                },
              }}
            />
          )}
        />
      </div>
      <div className="workerRouteForms">
        {t('FormsPage.toolbarRouteLabel')}
        <Autocomplete
          freeSolo
          style={{ width: 250 }}
          value={routeForTasksAbility?.id ? routeForTasksAbility : null}
          onChange={handleChangeRoute}
          disableClearable
          options={allRoutes || []}
          getOptionLabel={(option) => option.name || ''}
          renderOption={renderRouteOption}
          noOptionsText={selectedSite ? t('FormsPage.toolbarNoRoutesForSite') : t('FormsPage.selectRoute')}
          renderInput={(params) => (
            <TextField
              {...params}
              label={routeForTasksAbility?.name || t('FormsPage.selectRoute')}
              InputProps={{
                ...params.InputProps,
                type: 'search',
                style: {
                  ...(params.InputProps?.style || {}),
                  color: routeForTasksAbility?.hasTaskCognitiveRequirements
                    ? ROUTE_COLOR
                    : undefined,
                },
              }}
            />
          )}
        />
      </div>
    </div>
  );
};

export default TaskAbilityToolbar;
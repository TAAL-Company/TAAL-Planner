import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

const USER_COLOR = '#1e88e5';
const ROUTE_COLOR = '#fb8c00';

const indicatorStyle = (isActive, color) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  marginInlineEnd: 8,
  marginInlineStart: 8,
  backgroundColor: isActive ? color : '#d0d0d0',
});

const renderUserOption = (props, option) => {
  const { key, ...restProps } = props;
  return (
    <li
      key={option.id || key}
      {...restProps}
      className="workerName-autoComplete"
      style={{
        display: 'flex',
        alignItems: 'center',
        color: option.hasCognitiveProfile ? USER_COLOR : '#333',
      }}
    >
      <span style={indicatorStyle(option.hasCognitiveProfile, USER_COLOR)} />
      <span>{option.name}</span>
    </li>
  );
};

const renderRouteOption = (props, option) => {
  const { key, ...restProps } = props;
  return (
    <li
      key={option.id || key}
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

const FlagsToolbar = ({
  language,
  worker,
  allUsers,
  routesOfFlags,
  RroutenewName,
  setRroutenewName,
  handleChangeUserFlags,
  handleChangeRouteFlags,
}) => {
  const { t } = useTranslation();

  return (
    <div className="infoForms">
      <div className="workerNameForms">
        {t('FormsPage.toolbarWorkerLabel')}
        <Autocomplete
          freeSolo
          value={worker?.id ? worker : null}
          onChange={handleChangeUserFlags}
          onInputChange={() => {}} // Handle input changes for freeSolo mode
          disableClearable
          options={allUsers || []}
          getOptionLabel={(option) => option.name || ''}
          renderOption={renderUserOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('FormsPage.toolbarWorkerInputLabel')}
              InputProps={{
                ...params.InputProps,
                type: 'search',
                style: {
                  ...(params.InputProps?.style || {}),
                  color: worker?.hasCognitiveProfile ? USER_COLOR : undefined,
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
          value={
            routesOfFlags && !Array.isArray(routesOfFlags)
              ? routesOfFlags
              : null
          }
          onChange={(event, value) => {
            if (!value) return;
            setRroutenewName(value.name);
            handleChangeRouteFlags(event, value);
          }}
          onInputChange={(event, newInputValue) => {
            // Handle input changes for freeSolo mode
            if (event && event.type === 'change') {
              setRroutenewName(newInputValue);
            }
          }}
          disableClearable
          options={worker?.routes || []}
          getOptionLabel={(option) => option.name || ''}
          renderOption={renderRouteOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                Object.keys(worker || {}).length !== 0 &&
                worker.routes &&
                worker.routes.length !== 0
                  ? RroutenewName
                  : Object.keys(worker || {}).length !== 0 &&
                    worker.routes &&
                    worker.routes.length === 0
                  ? t('FormsPage.toolbarNoRoutesForWorker')
                  : Object.keys(worker || {}).length === 0
                  ? t('FormsPage.selectRoute')
                  : t('FormsPage.toolbarUnknownRoute')
              }
              InputProps={{
                ...params.InputProps,
                type: 'search',
                style: {
                  ...(params.InputProps?.style || {}),
                  color: routesOfFlags?.hasTaskCognitiveRequirements
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

export default FlagsToolbar;
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';


const USER_COLOR = '#1e88e5';

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
      key={option.id ?? key}
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

const TaskPerformanceToolbar = ({
  language,
  worker,
  allUsers,
  handleChangeUser,
  SaveProfileChanges
}) => {
  const { t } = useTranslation();

  return (
    <div className="infoForms">
      <div className="workerNameForms">
        <Autocomplete
          disablePortal
          autoHighlight
          onChange={handleChangeUser}
          options={allUsers || []}
          getOptionLabel={(option) => option.name || ''}
          renderOption={renderUserOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={worker?.name || t('FormsPage.toolbarWorkerInputLabel')}
              InputProps={{
                ...params.InputProps,
                style: {
                  ...(params.InputProps?.style || {}),
                  color: worker?.hasCognitiveProfile ? USER_COLOR : undefined,
                },
              }}
            />
          )}
        />
      </div>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={SaveProfileChanges}
        >
          {t('FormsPage.save')}
        </Button>
      </Box>
    </div>
  );
};

export default TaskPerformanceToolbar;
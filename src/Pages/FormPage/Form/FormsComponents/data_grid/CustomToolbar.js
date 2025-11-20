import * as React from 'react';
import './DataTableRTL.css';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import {
  getingDataUsers,
  postTaskCognitiveRequirements,
} from '../../../../../api/api';
import './CustomToolbar.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import {
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
// import MultipleSelectChip from "./MultipleSelectChip";
// import AccessibleTabs1 from "./AccessibleTabs1";

import { Button, InputLabel } from '@mui/material';
import MultipleEdit from '../multiple_edit/MultipleEdit';
import AddColumn from '../add_column/AddColumn';
import SaveIcon from '@mui/icons-material/Save';

const CustomToolbar = ({
  isInfoUserRoute,
  isInfoUserSite,
  tableType,
  selectedRows,
  columns,
  setColumns,
  setWorker,
  worker,
  setRoutesOfFlags,
  routesOfFlags,
  allUsers,
  setChangeUser,
  setChangeRoute,
  setSaveProfileChanges,
  allRoutes,
  routeForTasksAbility,
  setRouteForTasksAbility,
  prevSelectedWorker,
  newTaskCognitiveRequirements,
  handleChangeUserFlags,
  handleChangeRouteFlags,
  RroutenewName,
  setRroutenewName,
  setUpdateProfile,
  SaveProfileChanges,
  allSites,
}) => {
  // const [prevSelected, setPrevSelected] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => { }, [prevSelectedWorker]);

  const saveProfileChanges = (e) => {
    if (tableType === 'CognitiveProfileHE') {
      setSaveProfileChanges(true);
      SaveProfileChanges(true, "data");
    } else if (tableType === 'TaskabilityHE') {
      newTaskCognitiveRequirements.forEach((element) => {
        try {
          let post = postTaskCognitiveRequirements(element);
        } catch (error) { }

        alert('המידע נשמר !');
      });
    }
  };
  const handleChangeUser = (event, value) => {
    // const selectedValue = JSON.parse(value);
    // setPrevSelected((prevSelected) => [...prevSelected, selectedValue]);

    setWorker(value);
    setChangeUser(true);
  };
  const handleChangeRoute = (event) => {
    const selectedValue = JSON.parse(event.target.value);
    console.log("selectedValue", selectedValue);


    setRouteForTasksAbility(selectedValue);
    // setRoutesOfFlags(selectedValue);
    setChangeRoute(true);
  };

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

  const renderUserOption = (props, option) => (
    <li
      {...props}
      className='workerName-autoComplete'
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

  const renderRouteOption = (props, option) => (
    <li
      {...props}
      className='workerName-autoComplete'
      style={{
        display: 'flex',
        alignItems: 'center',
        color: option.hasTaskCognitiveRequirements ? ROUTE_COLOR : '#333',
      }}
    >
      <span
        style={indicatorStyle(
          option.hasTaskCognitiveRequirements,
          ROUTE_COLOR
        )}
      />
      <span>{option.name}</span>
    </li>
  );

  function formatRouteLabel(route) {
    if (!route?.name) return '';
    const cleanName = route.name.replace('&#8211;', '-').replace('&#8217;', "'");
    return `${route.hasTaskCognitiveRequirements ? '🟠 ' : ''}${cleanName}`;
  }

  const filteredRoutes = selectedSite
    ? allRoutes.filter((route) =>
      selectedSite.routes.some((r) => r.id === route.id)
    )
    : allRoutes;

  return (
    <div>
      <GridToolbarContainer
        style={{
          paddingTop: '20px',
          paddingBottom: '15px',
          direction: 'rtl',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <GridToolbarColumnsButton style={{ color: 'black' }} />
          <GridToolbarFilterButton style={{ color: 'black' }} />
          <GridToolbarDensitySelector style={{ color: 'black' }} />
          <GridToolbarExport
            csvOptions={{
              fileName: `${tableType === 'TaskabilityHE'
                ? 'Taskability'
                : tableType === 'CognitiveProfileHE'
                  ? 'CognitiveProfile'
                  : "TA'AL EDITOR"
                }_${new Date()
                  .toLocaleDateString('en-GB')
                  .replace(/\//g, '-')}.csv`,
            }}
            style={{ color: 'black' }}
          />
        </div>

        {isInfoUserRoute && allUsers && (
          <div className='infoForms'>
            <div className='workerNameForms'>
              שם עובד:
              <Autocomplete
                freeSolo
                value={worker?.id ? worker : null}
                onChange={handleChangeUserFlags}
                id='free-solo-2-demo'
                disableClearable
                options={allUsers || []}
                getOptionLabel={(option) => option.name || ''}
                renderOption={renderUserOption}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label=' שם העובד'
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                      style: {
                        color: worker?.hasCognitiveProfile
                          ? USER_COLOR
                          : undefined,
                      },
                    }}
                  />
                )}
              />
            </div>
            <div className='workerRouteForms'>
              שם מסלול:
              <Autocomplete
                freeSolo
                style={{ width: '250px' }}
                value={
                  routesOfFlags && !Array.isArray(routesOfFlags)
                    ? routesOfFlags
                    : null
                }
                onChange={(event, value) => {
                  if (!value) return;
                  setRroutenewName(value.name);
                  handleChangeRouteFlags(null, value);
                }}
                id='free-solo-2-demo'
                disableClearable
                options={worker.routes || []}
                getOptionLabel={(option) => option.name || ''}
                renderOption={renderRouteOption}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      Object.keys(worker).length !== 0 &&
                        worker.routes.length !== 0
                        ? RroutenewName
                        : Object.keys(worker).length !== 0 &&
                          worker.routes.length === 0
                          ? 'אין מסלולים עבור העובד'
                          : Object.keys(worker).length === 0
                            ? 'בחר מסלול'
                            : 'X'
                    }
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                      style: {
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
        )}
        {tableType === 'TaskabilityHE' ? (
          <div className='infoForms'>
            <div className='workerNameForms'>
              <InputLabel id='demo-simple-select-label-forms'>
                בחירת אתר:
              </InputLabel>
              <select
                className='selectUserForms'
                value={selectedSite ? JSON.stringify(selectedSite) : 'DEFAULT'}
                onChange={(event) => {
                  const selectedValue = JSON.parse(event.target.value);
                  setSelectedSite(selectedValue);
                }
                }
              >
                <option value='DEFAULT' disabled>
                  {selectedSite ? selectedSite.name.replace('&#8211;', '-').replace('&#8217;', "'") : 'בחירת אתר'}
                </option>
                {allSites?.map((site, index) => (
                  <option key={index} value={JSON.stringify(site)}>
                    {site.name.replace('&#8211;', '-').replace('&#8217;', "'")}
                  </option>
                ))}
              </select>
            </div>
            <div className='workerRouteForms'>
              <InputLabel id='demo-simple-select-label-forms'>
                בחירת מסלול:
              </InputLabel>
              <select
                className='selectUserForms'
                style={{
                  color: routeForTasksAbility?.hasTaskCognitiveRequirements
                    ? ROUTE_COLOR
                    : undefined,
                }}
                value={'DEFAULT'}
                onChange={handleChangeRoute}
              >
                <option value='DEFAULT' disabled>
                  {routeForTasksAbility?.length === 0
                    ? 'בחירת מסלול'
                    : formatRouteLabel(routeForTasksAbility)}
                </option>
                {filteredRoutes.map((value, index) => {
                  return (
                    <option
                      key={index}
                      value={JSON.stringify(value)}
                      style={{
                        color: value.hasTaskCognitiveRequirements
                          ? ROUTE_COLOR
                          : '#333',
                      }}
                    >
                      {formatRouteLabel(value)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        ) : (
          <></>
        )}
        {tableType === 'CognitiveAbillities' ? (
          <div className='infoForms'>
            <div className='infoForms'>
              <div className='workerNameForms'>שם העובד : אביב גלבץ</div>
            </div>
          </div>
        ) : (
          <></>
        )}
        {isInfoUserSite && (
          <div className='infoForms'>
            <div className='workerNameForms'>
              {/* <InputLabel id="demo-simple-select-label-forms">
                שם העובד:
              </InputLabel> */}
              {/* <select
                className="selectUserForms"
                defaultValue={"DEFAULT"}
                onChange={handleChangeUser}
              > */}
              <Autocomplete
                disablePortal
                autoHighlight
                onChange={handleChangeUser}
                id='free-solo-2-demo'
                options={allUsers}
                getOptionLabel={(option) => option.name}
                renderOption={renderUserOption}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={worker.name ? worker.name : 'שם העובד'}
                    InputProps={{
                      ...params.InputProps,
                      style: {
                        color: worker?.hasCognitiveProfile
                          ? USER_COLOR
                          : undefined,
                      },
                    }}
                  />
                )}
                label={worker.name}
              />
              {/* <option value="DEFAULT" disabled>
                  {worker.length == 0 ? "בחירת משתמש" : worker.name}
                </option> */}
              {/* {allUsers.map((value, index) => {
                  return (
                    <option
                      key={index}
                      value={JSON.stringify(value)}
                      style={
                        prevSelectedWorker.some((u) => u.id === value.id)
                          ? {
                              fontWeight: "bold",
                              backgroundColor: "#efff00c9",
                            }
                          : {}
                      }
                    >
                      {value.name}
                    </option>
                  );
                })} */}
              {/* </select> */}
            </div>
            {/* <div className="workerRoute">שם אתר: {siteName}</div> */}
          </div>
        )}

        <div>
          <InputAdornment position='start'>
            {tableType === 'TaskabilityHE' && selectedRows?.length >= 2 ? (
              <>
                <div
                  className='buttonaNavbarForms'
                  style={{ display: 'flex', right: 0, paddingBottom: '10px' }}
                >
                  <div style={{ marginLeft: '10px' }}>
                    <MultipleEdit
                      textButton={'עריכה קבוצתית'}
                      selectedRows={selectedRows}
                      fieldsCount={columns?.length}
                      columns={columns}
                    />{' '}
                  </div>
                  <AddColumn columns={columns} setColumns={setColumns}></AddColumn>
                  {/* {selectedRows.map((item) => item.tasks)} */}
                </div>
              </>
            ) : tableType === 'TaskabilityHE' ? (
              <>
                <div
                  className='buttonaNavbarForms'
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '10px',
                  }}
                >
                  {' '}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant='outlined'
                      disabled
                      style={{ marginLeft: '10px' }}
                    >
                      עריכה קבוצתית
                    </Button>
                    <AddColumn columns={columns} setColumns={setColumns}></AddColumn>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <SaveIcon
                      fontSize='large'
                      color='primary'
                      style={{ zIndex: '5' }}
                      onClick={saveProfileChanges}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className='buttonaNavbarForms'
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '10px',
                  }}
                >
                  <AddColumn columns={columns} setColumns={setColumns}></AddColumn>
                  <div style={{ display: 'flex', right: 0 }}>
                    <SaveIcon
                      fontSize='large'
                      color='primary'
                      style={{ zIndex: '5' }}
                      onClick={saveProfileChanges}
                    />
                  </div>
                </div>
              </>
            )}
            <GridToolbarQuickFilter
              InputProps={{ disableUnderline: true }}
              placeholder='חיפוש'
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
                  // background: "blue",
                  width: '87%',
                  height: '28px',
                },
              }}
            />
            <SearchIcon
              style={{
                marginRight: '-30px',
                zIndex: '5',
              }}
            />
          </InputAdornment>
        </div>
      </GridToolbarContainer>

    </div>
  );
};
export default CustomToolbar;

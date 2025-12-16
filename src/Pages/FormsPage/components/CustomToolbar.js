import React from 'react';
import '../../../components/junk/FormPage/Form/FormsComponents/data_grid/DataTableRTL.css';
import '../../../components/junk/FormPage/Form/FormsComponents/data_grid/CustomToolbar.css';
import { GridToolbarContainer } from '@mui/x-data-grid';

import FlagsToolbar from '../flags/FlagsToolbar';
import TaskPerformanceToolbar from '../taskperformanceinfo/TaskPerformanceToolbar';
import TaskAbilityToolbar from '../taskability/TaskAbilityToolbar';
import ToolbarButtons from '../generalperformanceinfo/ToolbarButtons';
import ToolbarSearch from '../generalperformanceinfo/ToolbarSearch';

const CustomToolbar = (props) => {
  const {
    tableType,
    language,
    allUsers,
    worker,
    setWorker,          // still used by outer tables
    routesOfFlags,
    RroutenewName,
    setRroutenewName,
    handleChangeUserFlags,
    handleChangeRouteFlags,
    handleChangeUser,
    allRoutes,
    routeForTasksAbility,
    handleChangeRoute,
    SaveProfileChanges,
    sites,
    selectedSite,
    handleChangeSite,
  } = props;

  return (
    <div>
      <GridToolbarContainer
        style={{
          paddingTop: '20px',
          paddingBottom: '15px',
          direction: language === 'he' ? 'rtl' : 'ltr',
          justifyContent: 'space-between',
        }}
      >
        <ToolbarButtons language={language} tableType={tableType} />

        {tableType === 'Flags' && (
          <FlagsToolbar
            language={language}
            worker={worker}
            allUsers={allUsers}
            routesOfFlags={routesOfFlags}
            RroutenewName={RroutenewName}
            setRroutenewName={setRroutenewName}
            handleChangeUserFlags={handleChangeUserFlags}
            handleChangeRouteFlags={handleChangeRouteFlags}
          />
        )}

        {tableType === 'TaskPerformance' && (
          <TaskPerformanceToolbar
            language={language}
            worker={worker}
            allUsers={allUsers}
            handleChangeUser={handleChangeUser}
            SaveProfileChanges={SaveProfileChanges}

          />
        )}

        {tableType === 'TaskAbility' && (
          <TaskAbilityToolbar
            language={language}
            allRoutes={allRoutes}
            routeForTasksAbility={routeForTasksAbility}
            handleChangeRoute={handleChangeRoute}
            sites={sites}
            selectedSite={selectedSite}
            handleChangeSite={handleChangeSite}
          />
        )}

        <ToolbarSearch language={language} />
      </GridToolbarContainer>
    </div>
  );
};

export default CustomToolbar;

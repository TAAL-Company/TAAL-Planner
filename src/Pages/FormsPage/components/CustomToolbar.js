import React from 'react';
import '../../../components/junk/FormPage/Form/FormsComponents/data_grid/DataTableRTL.css';
import '../../../components/junk/FormPage/Form/FormsComponents/data_grid/CustomToolbar.css';
// import { GridToolbarContainer } from '@mui/x-data-grid';

import FlagsToolbar from '../flags/FlagsToolbar';
import TaskPerformanceToolbar from '../taskperformanceinfo/TaskPerformanceToolbar';
import TaskAbilityToolbar from '../taskability/TaskAbilityToolbar';
import Toolbar from '../../../components/Toolbar/Toolbar';

// import ToolbarButtons from '../generalperformanceinfo/ToolbarButtons';
// import ToolbarSearch from '../generalperformanceinfo/ToolbarSearch';

import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div>
      <div
        style={{
          paddingTop: '20px',
          paddingBottom: '15px',
          direction: t('Direction'),
          justifyContent: 'space-between',
        }}
      >
        {/* <ToolbarButtons tableType={tableType} /> */}

        {tableType === 'Flags' && (
          <FlagsToolbar
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
        <Toolbar />
        {/* <ToolbarSearch /> */}
      </div>
    </div>
  );
};

export default CustomToolbar;

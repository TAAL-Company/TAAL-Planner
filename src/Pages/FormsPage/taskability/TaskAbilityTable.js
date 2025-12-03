import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Backdrop } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import TaskAbilityColumns from './TaskAbilityColumns';
import TaskAbilityRows from './TaskAbilityRows';
import CustomToolbar from '../components/CustomToolbar';
import { getTranslation } from '../i18n';
import {
  gettaskCognitiveRequirements,
  getAllTaskCognitiveRequirements,
} from '../../../api/api';

const TaskAbilityTable = ({
  language,
  allRoutes,
  allTasks,
  cognitiveAbilities,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeForTasksAbility, setRouteForTasksAbility] = useState({});
  const [tasksOfChosenRoute, setTasksOfChosenRoute] = useState([]);
  const [cognitiveRequirements, setCognitiveRequirements] = useState([]);

  const t = (key) => getTranslation(key, language);

  const handleChangeRoute = async (event, value) => {
    setLoading(true);
    try {
      setRouteForTasksAbility(value);
      setRows([]);
      setTasksOfChosenRoute([]);

      const route = allRoutes.find((route) => route.id === value.id);
      
      if (route && route.tasks) {
        const tasksWithDetails = [];
        for (const task of route.tasks) {
          const taskTemp = allTasks.find((temp) => temp.id === task.taskId);
          if (taskTemp) {
            tasksWithDetails.push({
              ...taskTemp,
              position: task.position,
            });
          }
        }
        setTasksOfChosenRoute(tasksWithDetails);

        // Fetch all cognitive requirements
        const allReqs = await getAllTaskCognitiveRequirements();
        setCognitiveRequirements(allReqs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tasksOfChosenRoute.length > 0 && routeForTasksAbility.name) {
      const { generateRows } = TaskAbilityRows({
        tasks: tasksOfChosenRoute,
        route: routeForTasksAbility,
        cognitiveRequirements,
      });
      setRows(generateRows());
    }
  }, [tasksOfChosenRoute, routeForTasksAbility, cognitiveRequirements]);

  const { columns } = TaskAbilityColumns({
    language,
    cognitiveAbilities,
  });

  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress size='10rem' color='info' />
      </Backdrop>

      <Box
        sx={{
          width: '100%',
          direction: language === 'he' ? 'rtl' : 'ltr',
          background: '#F5F5F5',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          '& .MuiDataGrid-root': {
            marginRight: '25px',
            marginLeft: '25px',
            border: 0,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: 'Medium',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'white',
            marginTop: '5px',
            marginBottom: '0px',
            borderRadius: '6px',
          },
          '& .MuiDataGrid-cellContent': {
            fontFamily: 'Gotham Black, sans-serif',
            fontSize: 'medium',
          },
        }}
      >
        <DataGrid
          autoHeight
          sortModel={[
            {
              field: 'id',
              sort: 'asc',
            },
          ]}
          sx={{
            direction: language === 'he' ? 'rtl' : 'ltr',
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'unset !important',
              mt: '0 !important',
            },
            '& .MuiDataGrid-columnHeaders': {
              overflow: 'unset',
              position: 'sticky',
              left: 1,
              zIndex: 1,
              bgcolor: '#114260',
            },
            '& .MuiDataGrid-columnHeadersInner > div': {
              direction: language === 'he' ? 'rtl !important' : 'ltr !important',
            },
            '& .MuiDataGrid-main': {
              overflow: 'auto',
            },
            '& .MuiTablePagination-actions': {
              direction: 'ltr',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#EDF3F8',
            },
            '& .MuiButton-textSizeSmall': {
              color: 'rgb(8,8,137)',
            },
            '& .MuiDataGrid-columnHeadersInner': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
              bgcolor: '#114260',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: 'white',
            },
            '& .MuiDataGrid-iconSeparator': {
              color: 'white',
            },
            '& .MuiDataGrid-menuIconButton > .MuiSvgIcon-root , .MuiDataGrid-sortIcon':
              {
                color: 'white !important',
                opacity: 1,
              },
          }}
          rows={rows}
          columns={columns}
          pageSize={100}
          getRowHeight={() => 'auto'}
          rowsPerPageOptions={[10]}
          pagination
          disableSelectionOnClick
          components={{
            Toolbar: () => (
              <CustomToolbar
                handleChangeRoute={handleChangeRoute}
                allRoutes={allRoutes}
                tableType={'TaskAbility'}
                isInfoUserRoute={false}
                isInfoUserSite={false}
                routeForTasksAbility={routeForTasksAbility}
                setRouteForTasksAbility={setRouteForTasksAbility}
                language={language}
              />
            ),
          }}
        />
      </Box>
    </div>
  );
};

export default TaskAbilityTable;

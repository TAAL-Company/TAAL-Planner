import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Backdrop, Paper } from '@mui/material';
import { DataGrid, heIL } from '@mui/x-data-grid';
import TaskAbilityColumns from './TaskAbilityColumns';
import TaskAbilityRows from './TaskAbilityRows';
import CustomToolbar from '../components/CustomToolbar';
import { useTranslation } from 'react-i18next';
import {
  gettaskCognitiveRequirements,
  getAllTaskCognitiveRequirements,
} from '../../../api/api';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

// Create rtl cache
const cacheRtl = createCache({
  key: 'taskability-table-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'taskability-table-ltr',
  stylisPlugins: [prefixer],
});

const TaskAbilityTable = ({
  language,
  allRoutes,
  allTasks,
  cognitiveAbilities,
  sites,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeForTasksAbility, setRouteForTasksAbility] = useState({});
  const [tasksOfChosenRoute, setTasksOfChosenRoute] = useState([]);
  const [cognitiveRequirements, setCognitiveRequirements] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSite, setSelectedSite] = useState(null);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  // Filter routes by selected site
  useEffect(() => {
    if (selectedSite && selectedSite.routes && selectedSite.routes.length > 0) {
      // Get route IDs from site.routes array
      const siteRouteIds = selectedSite.routes.map((route) => route.id);
      const routesForSite = allRoutes.filter((route) =>
        siteRouteIds.includes(route.id)
      );
      setFilteredRoutes(routesForSite);
    } else {
      setFilteredRoutes(allRoutes);
    }
    // Reset route selection when site changes
    setRouteForTasksAbility({});
    setRows([]);
    setTasksOfChosenRoute([]);
  }, [selectedSite, allRoutes]);

  const handleChangeSite = (event, value) => {
    setSelectedSite(value);
  };

  const { t } = useTranslation();

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

  const { columns: baseColumns } = TaskAbilityColumns({
    language,
    cognitiveAbilities,
  });

  // Reverse columns for RTL (Hebrew) mode
  const columns = useMemo(() => {
    return language === 'he' ? [...baseColumns].reverse() : baseColumns;
  }, [baseColumns, language]);

  const existingTheme = useTheme();
  const direction = language === 'he' ? 'rtl' : 'ltr';

  const theme = useMemo(() =>
    createTheme({}, existingTheme, { direction }),
    [existingTheme, direction],
  );

  const cache = direction === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
    <ThemeProvider theme={theme}>
    <div dir={direction}>
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
        <div style={{ direction, width: '100%', overflowX: 'auto' }}>
        <Paper style={{ minWidth: 1200 }}>
        <DataGrid
          autoHeight
          style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
          sortModel={[
            {
              field: 'id',
              sort: 'asc',
            },
          ]}
          sx={{
            '& .MuiDataGrid-virtualScroller': {
              mt: '0 !important',
            },
            '& .MuiDataGrid-main': {
              direction: language === 'he' ? 'rtl' : 'ltr',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#114260',
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
              fontWeight: 'bold',
              color: '#fff',
              position: 'relative',
              zIndex: 1,
              direction: language === 'he' ? 'rtl' : 'ltr',
            },
            '& .MuiDataGrid-columnHeadersInner': {
              direction: language === 'he' ? 'rtl' : 'ltr',
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              direction: language === 'he' ? 'rtl' : 'ltr',
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
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          getRowHeight={() => 'auto'}
          rowsPerPageOptions={[10, 25, 50, 100]}
          pagination
          disableSelectionOnClick
          localeText={
            language === 'he'
              ? heIL.components.MuiDataGrid.defaultProps.localeText
              : undefined
          }
          components={{
            Toolbar: () => (
              <CustomToolbar
                handleChangeRoute={handleChangeRoute}
                allRoutes={filteredRoutes}
                tableType={'TaskAbility'}
                isInfoUserRoute={false}
                isInfoUserSite={false}
                routeForTasksAbility={routeForTasksAbility}
                setRouteForTasksAbility={setRouteForTasksAbility}
                language={language}
                sites={sites}
                selectedSite={selectedSite}
                handleChangeSite={handleChangeSite}
              />
            ),
          }}
        />
        </Paper>
        </div>
      </Box>
    </div>
    </ThemeProvider>
    </CacheProvider>
  );
};

export default TaskAbilityTable;

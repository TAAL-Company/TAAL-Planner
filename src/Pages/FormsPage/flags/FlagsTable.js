import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Backdrop, Paper } from '@mui/material';
import { DataGrid, heIL } from '@mui/x-data-grid';
import FlagsColumns from './FlagsColumns';
import FlagsRows from './FlagsRows';
import FlagsDialog from './FlagsDialog';
import CustomToolbar from '../components/CustomToolbar';
import { getTranslation } from '../i18n';
import {
  getingData_Tasks,
  getingData_Routes,
  getingDataFlags,
  postEvaluation,
  postEvaluationEvents,
} from '../../../api/api';
import taskpic from '../../../components/junk/FormPage/Form/FormsComponents/PicturesForms/taskpic.png';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

// Create rtl cache
const cacheRtl = createCache({
  key: 'flags-table-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'flags-table-ltr',
  stylisPlugins: [prefixer],
});

const FlagsTable = ({
  language,
  allUsers,
  allRoutes,
  worker,
  setWorker,
  cognitiveList,
  taskAbilityLists,
  setTaskAbilityList,
}) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [allFlags, setAllFlags] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [routesOfFlags, setRoutesOfFlags] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currRow, setCurrRow] = useState({});
  const [initialValuesRow, setInitialValuesRow] = useState({});
  const [routeName, setRouteName] = useState('');

  const t = (key) => getTranslation(key, language);

  const handleEdit = (row) => {
    setIsDialogOpen(true);
    setCurrRow(row);
    setInitialValuesRow(row);
  };

  const handleDelete = (id) => {
    setFlags((prev) => prev.filter((row) => row.id !== id));
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleSave = (data) => {
    const updatedRows = [...flags];
    const index = flags.findIndex((row) => row.id === data.id);
    if (index !== -1) {
      updatedRows[index] = data;
      setFlags(updatedRows);
    }
    setIsDialogOpen(false);
  };

  const handleChangeUserFlags = (event, values) => {
    setRouteName(t('selectRoute'));
    setWorker(values);
  };

  const handleChangeRouteFlags = async (event, value) => {
    setLoading(true);
    try {
      setTaskAbilityList([]);
      setAllFlags([]);
      setFlags([]);
      setRouteName(value.name);

      const route = allRoutes.find((route) => route.id === value.id);
      setRoutesOfFlags(route);

      const taskIds = route.tasks?.map((task) => task.taskId);
      const studentIds = [worker.id];

      const algoResult = await postEvaluation(studentIds, taskIds);
      setTaskAbilityList(algoResult);

      const flagsData = await getingDataFlags();
      setAllFlags(flagsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasks = await getingData_Tasks();
        setAllTasks(tasks || []);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(routesOfFlags).length > 0 && allFlags.length > 0) {
      const processedTaskIds = new Set();
      const updatedFlags = [];

      routesOfFlags.tasks?.forEach((task) => {
        const evaluation = allFlags.find(
          (flag) => flag.taskId === task.taskId && flag.studentId === worker.id
        );

        if (!evaluation) return;

        if (!processedTaskIds.has(task.taskId)) {
          processedTaskIds.add(task.taskId);

          const taskInfo = allTasks.find((taskT) => taskT.id === task.taskId);

          const taskAbilityList = taskAbilityLists.find(
            (prediction) =>
              prediction.taskId === evaluation.taskId &&
              prediction.userId === worker.id
          );

          const IndexesToTraits = taskAbilityList?.indexes
            ?.map((index) => cognitiveList.find((ca) => ca.index === index))
            .filter((entry) => entry !== undefined)
            .map((entry) => entry.trait);

          updatedFlags.push({
            id: task.position,
            image: taskInfo?.picture_url || taskpic,
            classification: taskAbilityList?.evaluation,
            task: taskInfo?.title,
            intervention: evaluation.intervention,
            Alternatives: evaluation.alternativeTaskId,
            explaination: evaluation.explanation,
            TaskAbilitylist: IndexesToTraits,
          });
        }
      });

      if (updatedFlags.length > 0) {
        setFlags(updatedFlags);
      }
    }
  }, [allFlags, allTasks, cognitiveList, routesOfFlags, taskAbilityLists, worker.id]);

  const { columns } = FlagsColumns({
    language,
    handleEdit,
    handleDelete,
  });

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
            {isDialogOpen && (
              <FlagsDialog
                open={isDialogOpen}
                handleClose={handleClose}
                initialValues={currRow}
                language={language}
                onSave={handleSave}
              />
            )}

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
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#114260',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      fontWeight: 'bold',
                      color: '#fff',
                      position: 'relative',
                      zIndex: 1,
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
                  rows={flags}
                  columns={columns}
                  pageSize={pageSize}
                  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                  getRowHeight={() => 'auto'}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  pagination
                  checkboxSelection
                  disableSelectionOnClick
                  localeText={
                    language === 'he'
                      ? heIL.components.MuiDataGrid.defaultProps.localeText
                      : undefined
                  }
                  components={{
                    Toolbar: () => (
                      <CustomToolbar
                        handleChangeUserFlags={handleChangeUserFlags}
                        handleChangeRouteFlags={handleChangeRouteFlags}
                        allRoutes={allRoutes}
                        allUsers={allUsers}
                        setWorker={setWorker}
                        worker={worker}
                        tableType={'Flags'}
                        isInfoUserRoute={true}
                        isInfoUserSite={false}
                        routeName={routeName}
                        routesOfFlags={routesOfFlags}
                        RroutenewName={routeName}
                        setRroutenewName={setRouteName}
                        language={language}
                      />
                    ),
                  }}
                  disableVirtualization
                  componentsProps={{
                    toolbar: {
                      utf8WithBom: true,
                      showQuickFilter: false,
                      quickFilterProps: {
                        debounceMs: 500,
                      },
                    },
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

export default FlagsTable;

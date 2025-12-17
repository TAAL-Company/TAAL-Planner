import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, CircularProgress, Backdrop, Paper } from '@mui/material';
import { DataGrid, heIL } from '@mui/x-data-grid';
import TaskPerformanceColumns from './TaskPerformanceColumns';
import TaskPerformanceRows from './TaskPerformanceRows';
import CustomToolbar from '../components/CustomToolbar';
import { useTranslation } from 'react-i18next';
import {
  getCognitiveProfile,
  postDataCognitiveProfile,
  updateDataCognitiveProfile,
} from '../../../api/api';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

// Create rtl cache
const cacheRtl = createCache({
  key: 'taskperformance-table-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'taskperformance-table-ltr',
  stylisPlugins: [prefixer],
});

const TaskPerformanceTable = ({
  language,
  allUsers,
  worker,
  setWorker,
  cognitiveAbilities,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cognitiveProfileValues, setCognitiveProfileValues] = useState([]);
  const [saveProfileChanges, setSaveProfileChanges] = useState(false);
  const [updateProfile, setUpdateProfile] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const { t } = useTranslation();

  const handleEdit = (row) => {
    console.log('Edit row:', row);
  };

  const handleChangeUser = (event, values) => {
    setWorker(values);
  };

  const SaveProfileChanges = async () => {
    if (saveProfileChanges === true) {
      setSaveProfileChanges(false);
      if (worker.length !== 0) {
        try {
          await postDataCognitiveProfile(worker.id, cognitiveProfileValues);
          alert(t('FormsPage.dataSavedSuccess'));
        } catch (error) {
          console.error(error.message);
        }
      }
    } else if (updateProfile !== '') {
      await updateDataCognitiveProfile(cognitiveProfileValues, worker.id);
      alert(t('FormsPage.dataSavedSuccess'));
    }
  };

  const handleCellEdit = (params) => {
    const updatedRows = rows.map((row) => {
      if (row.id === params.id) {
        return {
          ...row,
          [params.field]: params.value,
        };
      } else {
        return row;
      }
    });

    setRows(updatedRows);

    const valueMap = {
      A: 5,
      B: 3,
      C: 2,
      D: 1,
      a: 5,
      b: 3,
      c: 2,
      d: 1,
    };

    // Convert input value to its corresponding numerical value
    let outputValue = 0;
    if (valueMap.hasOwnProperty(params.value)) {
      outputValue = valueMap[params.value];
    }

    setCognitiveProfileValues(
      cognitiveProfileValues.map((cog, index) => {
        if (index === params.id) {
          return outputValue;
        } else {
          return cog;
        }
      })
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profile = await getCognitiveProfile(worker.id);
        setCognitiveProfileValues(profile.value);
        setUpdateProfile(profile.id);
        setSaveProfileChanges(false);
      } catch (error) {
        console.error(error.message);
        setUpdateProfile('');
        setSaveProfileChanges(true);
        setCognitiveProfileValues(new Array(242).fill(0));
      } finally {
        setLoading(false);
      }
    };

    if (worker.length !== 0 && worker.id) {
      fetchData();
    }
  }, [worker.id]);

  useEffect(() => {
    const { generateRows } = TaskPerformanceRows({
      cognitiveAbilities,
      cognitiveProfileValues,
    });
    setRows(generateRows());
  }, [cognitiveAbilities, cognitiveProfileValues]);

  const { columns: baseColumns } = TaskPerformanceColumns({
    language,
    handleEdit,
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
          onCellEditCommit={handleCellEdit}
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
                handleChangeUser={handleChangeUser}
                allUsers={allUsers}
                setWorker={setWorker}
                worker={worker}
                tableType={'TaskPerformance'}
                isInfoUserRoute={false}
                isInfoUserSite={true}
                SaveProfileChanges={SaveProfileChanges}
                language={language}
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

export default TaskPerformanceTable;

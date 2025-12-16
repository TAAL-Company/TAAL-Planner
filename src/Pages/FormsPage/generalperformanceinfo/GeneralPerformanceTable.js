import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import { DataGrid, heIL } from '@mui/x-data-grid';
import GeneralPerformanceColumns from './GeneralPerformanceColumns';
import GeneralPerformanceRows from './GeneralPerformanceRows';
import { getTranslation } from '../i18n';
import { getCognitiveAbillities } from '../../../api/api';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

// Create rtl cache
const cacheRtl = createCache({
  key: 'generalperformance-table-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'generalperformance-table-ltr',
  stylisPlugins: [prefixer],
});

const GeneralPerformanceTable = ({ language }) => {
  const [cognitiveList, setCognitiveList] = useState([]);
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  const t = (key) => getTranslation(key, language);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCognitiveAbillities();
        setCognitiveList(data || []);
      } catch (error) {
        console.error('Error fetching cognitive abilities:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const { generateRows } = GeneralPerformanceRows({ cognitiveList });
    setRows(generateRows());
  }, [cognitiveList]);

  const { columns: baseColumns } = GeneralPerformanceColumns({ language });

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
          columnTypes={{
            string: {
              autoWidth: true,
            },
          }}
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
          experimentalFeatures={
            ({ newEditingApi: true }, { columnGrouping: true })
          }
          rows={rows}
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

export default GeneralPerformanceTable;

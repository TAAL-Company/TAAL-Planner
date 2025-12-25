import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import { DataGrid, heIL } from '@mui/x-data-grid';
import GeneralPerformanceColumns from './GeneralPerformanceColumns';
import GeneralPerformanceRows from './GeneralPerformanceRows';
import { useTranslation } from 'react-i18next';
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

const GeneralPerformanceTable = ({cognitiveList}) => {
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  const { t } = useTranslation();

  useEffect(() => {
    const { generateRows } = GeneralPerformanceRows({ cognitiveList });
    setRows(generateRows());
  }, [cognitiveList]);

  const { columns } = GeneralPerformanceColumns();

  const existingTheme = useTheme();

  const theme = useMemo(() =>
    createTheme({}, t('localeText', { returnObjects: true }), existingTheme, { direction: t('Direction'), }),
    [existingTheme],
  );

    // Determine the cache to use based on the direction
  const cache = t('Direction') === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <div dir={t('Direction')}>
          <Box
            sx={{
              width: '100%',
              direction: t('Direction'),
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
            <div style={{ direction: t('Direction'), width: '100%', overflowX: 'auto' }}>
              <Paper style={{ minWidth: 1200 }}>
                <DataGrid
                  autoHeight
                  style={{ direction: t('Direction') }}
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
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#114260',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      fontWeight: 'bold',
                      color: '#fff',
                      position: 'relative',
                      zIndex: 1,
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
                  checkboxSelection
                  disableSelectionOnClick
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

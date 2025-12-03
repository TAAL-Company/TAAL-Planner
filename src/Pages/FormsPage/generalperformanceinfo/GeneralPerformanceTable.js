import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DataGrid, heIL } from '@mui/x-data-grid';
import GeneralPerformanceColumns from './GeneralPerformanceColumns';
import GeneralPerformanceRows from './GeneralPerformanceRows';
import { getTranslation } from '../i18n';
import { getCognitiveAbillities } from '../../../api/api';

const GeneralPerformanceTable = ({ language }) => {
  const [cognitiveList, setCognitiveList] = useState([]);
  const [rows, setRows] = useState([]);

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

  const { columns } = GeneralPerformanceColumns({ language });

  return (
    <div>
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
          experimentalFeatures={
            ({ newEditingApi: true }, { columnGrouping: true })
          }
          rows={rows}
          columns={columns}
          pageSize={100}
          getRowHeight={() => 'auto'}
          rowsPerPageOptions={[10]}
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
      </Box>
    </div>
  );
};

export default GeneralPerformanceTable;

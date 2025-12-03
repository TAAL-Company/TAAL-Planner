import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PersonalInfoColumns from './PersonalInfoColumns';
import PersonalInfoRows from './PersonalInfoRows';
import { getTranslation } from '../i18n';

const PersonalInfoTable = ({ language, worker }) => {
  const [rows, setRows] = useState([]);
  const t = (key) => getTranslation(key, language);

  const { getInitialRows } = PersonalInfoRows({ language });

  useEffect(() => {
    setRows(getInitialRows());
  }, [language]);

  const handleEdit = (row) => {
    // Implement edit functionality
    console.log('Edit row:', row);
  };

  const { columns } = PersonalInfoColumns({
    language,
    handleEdit,
  });

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
        />
      </Box>
    </div>
  );
};

export default PersonalInfoTable;

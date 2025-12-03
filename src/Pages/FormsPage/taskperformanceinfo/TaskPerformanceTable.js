import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Backdrop } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import TaskPerformanceColumns from './TaskPerformanceColumns';
import TaskPerformanceRows from './TaskPerformanceRows';
import CustomToolbar from '../components/CustomToolbar';
import { getTranslation } from '../i18n';
import {
  getCognitiveProfile,
  postDataCognitiveProfile,
  updateDataCognitiveProfile,
} from '../../../api/api';

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

  const t = (key) => getTranslation(key, language);

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
          alert(t('dataSavedSuccess'));
        } catch (error) {
          console.error(error.message);
        }
      }
    } else if (updateProfile !== '') {
      await updateDataCognitiveProfile(cognitiveProfileValues, worker.id);
      alert(t('dataSavedSuccess'));
    }
  };

  const handleCellEdit = (params) => {
    const newValue = params.value;
    const rowIndex = params.id;
    
    setCognitiveProfileValues((prev) => {
      const newValues = [...prev];
      newValues[rowIndex] = newValue;
      return newValues;
    });
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

  const { columns } = TaskPerformanceColumns({
    language,
    handleEdit,
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
          onCellEditCommit={handleCellEdit}
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

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
          <Button
            variant='contained'
            color='primary'
            onClick={SaveProfileChanges}
          >
            {t('save')}
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default TaskPerformanceTable;

import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { getingData_coaches, deleteCoach, insertCoach } from '../../api/api'; // Make sure insertCoach is imported
import { useState, useEffect } from 'react';
import { Button, MenuItem, Menu } from '@mui/material';
import CoachForm from './CoachForm';
import Toolbar from '../../components/Toolbar/Toolbar';
import { useNotification } from "../../components/Notification/NotificationProvider";
import { useTranslation } from "react-i18next";
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import Rows from './Rows';
import Columns from './Columns'; // Import Columns

// Create rtl cache
const cacheRtl = createCache({
  key: 'data-grid-rtl-demo',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'data-grid-ltr-demo',
  stylisPlugins: [prefixer],
});

export default function CoachesTable() {
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState([]);
  const [newCoach, setNewCoach] = useState({
    email: '',
    phone: '',
    name: '',
    picture_url: '',
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [coachAction, setCoachAction] = useState('add'); // NEW STATE
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  const handleClickMenu = (event, coach) => {
    setAnchorEl(event.currentTarget);
    setSelectedCoach(coach);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCoach(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCoach({
      email: '',
      phone: '',
      name: '',
      picture_url: '',
    });
    setSelectedCoach(null);
    setAnchorEl(null);
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
    setNewCoach(newCoach);
    setTitle(t('CoachPage.ADDANewCoach'));
    setCoachAction('add'); // Set action to add
  };

  const handleClickOpenEditDialog = () => {
    setOpenDialog(true);
    setNewCoach(selectedCoach);
    setTitle(t('CoachPage.EditCoachInfo'));
    setCoachAction('edit'); // Set action to edit
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const coachesData = await getingData_coaches();

        const jwt = sessionStorage.getItem('jwt');
        const jwtEditor = sessionStorage.getItem('jwt-EDITOR');

        let role = null;
        let userId = null;

        if (jwt) {
          try {
            role = JSON.parse(jwt)?.role;
          } catch (error) {
            console.error("Failed to parse JWT:", error);
          }
        }

        if (jwtEditor) {
          try {
            userId = JSON.parse(jwtEditor)?.id;
          } catch (error) {
            console.error("Failed to parse JWT-EDITOR:", error);
          }
        }

        if (role === "ADMIN") {
          setCoaches(coachesData);
        } else if (role === "EDITOR" && userId) {
          const filteredCoaches = coachesData.filter((coach) => coach.id == userId && userId != null);
          setCoaches(filteredCoaches);
        } else if (role === "STUDENT" && userId) {
          const filteredCoaches = coachesData.filter((coach) => coach.id == JSON.parse(jwt).coachId && JSON.parse(jwt).id != null);
          setCoaches(filteredCoaches);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteCoach = async () => {
    try {
      await deleteCoach(selectedCoach.id).then(() => {
        showNotification('success', t('Success_delete_coach'));
        setCoaches(prevCoaches => prevCoaches.filter(coach => coach.id !== selectedCoach.id));
        handleCloseMenu();
      });
    } catch (error) {
      console.error(error.message);
      showNotification('error', t('Error_delete_coach'));
    }
  };

  const handleDuplicateCoach = async () => {
    if (!selectedCoach) return;
    try {
      // Prepare the duplicated coach data (remove id, maybe tweak name/email)
      const duplicatedCoach = {
        ...selectedCoach,
        name: selectedCoach.name + ' (Duplicate)',
      };
      delete duplicatedCoach.id;

      const response = await insertCoach(duplicatedCoach);
      setCoaches(prev => [response, ...prev]);
      showNotification('success', t('Success_duplicate_coach'));
      handleCloseMenu();
    } catch (error) {
      showNotification('error', t('Error_duplicate_coach'));
    }
  };

  // Function to get rows with details
  const { getRowsWithDetails } = Rows({ coaches, expandedRows });

  // Get columns from Columns.js
  const { columns } = Columns({ handleClickMenu });

  const existingTheme = useTheme();

  const theme = React.useMemo(
    () =>
      createTheme({}, t('localeText', { returnObjects: true }), existingTheme, {
        direction: t('Direction'),
      }),
    [existingTheme]
  );

  const cache = t('Direction') === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <div dir={t('Direction')} style={{ minHeight: '100vh', background: '#f5f6fa', padding: '32px 0' }}>
          <div
            className="headline"
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '20px 0 8px 0',
              textAlign: 'center',
              letterSpacing: '0.5px',
            }}
          >
            {t('CoachPage.Coaches')}
          </div>
          <div
            style={{
              width: '80%',
              maxWidth: '1200px',
              margin: '0 auto 24px auto',
              borderBottom: '2px solid #e0e0e0',
            }}
          />
          <div
            className="table"
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '32px 20px 24px 20px',
              maxWidth: '1200px',
              margin: '0 auto',
              minHeight: '700px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
              <Button
                variant="outlined"
                onClick={handleClickOpenDialog}
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                {t('CoachPage.ADDANewCoach')}
              </Button>
            </div>
            <div style={{ width: '100%' }}>
              <DataGrid
                style={{ direction: t('Direction') }}
                rows={getRowsWithDetails()}
                columns={columns}
                pageSize={12}
                rowsPerPageOptions={[12, 24, 50]}
                autoHeight
                loading={loading}
                components={{
                  Toolbar: Toolbar,
                }}
                sx={{
                  background: '#fafbfc',
                  borderRadius: 2,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'rgb(0, 112, 166)',
                    borderBottom: '1px solid rgb(224, 224, 224)',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: '#fff',
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: '1rem',
                  },
                }}
              />
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                <MenuItem onClick={handleClickOpenEditDialog}>{t('CoachPage.Edit')}</MenuItem>
                <MenuItem onClick={handleDeleteCoach}>{t('CoachPage.Delete')}</MenuItem>
                <MenuItem onClick={handleDuplicateCoach}>{t('CoachPage.Duplicate')}</MenuItem>
              </Menu>

              <CoachForm
                open={openDialog}
                handleCloseDialog={handleCloseDialog}
                title={title}
                initialValues={newCoach}
                setCoaches={setCoaches}
                CoachAction={coachAction} // Pass the correct action
              />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}
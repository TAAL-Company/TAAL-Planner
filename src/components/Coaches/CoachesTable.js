import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { getingData_coaches, deleteCoach } from '../../api/api';
import { useState, useEffect } from 'react';
import { Button, MenuItem, Menu } from '@mui/material';
import CoachForm from './CoachForm';
import Toolbar from '../Student/Toolbar';
import { useNotification } from "../Notification/NotificationProvider";
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
  };

  const handleClickOpenEditDialog = () => {
    setOpenDialog(true);
    setNewCoach(selectedCoach);
    setTitle(t('CoachPage.EditCoachInfo'));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const coachesData = await getingData_coaches();
      setCoaches(coachesData);
      setLoading(false);
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
        <div dir={t('Direction')} style={{ textAlign: '-webkit-center' }}>
          <Button
            style={{
              marginTop: '14px',
              marginBottom: '14px',
            }}
            variant="outlined"
            onClick={handleClickOpenDialog}
          >
            {t('CoachPage.ADDANewCoach')}
          </Button>
          <Box style={{ height: 600, width: '100%' }}>
            <DataGrid
              style={{ direction: t('Direction') }}
              rows={getRowsWithDetails()}
              columns={columns}
              pageSize={12}
              autoHeight={true}
              rowsPerPageOptions={[12]}
              loading={loading}
              components={{
                Toolbar: Toolbar,
              }}
            />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
              <MenuItem onClick={handleClickOpenEditDialog}>{t('CoachPage.Edit')}</MenuItem>
              <MenuItem onClick={handleDeleteCoach}>{t('CoachPage.Delete')}</MenuItem>
            </Menu>

            <CoachForm
              open={openDialog}
              handleCloseDialog={handleCloseDialog}
              title={title}
              initialValues={newCoach}
              setCoaches={setCoaches}
              CoachAction="add"
            />
          </Box>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}
import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { getingData_Users, getingData_coaches, getingData_Places, insertUser, deleteUser } from '../../api/api';
import { useState, useEffect } from 'react';
import { Button, MenuItem, Menu } from '@mui/material';
import UserForm from './UserForm';
import Toolbar from './Toolbar';
import './StudentsCard.css';
import { useNotification } from "../Notification/NotificationProvider";
import { useTranslation } from "react-i18next";
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import Columns from './Columns';
import Rows from './Rows';

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

export default function DataGridDemo() {
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState([]);
  const [sites, setSites] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    phone: '',
    name: '',
    user_name: '',
    coachId: '',
    picture_url: '',
    Password: '',
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateduplicateUser, setupdateduplicateUser] = useState(false);
  const [title, setTitle] = useState('');

  const { showNotification } = useNotification();
  const { t } = useTranslation();

  // User data
  const [users, setUsers] = useState([]);

  // grenal data
  const [UserAction, setUserAction] = useState('');



  const handleClickMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewUser({});
    setSelectedUser(null);
    setAnchorEl(null);
    setUserAction('');
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
    setUserAction('add');
    setNewUser(newUser);
    setTitle(t('UserPage.ADDANewEmployee'));
  };

  const handleClickOpenEditDialog = () => {
    setOpenDialog(true);
    setUserAction('edit');
    setNewUser(selectedUser);
    setTitle(t('UserPage.EditEmployeeInfo'));
  };

  // Fetch users and coaches data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const usersData = await getingData_Users();
      const coachesData = await getingData_coaches();
      const sitesData = await getingData_Places();
      setSites(sitesData);
      setCoaches(coachesData);

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

      const usersWithStatus = usersData.map(user => ({
        ...user,
        active: 0,
      }));

      if (role === "ADMIN") {
        setUsers(usersWithStatus);
      } else if (role === "EDITOR" && userId) {
        const filteredUsers = usersWithStatus.filter(user => user.coachId === userId && userId != null);
        setUsers(filteredUsers);

        const filteredCoaches = coachesData.filter((coach) => coach.id == userId && userId != null)
        setCoaches(filteredCoaches);

        const filteredSites = sitesData.filter((site) =>
          JSON.parse(jwt)?.sites?.some((siteId) => site.id === siteId.id)
        );
        setSites(filteredSites);
      } else if (role === "STUDENT" && userId) {
        const filteredUsers = usersWithStatus.filter(user => user.id === userId && userId != null);
        setUsers(filteredUsers);

        const filteredCoaches = coachesData.filter((coach) => coach.id == JSON.parse(jwt).coachId && JSON.parse(jwt).id != null)
        setCoaches(filteredCoaches);

        const filteredSites = sitesData.filter((site) =>
          JSON.parse(jwt)?.sites?.some((siteId) => site.id === siteId.id)
        );
        setSites(filteredSites);

      }

      setLoading(false);
    };

    fetchData();
  }, [updateduplicateUser]);

  // Delete user
  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.id).then(() => {
        showNotification('success', t('Success_delete_user'));
        setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
        handleCloseMenu();
      });
    } catch (error) {
      console.error(error.message);
      showNotification('error', t('Error_delete_user'));
    }
  };

  // Duplicate user
  const handleDuplicateUser = async () => {
    const userToDuplicate = users.find(user => user.id === selectedUser.id);

    const userDuplicatedata = {
      email: userToDuplicate.email,
      user_name: userToDuplicate.user_name,
      name: userToDuplicate.name,
      phone: userToDuplicate.phone,
      cognitiveProfileId: userToDuplicate.cognitiveProfile?.id || '',
      sites: userToDuplicate.sites,
      routeIds: userToDuplicate.routes.map((routeId) => (routeId.id)) || [],
      coachId: userToDuplicate.coach?.id || '',
      taskIds: userToDuplicate.tasks.map((taskId) => ({
        id: taskId?.id,
      })) || [],
      picture_url: userToDuplicate.picture_url || '',
    };

    if (userToDuplicate) {
      const userDuplicatedatawithname = { ...userDuplicatedata, name: userToDuplicate.name + '-' + new Date().getTime() };
      try {
        insertUser(userDuplicatedatawithname).then((data) => {
          showNotification('success', t('Success_duplicate_user'));
          setupdateduplicateUser(!updateduplicateUser);
          // setUsers(prevUsers => [...prevUsers, userDuplicatedatawithname]);
          handleCloseMenu();
        })
      } catch (error) {
        console.error(error.message);
        showNotification('error', t('Error_duplicate_user'));
      }
    }
  };


  // Function to get rows with routes
  const { getRowsWithRoutes } = Rows({ users, expandedRows });

  // Define columns and custom columns for the DataGrid
  const { columns, customColumns } = Columns({ expandedRows, setExpandedRows, handleClickMenu, coaches });

  const existingTheme = useTheme();

  const theme = React.useMemo(() =>
    createTheme({}, t('localeText', { returnObjects: true }), existingTheme, { direction: t('Direction'), }),
    [existingTheme],
  );

  // Determine the cache to use based on the direction
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
            {t('UserPage.Employees')}
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
                {t('UserPage.ADDANewEmployee')}
              </Button>
            </div>
            <div style={{ width: '100%' }}>
              <DataGrid
                style={{ direction: t('Direction') }}
                rows={getRowsWithRoutes()}
                columns={[...columns, ...customColumns]}
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
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={handleClickOpenEditDialog}>{t('UserPage.Edit')}</MenuItem>
                <MenuItem onClick={handleDeleteUser}>{t('UserPage.Delete')}</MenuItem>
                <MenuItem onClick={handleDuplicateUser}>{t('UserPage.Duplicate')}</MenuItem>
              </Menu>

              <UserForm
                open={openDialog}
                handleCloseDialog={handleCloseDialog}
                title={title}
                coaches={coaches}
                initialValues={newUser}
                setUsers={setUsers}
                sites={sites}
                UserAction={UserAction}
                setupdateduplicateUser={setupdateduplicateUser}
                updateduplicateUser={updateduplicateUser}
              />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}
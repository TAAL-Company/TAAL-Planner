import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DataGrid } from '@mui/x-data-grid';
import { getingData_Users, getingData_coaches, getingData_Places, insertUser, deleteUser } from '../../api/api';
import { useState, useEffect } from 'react';
import { Button, MenuItem, IconButton, Menu } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const [users, setUsers] = useState([]);
  const [UserAction, setUserAction] = useState('');
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
      } else if (role === "STUDENT" && userId) {
        const filteredUsers = usersWithStatus.filter(user => user.id === userId && userId != null);
        setUsers(filteredUsers);
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

  // Expand toggle for rows
  const handleRowExpandToggle = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get rows with additional route data when expanded
  const getRowsWithRoutes = () => {
    const rows = [];
    users.forEach((user) => {
      rows.push(user); // Push the main user row
      if (expandedRows[user.id]) {
        // Add routes as additional rows for expanded user
        user.routes.forEach((route, index) => {
          rows.push({
            id: `${user.id}-${index}`, // Unique ID for the route row
            user_name: '',
            email: '',
            name: '',
            sites: [],
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            phone: '',
            role: '',
            cognitiveProfile: '',
            coach: '',
            picture_url: null,
            routeName: route.name,
            routeOnlyOnce: route.OnlyOnce ? 'Yes' : 'No',
            isRoute: true, // Mark this row as a route row
            menu: null, // Include placeholder for menu
            expand: null, // Include placeholder for expand
            active: null, // Placeholder for active
          });
        });
      }
    });
    return rows;
  };

  const { columns, customColumns } = Columns({ expandedRows, handleRowExpandToggle, handleClickMenu, coaches });

  const existingTheme = useTheme();

  const theme = React.useMemo(() =>
    createTheme({},t('localeText', { returnObjects: true }), existingTheme, {direction: t('Direction'),}),
    [existingTheme],
  );

  // Determine the cache to use based on the direction
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
            variant="outlined" onClick={handleClickOpenDialog}>
            {t('UserPage.ADDANewEmployee')}
          </Button>
          <Box style={{ height: 600, width: '100%' }}>
            <DataGrid
              style={{ direction: t('Direction') }}
              rows={getRowsWithRoutes()}
              columns={[...columns, ...customColumns]}
              pageSize={12} //integer value representing max number of rows
              autoHeight={true}
              rowsPerPageOptions={[12]}
              loading={loading}
              // localeText={heIL.components.MuiDataGrid.defaultProps.localeText}
              components={{
                Toolbar: Toolbar,
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
          </Box>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}
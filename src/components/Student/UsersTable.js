import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DataGrid } from '@mui/x-data-grid';
import { getingData_Users, getingData_coaches, getingData_Places, insertUser } from '../../api/api';
import { deleteUser, updateUser } from '../../api/api';
import { useState, useEffect } from 'react';
import { Button, MenuItem, IconButton, Menu } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UserForm from './UserForm';

import './StudentsCard.css';

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
  };

  const handleClickOpenEditDialog = () => {
    setOpenDialog(true);
    setUserAction('edit');
    setNewUser(selectedUser);
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
    await deleteUser(selectedUser.id).then(() => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      handleCloseMenu();
    });
  };

  // Duplicate user
  const handleDuplicateUser = async () => {
    const userToDuplicate = users.find(user => user.id === selectedUser.id);

    const userDuplicatedata = {
      email: userToDuplicate.email,
      user_name: userToDuplicate.user_name,
      name: userToDuplicate.name,
      phone: userToDuplicate.phone,
      cognitiveProfileId:
        userToDuplicate.cognitiveProfile?.id || '',
      sites: userToDuplicate.sites,
      routeIds:
        userToDuplicate.routes.map((routeId) => (routeId.id)) || [],
      coachId: userToDuplicate.coach?.id || '',
      taskIds:
        userToDuplicate.tasks.map((taskId) => ({
          id: taskId?.id,
        })) || [],
      picture_url: userToDuplicate.picture_url || '',
    };

    if (userToDuplicate) {
      const userDuplicatedatawithname = { ...userDuplicatedata, name: userToDuplicate.name + '-' + new Date().getTime() };
      insertUser(userDuplicatedatawithname).then((data) => {
        setupdateduplicateUser(!updateduplicateUser);
        // setUsers(prevUsers => [...prevUsers, userDuplicatedatawithname]);
        handleCloseMenu();
      })
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

  // Columns for the DataGrid
  const columns = [
    // { field: 'id', headerName: 'ID', width: 300 },
    {
      field: 'picture_url',
      headerName: 'Avatar',
      width: 70,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip avatar rendering for route rows
        return <Avatar alt="User Avatar" src={params.value} />;
      },
    },
    { field: 'user_name', headerName: 'Username', width: 150, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    { field: 'name', headerName: 'Name', width: 150, editable: true },
    { field: 'phone', headerName: 'Phone', width: 150, editable: true },
    { field: 'role', headerName: 'Role', width: 120 },
    // { field: 'cognitiveProfile', headerName: 'Cognitive Profile', width: 200 },
    {
      field: 'coach',
      headerName: 'Coach Name',
      width: 150,
      valueGetter: (params) => {
        const coach = coaches.find(coach => coach.id === params.row.coachId);
        return coach ? coach.name : '';
      },
    },
    {
      field: 'active',
      headerName: 'Online',
      width: 120,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip active status for route rows
        return params.value ? (
          <CheckCircleIcon style={{ color: 'green' }} />
        ) : (
          <CancelIcon style={{ color: 'red' }} />
        );
      },
    },
    {
      field: 'expand',
      headerName: '',
      width: 50,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip expand icon for route rows
        return (
          <div onClick={() => handleRowExpandToggle(params.id)}>
            {expandedRows[params.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </div>
        );
      },
    },
    {
      field: 'menu',
      headerName: '',
      width: 50,
      renderCell: (params) => {
        if (params.row.isRoute) return null; // Skip menu for route rows
        return (
          <IconButton onClick={(e) => handleClickMenu(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        );
      },
    },
  ];

  // Custom columns for route data
  const customColumns = [
    { field: 'routeName', headerName: 'Route', width: 200 },
    { field: 'routeOnlyOnce', headerName: 'Once Only', width: 100 },
  ];

  return (
    <div
      style={{
        textAlign: '-webkit-center',
      }}
    >
      <Button
        style={{
          marginTop: '14px',
          marginBottom: '14px',
        }}
        variant="outlined" onClick={handleClickOpenDialog}>
        ADD A New Employee
      </Button>
      <Box style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={getRowsWithRoutes()}
          columns={[...columns, ...customColumns]}
          pageSize={12} //integer value representing max number of rows
          autoHeight={true}
          rowsPerPageOptions={[12]}
          loading={loading}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleClickOpenEditDialog}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteUser}>Delete</MenuItem>
          <MenuItem onClick={handleDuplicateUser}>Duplicate</MenuItem>
        </Menu>

        <UserForm
          open={openDialog}
          handleCloseDialog={handleCloseDialog}
          title="Add User"
          coaches={coaches}
          initialValues={newUser}
          setUsers={setUsers}
          sites={sites}
          UserAction={UserAction}
        />
      </Box>
    </div>
  );
}

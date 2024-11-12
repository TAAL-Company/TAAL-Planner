import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DataGrid } from '@mui/x-data-grid';
import { getingData_Users, getingData_coaches } from '../../api/api';
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Button, TextField, MenuItem, Select, InputLabel, FormControl, IconButton, Menu, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function DataGridDemo() {
  const [users, setUsers] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    phone: '',
    name: '',
    user_name: '',
    coachId: '',
    picture_url: '',
    Password: '',  // Add Password field
  });


  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog visibility
  const [openEditDialog, setOpenEditDialog] = useState(false); // State for edit dialog visibility

  const handleClickMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true); // Open dialog when the user clicks 'Add User'
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
  };

  const handleClickOpenEditDialog = () => {
    setOpenEditDialog(true); // Open edit dialog
    setNewUser(selectedUser); // Prepopulate fields with selected user's data
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false); // Close dialog
  };

  // Fetch users and coaches data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const usersData = await getingData_Users();
      const coachesData = await getingData_coaches();
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
        const filteredUsers = usersWithStatus.filter(user => user.coachId === userId);
        setUsers(filteredUsers);
      } else if (role === "STUDENT" && userId) {
        const filteredUsers = usersWithStatus.filter(user => user.id === userId);
        setUsers(filteredUsers);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Add a new user
  const handleAddUser = async () => {
    const newUserData = { ...newUser, coachId: newUser.coachId };
    setUsers(prevUsers => [...prevUsers, { ...newUserData, id: new Date().getTime(), active: 0 }]);
    setNewUser({ email: '', phone: '', name: '', user_name: '', coachId: '', picture_url: '', Password: '' });
    setOpenDialog(false); // Close dialog after adding user
  };

  // Update user
  const handleUpdateUser = () => {
    if (selectedUser) {
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === selectedUser.id ? { ...user, ...newUser } : user
      ));
    }
    setOpenEditDialog(false); // Close the edit dialog
    handleCloseMenu(); // Close the menu
  };

  // Delete user
  const handleDeleteUser = () => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
    handleCloseMenu();
  };

  // Duplicate user
  const handleDuplicateUser = () => {
    const userToDuplicate = users.find(user => user.id === selectedUser.id);
    if (userToDuplicate) {
      const duplicatedUser = { ...userToDuplicate, id: new Date().getTime() };
      setUsers(prevUsers => [...prevUsers, duplicatedUser]);
    }
    handleCloseMenu();
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
      rows.push(user);
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
            picture_url: '',
            routeName: route.name,
            routeOnlyOnce: route.OnlyOnce ? 'Yes' : 'No',
            isRoute: true, // Mark this row as a route row
          });
        });
      }
    });
    return rows;
  };

  // Columns for the DataGrid
  const columns = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'picture_url',
      headerName: 'Avatar',
      width: 100,
      renderCell: (params) => (
        <Avatar alt="User Avatar" src={params.value} />
      ),
    },
    { field: 'user_name', headerName: 'Username', width: 150, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    { field: 'name', headerName: 'Name', width: 150, editable: true },
    { field: 'phone', headerName: 'Phone', width: 150, editable: true },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'cognitiveProfile', headerName: 'Cognitive Profile', width: 200 },
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
      renderCell: (params) => (
        <IconButton onClick={(e) => handleClickMenu(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // Custom columns for route data
  const customColumns = [
    { field: 'routeName', headerName: 'Route', width: 200 },
    { field: 'routeOnlyOnce', headerName: 'Once Only', width: 100 },
  ];

  return (
    <>
      <Box style={{ height: 600, width: '100%' }}>
        <Button variant="contained" color="primary" onClick={handleClickOpenDialog}>
          Add User
        </Button>
        <DataGrid
          rows={getRowsWithRoutes()}
          columns={[...columns, ...customColumns]}
          pageSize={5}
          rowsPerPageOptions={[5]}
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
      </Box>

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={newUser.user_name}
            onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Phone"
            fullWidth
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"  // Set type to 'password' for secure input
            fullWidth
            value={newUser.Password}
            onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Coach</InputLabel>
            <Select
              value={newUser.coachId}
              onChange={(e) => setNewUser({ ...newUser, coachId: e.target.value })}
            >
              {coaches.map((coach) => (
                <MenuItem key={coach.id} value={coach.id}>
                  {coach.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddUser}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={newUser.user_name}
            onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Phone"
            fullWidth
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Coach</InputLabel>
            <Select
              value={newUser.coachId}
              onChange={(e) => setNewUser({ ...newUser, coachId: e.target.value })}
            >
              {coaches.map((coach) => (
                <MenuItem key={coach.id} value={coach.id}>
                  {coach.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateUser}>Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

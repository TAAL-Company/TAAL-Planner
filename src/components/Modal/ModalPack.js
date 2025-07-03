import React, { useState, useEffect } from 'react';
import './Modal.css';
import {
  insertPack,
  updatePack,
  getingData_Packs,
  getPackById,
  getingData_Routes,
  getingData_Editors
} from '../../api/api';
import { useNotification } from "../Notification/NotificationProvider";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

function ModalPack({
  setOpenModalPack,
  setFlagStudent,
  flagTest,
  setNewTitleForPack,
  siteSelected,
  language,
  packName,
  packUUID,
  setNewPack,
  requestForEditing,
  setFilteredPacksBySite,
  allroutes,
  alleditors,
  allUsers
}) {
  const { showNotification } = useNotification();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flagClickOK, setFlagClickOK] = useState(false);
  const [packTitle, setPackTitle] = useState(packName || '');
  const [packDescription, setPackDescription] = useState('');
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [availableEditors, setAvailableEditors] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState([]);
  const [selectedEditorIds, setSelectedEditorIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch available routes, editors, and users
        const siteId = JSON.parse(localStorage.getItem('MySite'))?.id;
        if (siteId) {
          const siteRoutes = allroutes.filter(route =>
            route.sites && route.sites.some(site => site.id === siteId)
          );
          setAvailableRoutes(siteRoutes);
        }
        setAvailableEditors(alleditors || []);
        setAvailableUsers(allUsers || []);

        // If editing, set the selected items
        if (requestForEditing === 'edit' || requestForEditing === 'details') {
          const packData = await getPackById(packUUID);

          // Set selected routes, editors, and users
          setSelectedRouteIds(packData.routes.map(route => route.routeId) || []);
          setSelectedEditorIds(packData.editors.map(editor => editor.id) || []);
          setSelectedUserIds(packData.students.map(student => student.id) || []);
          setPackTitle(packData.name || '');
          setPackDescription(packData.description || '');
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [allroutes, alleditors, allUsers, packUUID, requestForEditing]);

  const handleSubmitPackTitle = async (event) => {
    event.preventDefault();
    setNewTitleForPack(packTitle);
    const packData = {
      name: packTitle,
      description: packDescription,
      routeIds: selectedRouteIds,
      siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
      editorIds: selectedEditorIds,
      userIds: selectedUserIds
    };
    try {
      if (requestForEditing === 'edit' || requestForEditing === 'details') {
        await updatePack(packUUID, packData);
        showNotification("success", language !== "English" ? "Pack updated successfully" : "האריזה עודכנה בהצלחה");
      } else {
        // Create new pack and get the response
        const newPackResponse = await insertPack(packData);
        
        // Get the full pack details
        const newlyCreatedPack = await getPackById(newPackResponse.id);
        
        // Update the pack list by setting it through the setNewPack prop
        setNewPack(newlyCreatedPack);
        
        showNotification("success", language !== "English" ? "Pack created successfully" : "האריזה נוצרה בהצלחה");
      }
      setOpenModalPack(false);
    } catch (error) {
      console.error(error.message);
      showNotification("error", language !== "English" ? "Error Creating Pack" : "שגיאה ביצירת האריזה");
    }
  };

  return (
    <Dialog
      open={true}
      onClose={() => setOpenModalPack(false)}
      fullWidth
      maxWidth="md"
      dir={language !== 'English' ? 'ltr' : 'rtl'} // Dynamically set direction
    >
      <DialogTitle style={{ backgroundColor: '#ad10d4', textAlign: language !== 'English' ? 'left' : 'right' }}>
        {language !== 'English' ? 'Save Pack' : 'שמירת אריזה'}
      </DialogTitle>
      <DialogContent dividers style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <form onSubmit={handleSubmitPackTitle}>
          <div>
            <label dir={language !== 'English' ? 'ltr' : 'rtl'}>{language !== 'English' ? 'Pack name:' : ':שם האריזה'}</label>
            <input
              type="text"
              value={packTitle}
              onChange={(e) => setPackTitle(e.target.value)}
              required
              style={{ width: '100%', marginBottom: '10px' }}
              dir={language !== 'English' ? 'ltr' : 'rtl'} // Dynamically set direction
            />
          </div>
          <div>
            <label dir={language !== 'English' ? 'ltr' : 'rtl'}>{language !== 'English' ? 'Pack description:' : ':תיאור האריזה'}</label>
            <textarea
              value={packDescription}
              onChange={(e) => setPackDescription(e.target.value)}
              rows="3"
              style={{ width: '100%', marginBottom: '10px' }}
              dir={language !== 'English' ? 'ltr' : 'rtl'} // Dynamically set direction
            />
          </div>
          <div>
            <label dir={language !== 'English' ? 'ltr' : 'rtl'}>{language !== 'English' ? 'Select Routes (Ordered):' : ':בחר מסלולים (בסדר)'}</label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
              {availableRoutes.map((route) => (
                <div key={route.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <Checkbox
                    checked={selectedRouteIds.includes(route.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Add the route to the end of the selected list
                        setSelectedRouteIds([...selectedRouteIds, route.id]);
                      } else {
                        // Remove the route from the selected list
                        setSelectedRouteIds(selectedRouteIds.filter((id) => id !== route.id));
                      }
                    }}
                  />
                  <span style={{ marginLeft: '8px' }}>{route.name}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px' }}>
              <label dir={language !== 'English' ? 'ltr' : 'rtl'}>{language !== 'English' ? 'Selected Routes (Order):' : ':מסלולים שנבחרו (בסדר)'}</label>
              <ol style={{ paddingLeft: '20px' }}>
                {selectedRouteIds.map((id) => {
                  const route = availableRoutes.find((route) => route.id === id);
                  return <li key={id}>{route?.name}</li>;
                })}
              </ol>
            </div>
          </div>
          <div>
            <label dir={language !== 'English' ? 'ltr' : 'rtl'}>{language !== 'English' ? 'Select Editors:' : ':בחר עורכים'}</label>
            <Autocomplete
              multiple
              options={availableEditors}
              getOptionLabel={(option) => option.name}
              value={availableEditors.filter(editor => selectedEditorIds.includes(editor.id))}
              onChange={(event, newValue) => {
                setSelectedEditorIds(newValue.map(editor => editor.id));
              }}
              disableCloseOnSelect
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    checked={selected}
                    style={{ marginRight: 8 }}
                  />
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={language !== 'English' ? 'Editors' : 'עורכים'}
                  placeholder={language !== 'English' ? 'Select Editors' : 'בחר עורכים'}
                  dir={language !== 'English' ? 'ltr' : 'rtl'} // Dynamically set direction
                />
              )}
              style={{ marginBottom: '10px' }}
            />
          </div>
          <div>
            <label dir={language !== 'English' ? 'ltr' : 'rtl'}>{language !== 'English' ? 'Select Users:' : ':בחר משתמשים'}</label>
            <Autocomplete
              multiple
              options={availableUsers}
              getOptionLabel={(option) => option.name}
              value={availableUsers.filter(user => selectedUserIds.includes(user.id))}
              onChange={(event, newValue) => {
                setSelectedUserIds(newValue.map(user => user.id));
              }}
              disableCloseOnSelect
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    checked={selected}
                    style={{ marginRight: 8 }}
                  />
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={language !== 'English' ? 'Users' : 'משתמשים'}
                  placeholder={language !== 'English' ? 'Select Users' : 'בחר משתמשים'}
                  dir={language !== 'English' ? 'ltr' : 'rtl'} // Dynamically set direction
                />
              )}
              style={{ marginBottom: '10px' }}
            />
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenModalPack(false)} color="secondary">
          {language !== 'English' ? 'Cancel' : 'ביטול'}
        </Button>
        <Button onClick={handleSubmitPackTitle} color="primary">
          {language !== 'English' ? 'Save' : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalPack;
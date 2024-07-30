import React, { useState, useEffect } from 'react';
import './Editors.css';
import defualtSiteImg from '../../Pictures/defualtSiteImg.svg';
import {
  getingData_Editors,
  deleteEditor,
  updateEditor,
  post_cognitive_abillities,
  uploadFiles,
  getingData_Places,
  getingData_Users,
  getingData_coaches
} from '../../api/api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { insertEditor } from '../../api/api';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Modal_Dropdown from '../Modal/Modal_dropdown';
import cognitiveList from '../Form/cognitive.json';

import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { Autocomplete } from '@mui/material';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const Editors = () => {
  const [Editors, setEditors] = useState([]); // State to store the users
  const [EditorForRemove, setEditorForRemove] = useState([]); // State to store the user to be removed
  const [EditorForUpdate, setEditorForUpdate] = useState(-1); // State to store the index of the user to be updated
  const [open, setOpen] = useState(false); // State to manage the open state of the dialog
  const [openRemove, setOpenRemove] = useState(false); // State to manage the open state of the remove dialog
  const [picture, setPicture] = useState(null);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1); // State to manage the open state of the vertical three dots
  const [requestForEditing, setRequestForEditing] = useState(''); // State to store the request for editing
  const [updateAdd, setupdateAdd] = useState(false);
  const [mysitesList, setMySitesList] = useState([]);
  const [myusers, setMyusers] = useState('');
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [coaches, setcoaches] = useState([]);
  const [myrole, setrole] = useState('');

  useEffect(() => { }, [openThreeDotsVertical]);

  useEffect(() => {
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setrole(Editors[openThreeDotsVertical].role);
      setMyusers(Editors[openThreeDotsVertical].userid);
      setEditorForUpdate(openThreeDotsVertical);
      setOpen(true);
    } else if (requestForEditing === 'duplication') {
      // duplicateCoache();
    } else if (requestForEditing === 'delete') {
      setEditorForRemove(openThreeDotsVertical);
      setOpenRemove(true);
    }
  }, [requestForEditing]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setrole('');
    setMyusers('');
    setRequestForEditing('');
    setOpenThreeDotsVertical(-1);
  };

  const handleClickOpenRemove = () => {
    setOpenRemove(true);
  };

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
    setrole('');
    setMyusers('');
  };

  const handleCloseRemoveConfirm = async () => {
    let deletedUser = await deleteEditor(Editors[EditorForRemove].id);

    if (deletedUser.status === 200) {
      alert('המחיקה בוצעה בהצלחה!');
      const newEditors = [...Editors];
      newEditors.splice(EditorForRemove, 1); // Remove one element at index x
      setEditors(newEditors);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };


  function extractFilenameFromURL(url) {
    const parts = url.split('?');
    const path = parts[0]; // Get the part before the question mark
    const pathParts = path.split('/');
    const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
    return filename;
  }

  const duplicateCoache = async () => {
    const CoacheToDuplicate = {
      email: Editors[openThreeDotsVertical].email,
      name: Editors[openThreeDotsVertical].name,
      phone: Editors[openThreeDotsVertical].phone,
      picture_url: Editors[openThreeDotsVertical].picture_url || '',
    };
    try {
      if (requestForEditing === 'duplication') {
        insertEditor(CoacheToDuplicate).then((data) => {
          setEditors([data, ...Editors]);
          setupdateAdd(true);
        });
        setupdateAdd(false);
      }
    } catch (error) {
      console.error(error);
    }

    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  const handleConfirm = async () => {
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const userid = myusers;
    const googleID = document.getElementById('googleID').value;
    const role = myrole;
    console.log('role : ',role);

    if (email === '' || fullName === '') {
      alert('עליך למלא שדות חובה המסומנים בכוכבית');
    } else {
      let picture_url = '';
      try {
        if (picture) picture_url = await uploadFiles(picture, 'Editors media/picture'); //await uploadImageGD(picture)

        let myStudentsListIdonly = []
        mysitesList.map((site) => {
          myStudentsListIdonly.push(site.id)
        })

        const user = {
          email,
          name: fullName,
          googleID,
          siteIds: myStudentsListIdonly,
          role,
          phone,
          picture_url,
          password,
          userid,
        };
        console.log(user);

        if (requestForEditing === 'edit' || requestForEditing === 'details') {
          const userToUpdate = Editors[EditorForUpdate];
          updateEditor(userToUpdate.id, user).then((updatedUser) => {
            userToUpdate.name = updatedUser.data.name;
            userToUpdate.email = updatedUser.data.email;
            userToUpdate.googleID = updatedUser.data.googleID;
            userToUpdate.siteIds = updatedUser.data.siteIds;
            userToUpdate.role = updatedUser.data.role;
            userToUpdate.phone = updatedUser.data.phone;
            userToUpdate.picture_url = updatedUser.data.picture_url;
            userToUpdate.password = updatedUser.data.password;
            userToUpdate.userid = updatedUser.data.userid;

            const newUsers = [...Editors];
            setEditors(newUsers);
          });
        } else {
          console.log(user);
          insertEditor(user).then((data) => {
            setEditors([data, ...Editors]);
          });
        }
      } catch (error) {
        console.error(error);
      }

      handleClose(); // Close the dialog after the form is submitted
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setSites(await getingData_Places());
        setUsers(await getingData_Users());
        setcoaches(await getingData_coaches());
        // getData();
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_Editors();
      setEditors(usersData);
    };

    fetchData();
  }, [updateAdd]);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_Editors();
      setEditors(usersData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let tempsiteslist = openThreeDotsVertical !== -1 ? Editors[openThreeDotsVertical].sites : [];//myStudentslist = [];
    setMySitesList(tempsiteslist);
    console.log("mysitesList", mysitesList);
  }, [open]);

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });

  return (
    <CacheProvider value={cacheRtl}>
      <div
        style={{
          direction: 'rtl',
          marginTop: '14px',
          textAlign: '-webkit-center',
        }}
      >
        <Button variant='outlined' onClick={handleClickOpen}>
          הוסף משתמש חדש
        </Button>
        <Dialog open={open} onClose={handleClose}>
          {requestForEditing === 'edit' ? (
            <DialogTitle style={{ direction: 'rtl', marginTop: '10px' }}>
              משתמש עריכה
            </DialogTitle>
          ) : (
            <DialogTitle style={{ direction: 'rtl', marginTop: '10px' }}>
              משתמש חדש
            </DialogTitle>
          )}
          <DialogContent>
            <DialogContentText></DialogContentText>
            <TextField
              autoFocus
              margin='dense'
              id='email'
              label='אימייל'
              type='email'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? Editors[openThreeDotsVertical].email
                  : ''
              }
            />
            <TextField
              margin='dense'
              id='name'
              label='שם מלא'
              type='name'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? Editors[openThreeDotsVertical].name
                  : ''
              }
            />
            <TextField
              margin='dense'
              id='password'
              label='password'
              type='password'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? Editors[openThreeDotsVertical].password
                  : ''
              }
            />
            <TextField
              margin='dense'
              id='phone'
              label='מספר פלאפון'
              type='phone'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? Editors[openThreeDotsVertical].phone
                  : ''
              }
            />
            <TextField
              margin='dense'
              id='googleID'
              label='גוגל'
              type='googleID'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? Editors[openThreeDotsVertical].googleID
                  : ''
              }
            />
            <Autocomplete
              disablePortal
              id='role'
              options={[
                `ADMIN`,
                `STUDENT`,
                `EDITOR`
              ]}

              defaultValue={
                openThreeDotsVertical !== -1
                  ? Editors[openThreeDotsVertical].role
                  : ''
              }
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              getOptionLabel={(option) => option || ''}
              // sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label='בחירת מדריך' />
              )}
              onChange={(event, value) => {
                setrole(value);
              }}
              value={
                openThreeDotsVertical !== -1
                  ? Editors[openThreeDotsVertical].role
                  : myrole
              }
            />
            <DialogContent style={{ direction: 'rtl' }}>
              user
            </DialogContent>
            {myrole==="EDITOR"?(<div className='allStudent'>
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={openThreeDotsVertical !== -1
                    ? Editors[openThreeDotsVertical].userid
                    : myusers}
                  defaultValue={openThreeDotsVertical !== -1
                    ? Editors[openThreeDotsVertical].userid
                    : ''}
                  onChange={(event, value) => {
                    setMyusers(value)
                  }}
                >
                  {coaches.map((value, index) => {
                    return (
                      <FormControlLabel
                        key={value.id}
                        value={value.id}
                        name={value.name}
                        label={value.name}
                        control={<Radio />}
                      />
                    )
                  }
                  )}
                </RadioGroup>
              </FormControl>
            </div>):(<></>)}
            {myrole==="STUDENT"?(<div className='allStudent'>
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={openThreeDotsVertical !== -1
                    ? Editors[openThreeDotsVertical].userid
                    : myusers}
                  defaultValue={openThreeDotsVertical !== -1
                    ? Editors[openThreeDotsVertical].userid
                    : ''}
                  onChange={(event, value) => {
                    setMyusers(value)
                  }}
                >
                  {users.map((value, index) => {
                    return (
                      <FormControlLabel
                        key={value.id}
                        value={value.id}
                        name={value.name}
                        label={value.name}
                        control={<Radio />}
                      />
                    )
                  }
                  )}
                </RadioGroup>
              </FormControl>
            </div>):(<></>)}
            {/* <h1 label='בחירת מדריך' /> */}
            <DialogContent style={{ direction: 'rtl' }}>
              בחר אתרים
            </DialogContent>
            <div className='allStudent'>
              {sites.map((value, index) => {
                return (
                  <label key={index} className='list-group-item'>
                    <input
                      style={{ marginLeft: '10px' }}
                      dir='ltr'
                      onChange={() => {
                        console.log("testing", mysitesList);
                        // saveCheckbox(value)
                        const isStudentInList = mysitesList.some((student) => student.id === value.id);
                        console.log('isStudentInList', isStudentInList);
                        if (isStudentInList) {
                          // Student exists in the list, remove the student with the matching id
                          const updatedSitesList = mysitesList.filter((student) => student.id !== value.id);
                          setMySitesList(updatedSitesList);
                        } else {
                          // Student does not exist in the list, add the new student
                          const updatedSitesList = [...mysitesList, value];
                          setMySitesList(updatedSitesList);
                        }
                      }}
                      className='form-check-input me-1'
                      type='checkbox'
                      id={value.name}
                      name={value.name}
                      value=''
                      checked={mysitesList.some((student) => student.id === value.id)}
                    ></input>
                    {value.name}
                  </label>
                );
              })}
            </div>
            {/* <div style={{ direction: 'rtl', marginTop: '10px' }}>תמונה:</div>
            <div>
              <input
                label='שם מלא'
                accept='image/*'
                id='image-input'
                type='file'
                onChange={(e) => setPicture(e.target.files[0])}
              />
              {users[openThreeDotsVertical]?.picture_url ? (
                <div className='selectedFileContainer'>
                  <div className='selectedFileTitle'>:תמונה שנבחרה</div>
                  <div style={{ marginBottom: '1rem' }}>
                    {typeof users[openThreeDotsVertical]?.picture_url ===
                    'string'
                      ? extractFilenameFromURL(
                          users[openThreeDotsVertical]?.picture_url
                        )
                      : users[openThreeDotsVertical]?.name}
                  </div>
                  <div className='thumbnail'>
                    {typeof users[openThreeDotsVertical]?.picture_url ===
                      'string' && (
                      <img
                        src={users[openThreeDotsVertical]?.picture_url}
                        className='thumbnailImg'
                        alt=''
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  תמונה שנבחרה: לא נמצא קובץ תמונה
                </div>
              )}
            </div> */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>ביטול</Button>
            <Button onClick={handleConfirm}>שמירה</Button>
          </DialogActions>
        </Dialog>
        {/* sure for Remove */}
        <Dialog
          open={openRemove}
          onClose={handleCloseRemove}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>{'מחיקת משתמש'}</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              האם אתה בטוח במחיקת המשתמש?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRemove}>ביטול</Button>
            <Button onClick={handleCloseRemoveConfirm} autoFocus>
              מחיקה
            </Button>
          </DialogActions>
        </Dialog>
        {/* end cencel */}
        <div className='user_cards_warpper'>
          {Editors.map((user, index) => (
            <div key={user.id} className='user_card'>
              <div className='dropdownThreeDotsUsers'>
                <button
                  className='threeDotsVerticalEng'
                  onClick={() => clickOnhreeDotsVerticaIcont(index)}
                >
                  <BsThreeDotsVertical />
                </button>

                {openThreeDotsVertical === index ? (
                  <Modal_Dropdown
                    setRequestForEditing={setRequestForEditing}
                    setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                    editable={true}
                    Reproducible={false}
                    details={true}
                    erasable={true}
                  />
                ) : (
                  <></>
                )}
              </div>
              <img
                src={user.picture_url || defualtSiteImg}
                alt='Avatar'
                style={{ width: '100%' }}
              />
              <div className='users_cards_container' key={user.id}>
                <h5>{user.name}</h5>
                <p>{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CacheProvider>
  );
};

export default Editors;

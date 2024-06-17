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

const Editors = () => {
  const [users, setUsers] = useState([]); // State to store the users
  const [userForRemove, setUserForRemove] = useState([]); // State to store the user to be removed
  const [userForUpdate, setUserForUpdate] = useState(-1); // State to store the index of the user to be updated
  const [open, setOpen] = useState(false); // State to manage the open state of the dialog
  const [openRemove, setOpenRemove] = useState(false); // State to manage the open state of the remove dialog
  const [picture, setPicture] = useState(null);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1); // State to manage the open state of the vertical three dots
  const [requestForEditing, setRequestForEditing] = useState(''); // State to store the request for editing
  const [updateAdd, setupdateAdd] = useState(false);
  const [myStudentsList, setMyStudentsList] = useState([]);
  const [student, setStudent] = useState([]);
  const [role, setrole] = useState('');

  useEffect(() => { }, [openThreeDotsVertical]);

  useEffect(() => {
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setUserForUpdate(openThreeDotsVertical);
      setOpen(true);
    } else if (requestForEditing === 'duplication') {
      // duplicateCoache();
    } else if (requestForEditing === 'delete') {
      setUserForRemove(openThreeDotsVertical);
      setOpenRemove(true);
    }
  }, [requestForEditing]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
  };

  const handleCloseRemoveConfirm = async () => {
    let deletedUser = await deleteEditor(users[userForRemove].id);

    if (deletedUser.status === 200) {
      alert('המחיקה בוצעה בהצלחה!');
      const newUsers = [...users];
      newUsers.splice(userForRemove, 1); // Remove one element at index x
      setUsers(newUsers);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  const handleJson = () => {
    cognitiveList.map(async (cognitive) => {
      let cognitiveTemp = {
        trait: cognitive.trait === undefined ? '' : cognitive.trait,
        requiredField: cognitive.RequiredField === 'לא' ? false : true,
        score: cognitive.score === undefined ? '' : cognitive.score,
        general: cognitive.general === undefined ? '' : cognitive.general,
        category: cognitive.category === undefined ? '' : cognitive.category,
        classification:
          cognitive.classification === undefined
            ? ''
            : cognitive.classification,
        ML: cognitive.ML === 'לא' ? false : true,
      };

      await post_cognitive_abillities(cognitiveTemp);
    });
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
      email: users[openThreeDotsVertical].email,
      name: users[openThreeDotsVertical].name,
      phone: users[openThreeDotsVertical].phone,
      picture_url: users[openThreeDotsVertical].picture_url || '',
    };
    try {
      if (requestForEditing === 'duplication') {
        insertEditor(CoacheToDuplicate).then((data) => {
          setUsers([data, ...users]);
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

    if (email === '' || fullName === '') {
      alert('עליך למלא שדות חובה המסומנים בכוכבית');
    } else {
      let picture_url;
      try {
        if (picture) picture_url = await uploadFiles(picture, 'Editors media/picture'); //await uploadImageGD(picture)

        let myStudentsListIdonly =[]
        myStudentsList.map((site)=>{
          myStudentsListIdonly.push(site.id)
        })

        const user = {
          email,
          name: fullName,
          googleID: phone,
          siteIds: myStudentsListIdonly,
          role
        };

        if (requestForEditing === 'edit' || requestForEditing === 'details') {
          const userToUpdate = users[userForUpdate];
          updateEditor(userToUpdate.id, user).then((updatedUser) => {
            userToUpdate.name = updatedUser.data.name;
            userToUpdate.email = updatedUser.data.email;
            userToUpdate.googleID = updatedUser.data.googleID;
            userToUpdate.siteIds = updatedUser.data.siteIds;
            userToUpdate.role = updatedUser.data.role;

            const newUsers = [...users];
            setUsers(newUsers);
          });
        } else {
          console.log(user);
          insertEditor(user).then((data) => {
            setUsers([data, ...users]);
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
        setStudent(await getingData_Places());
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
      setUsers(usersData);
    };

    fetchData();
  }, [updateAdd]);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_Editors();
      setUsers(usersData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let tempStudentslist = [];//myStudentslist = [];
    setMyStudentsList(tempStudentslist);
    console.log("myStudentsList", myStudentsList);
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
                  ? users[openThreeDotsVertical].email
                  : ''
              }
            />
            <TextField
              autoFocus
              margin='dense'
              id='name'
              label='שם מלא'
              type='name'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].name
                  : ''
              }
            />
            <TextField
              autoFocus
              margin='dense'
              id='phone'
              label='מספר פלאפון'
              type='phone'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].googleID
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
                  ? users[openThreeDotsVertical].role
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
                  ? users[openThreeDotsVertical].role
                  : ''
              }
            />
            {/* <h1 label='בחירת מדריך' /> */}
            <DialogContent style={{ direction: 'rtl' }}>
              בחר אתרים
            </DialogContent>
            <div className='allStudent'>
              {student.map((value, index) => {
                return (
                  <label key={index} className='list-group-item'>
                    <input
                      style={{ marginLeft: '10px' }}
                      dir='ltr'
                      onChange={() => {
                        console.log("testing", myStudentsList);
                        // saveCheckbox(value)
                        const isStudentInList = myStudentsList.some((student) => student.id === value.id);
                        console.log('isStudentInList', isStudentInList);
                        if (isStudentInList) {
                          // Student exists in the list, remove the student with the matching id
                          const updatedStudentsList = myStudentsList.filter((student) => student.id !== value.id);
                          setMyStudentsList(updatedStudentsList);
                        } else {
                          // Student does not exist in the list, add the new student
                          const updatedStudentsList = [...myStudentsList, value];
                          setMyStudentsList(updatedStudentsList);
                        }
                      }}
                      className='form-check-input me-1'
                      type='checkbox'
                      id={value.name}
                      name={value.name}
                      value=''
                      checked={myStudentsList.some((student) => student.id === value.id)}
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
          {users.map((user, index) => (
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

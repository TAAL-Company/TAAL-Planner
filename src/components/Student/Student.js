import React, { useState, useEffect } from 'react';
import './StudentsCard.css';
import defualtSiteImg from '../../Pictures/defualtSiteImg.svg';
import {
  getingData_Users,
  deleteUser,
  updateUser,
  post_cognitive_abillities,
  getingData_coaches,
  uploadFiles,
} from '../../api/api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { insertUser } from '../../api/api';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ModalDropdown from '../Modal/Modal_Dropdown';
import cognitiveList from '../Form/cognitive.json';
import Autocomplete from '@mui/material/Autocomplete';

import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

const Cards = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [coach, setCoach] = useState([]);
  const [updateAdd, setupdateAdd] = useState(false);
  const [manager, setmanager] = useState(null);
  const [picture, setPicture] = useState(null);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [studentForAction, setStudentForAction] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const coachesData = await getingData_coaches();
      setCoaches(coachesData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setStudentForAction(openThreeDotsVertical);
      setOpen(true);
    } else if (requestForEditing === 'duplication') {
    } else if (requestForEditing === 'delete') {
      setStudentForAction(openThreeDotsVertical);
      setOpenRemove(true);
    }
  }, [requestForEditing]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setmanager(null);
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
    let deletedUser = await deleteUser(users[studentForAction].id);

    if (deletedUser.status === 200) {
      alert('המחיקה בוצעה בהצלחה!');
      const newUsers = [...users];
      newUsers.splice(studentForAction, 1); // remove one element at index x
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

      let post_cognitive = await post_cognitive_abillities(cognitiveTemp);
    });
  };

  const handleConfirm = async () => {
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('name').value;
    const user_name = document.getElementById('userName').value;
    // const coach = document.getElementById("coach").value;
    // const coachId = document.getElementById("coach").value;

    if (email === '' || fullName === '') {
      alert('עליך למלא שדות חובה המסומנים בכוכבית');
    } else {
      let picture_url;
      try {
        if (picture) picture_url = await uploadFiles(picture, 'Worker media'); //await uploadImageGD(picture)

        const user = {
          email,
          name: fullName,
          user_name,
          coachId: coach.id,
          picture_url,
        };

        if (requestForEditing === 'edit' || requestForEditing === 'details') {
          const userToUpdate = users[studentForAction];
          updateUser(userToUpdate.id, user).then((updatedUser) => {
            userToUpdate.name = updatedUser.data.name;
            userToUpdate.email = updatedUser.data.email;
            userToUpdate.user_name = updatedUser.data.user_name;
            userToUpdate.coach = updatedUser.data.coach;
            userToUpdate.picture_url = updatedUser.data.picture_url;

            const newUsers = [...users];
            setUsers(newUsers);
          });
        } else {
          insertUser(user).then((data) => {
            data.picture_url = user.picture_url;
            updateUser(data.id, data).then((updatedUser) => {
              setUsers((prev) => [updatedUser.data, ...prev]);
              setupdateAdd(true);
            });
          });
          setupdateAdd(false);
        }
      } catch (error) {
        console.error(error);
      }
      handleClose(); // Close the dialog after the form is submitted}
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_Users();
      setUsers(usersData);
    };

    fetchData();
  }, [updateAdd]);

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
        {/* <Button variant="outlined" onClick={handleJson}>
        הכנסת יכולות קוגנטיביות
      </Button> */}
        <Button variant='outlined' onClick={handleClickOpen}>
          הוסף עובד חדש
        </Button>
        <Dialog open={open} onClose={handleClose}>
          {requestForEditing === 'edit' ? (
            <DialogTitle style={{ direction: 'rtl', marginTop: '10px' }}>
              עריכה עובד
            </DialogTitle>
          ) : (
            <DialogTitle style={{ direction: 'rtl', marginTop: '10px' }}>
              עובד חדש
            </DialogTitle>
          )}

          <DialogContent>
            <DialogContentText>
              {/* To subscribe to this website, please enter your email address here.
            We will send updates occasionally. */}
            </DialogContentText>
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
              margin='dense'
              id='userName'
              label='שם משתמש'
              type='name'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].user_name
                  : ''
              }
            />
            <Autocomplete
              disablePortal
              id='coach'
              options={coaches}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.name}
                </li>
              )}
              getOptionLabel={(option) => option.name || ''}
              // sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label='בחירת מדריך' />
              )}
              onChange={(event, value) => {
                setCoach(value);
                setmanager(value);
              }}
              defaultValue={
                openThreeDotsVertical !== -1 &&
                coaches.find(
                  (coach) =>
                    coach.id === users[openThreeDotsVertical]?.coach?.id
                )
                  ? users[openThreeDotsVertical]?.coach
                  : manager !== null
                  ? manager
                  : null
              }
              value={
                (openThreeDotsVertical !== -1 &&
                  coaches.find(
                    (coach) =>
                      coach.id === users[openThreeDotsVertical]?.coach?.id
                  )) ||
                (manager !== null ? manager : null)
              }
            />
            <div style={{ direction: 'rtl', marginTop: '10px' }}>תמונה:</div>

            <input
              label='שם מלא'
              accept='image/*'
              id='image-input'
              type='file'
              onChange={(e) => setPicture(e.target.files[0])}
            />
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
            <Button onClick={handleCloseRemove}>cancel</Button>
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
                  <ModalDropdown
                    setRequestForEditing={setRequestForEditing}
                    setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                    editable={true}
                    Reproducible={true}
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
              <div className='users_cards_container' key={user.name}>
                <h5>{user.name}</h5>
                {/* <p>{user.description}</p> */}
                <p>{user.email}</p>
                {/* <button
                className="btn btn-primary"
                id="dropdown-basic-button"

                // onClick={() => myUsersfunc(value)}
              >
                מידע נוסף
              </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CacheProvider>
  );
};

export default Cards;

import React, { useState, useEffect } from 'react';
import './Coaches.css';
import defualtSiteImg from '../../Pictures/defualtSiteImg.svg';
import {
  getingData_coaches,
  deleteCoach,
  updateCoach,
  post_cognitive_abillities,
  uploadFiles,
} from '../../api/api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { insertCoach } from '../../api/api';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Modal_Dropdown from '../Modal/Modal_Dropdown';
import cognitiveList from '../Form/cognitive.json';

import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from 'stylis'

const Coaches = () => {
  const [users, setUsers] = useState([]); // State to store the users
  const [userForRemove, setUserForRemove] = useState([]); // State to store the user to be removed
  const [userForUpdate, setUserForUpdate] = useState(-1); // State to store the index of the user to be updated
  const [open, setOpen] = useState(false); // State to manage the open state of the dialog
  const [openRemove, setOpenRemove] = useState(false); // State to manage the open state of the remove dialog
  const [picture, setPicture] = useState(null);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1); // State to manage the open state of the vertical three dots
  const [requestForEditing, setRequestForEditing] = useState(''); // State to store the request for editing

  useEffect(() => {
    console.log('student openThreeDotsVertical: ', openThreeDotsVertical);
  }, [openThreeDotsVertical]);

  useEffect(() => {
    console.log('student requestForEditing: ', requestForEditing);

    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setUserForUpdate(openThreeDotsVertical);
      setOpen(true);
    } else if (requestForEditing === 'duplication') {
      console.log('openThreeDotsVertical', openThreeDotsVertical);
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
    console.log('DELETE:', userForRemove);
    let deletedUser = await deleteCoach(users[userForRemove].id);

    console.log('deletedUser:', deletedUser);
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

      let post_cognitive = await post_cognitive_abillities(cognitiveTemp);
      console.log('post_cognitive', post_cognitive);
    });
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
        if (picture) picture_url = await uploadFiles(picture, 'Coaches media');//await uploadImageGD(picture)

        const user = {
          email,
          name: fullName,
          phone,
          picture_url,
        };

        if (requestForEditing === 'edit' || requestForEditing === 'details') {
          const userToUpdate = users[userForUpdate];
          updateCoach(userToUpdate.id, user).then((updatedUser) => {
            userToUpdate.name = updatedUser.data.name;
            userToUpdate.email = updatedUser.data.email;
            userToUpdate.phone = updatedUser.data.phone;
            userToUpdate.picture_url = updatedUser.data.picture_url;

            const newUsers = [...users];
            setUsers(newUsers);
          });
        } else {
          insertCoach(user).then((data) => {
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
      const usersData = await getingData_coaches();
      setUsers(usersData);
    };

    fetchData();
  }, []);

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin]
  });

  return (
    <CacheProvider value={cacheRtl}>
    <div style={{direction: "rtl", marginTop: '14px', textAlign: '-webkit-center' }}>
      <Button variant='outlined' onClick={handleClickOpen}>
        הוסף משתמש חדש
      </Button>
      <Dialog open={open} onClose={handleClose}>
      {requestForEditing === 'edit' ? <DialogTitle style={{ direction: "rtl", marginTop: "10px" }}>משתמש עריכה</DialogTitle> : <DialogTitle style={{ direction: "rtl", marginTop: "10px" }}>משתמש חדש</DialogTitle>}
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
                ? users[openThreeDotsVertical].phone
                : ''
            }
          />
          <div style={{ direction: "rtl", marginTop: "10px" }} >תמונה:</div>

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

export default Coaches;

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
import ModalDropdown from '../Modal/Modal_dropdown';
import cognitiveList from '../Form/cognitive.json';
import Autocomplete from '@mui/material/Autocomplete';

import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { Password } from '@mui/icons-material';
import InputFileUpload from '../InputFileUpload/InputFileUpload';
import BasicSelect from '../Gallery/BasicSelect';
import { FcMultipleInputs } from 'react-icons/fc';
import { getBlobsInContainer } from '../azureBlob';

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
  const [Phone, setPhone] = useState();

  const [language, setLanguage] = useState('Hebrew');
  const [addUserButtonText, setAddUserButtonText] = useState('הוסף עובד חדש');
  const [addUserButtonError, setAddUserButtonError] = useState('עליך למלא שדות חובה המסומנים בכוכבית');
  const [deleteSuccess, setDeleteSuccess] = useState(' המחיקה בוצעה בהצלחה!');

  const [Foldersite, setFoldersite] = useState('general');
  const [blobList, setBlobList] = useState([]);
  const [sortedUrls, setSortedUrls] = useState({});
  const [folderNames, setFolderNames] = useState([]);

  useEffect(async () => {
    // prepare UI for results
    setBlobList(await getBlobsInContainer());
  }, []);
  useEffect(() => {
    for (const key in blobList) {
      const url = blobList[key];
      const parts = url.split('/');
      let folderName = 'general';

      const imageIndex = parts.indexOf('images');
      if (imageIndex !== -1 && imageIndex + 2 < parts.length) {
        folderName = parts[imageIndex + 1];
      }

      let fileType = getFileType(url);
      let fileTypeFolder = '';

      if (['jpeg', 'png', 'jpg', 'webp'].includes(fileType)) {
        fileTypeFolder = 'pictures';
      } else if (['aac', 'mp3', 'wav'].includes(fileType)) {
        fileTypeFolder = 'audio';
      }

      sortedUrls[folderName] = sortedUrls[folderName] || {};
      sortedUrls[folderName][fileTypeFolder] = sortedUrls[folderName][fileTypeFolder] || {};
      sortedUrls[folderName][fileTypeFolder][key] = url;
    }
    console.log("sortedUrls", Object.keys(sortedUrls));
    console.log("sortedUrls- 2", sortedUrls);

    if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
      setFolderNames(Object.keys(sortedUrls));
    } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "STUDENT" || JSON.parse(sessionStorage.getItem('jwt'))?.role === "EDITOR") {
      const usersites = JSON.parse(sessionStorage.getItem('jwt')).sites;
      console.log("usersites", usersites);
      const filteredSortedUrls = Object.keys(sortedUrls).filter(url => {
        console.log("url", url);
        return usersites.some(site => site.nameInEnglish === url)
      });
      console.log(filteredSortedUrls);
      setFolderNames(filteredSortedUrls);
    }
  }, [blobList]);

  const getFileType = (url) => {
    if (typeof url === 'string') {
      const parts = url.split('.');
      const extension = parts[parts.length - 1];
      const fileType = extension.toLowerCase();

      return fileType;
    } else {
      return 'unknown';
    }
  };

  useEffect(() => {
    setLanguage(sessionStorage.getItem('language'));

    if (sessionStorage.getItem('language') == 'English') {
      setAddUserButtonText('Add a new employee');
      setAddUserButtonError('Please fill in the required fields marked with *');
      setDeleteSuccess('The deletion was successful!');
    } else if (sessionStorage.getItem('language') == 'Hebrew') {
      setAddUserButtonText('הוסף עובד חדש');
      setAddUserButtonError('עליך למלא שדות חובה המסומנים בכוכבית');
      setDeleteSuccess('המחיקה בוצעה בהצלחה!');
    } else {
      setAddUserButtonText('הוסף עובד חדש');
      setAddUserButtonError('עליך למלא שדות חובה המסומנים בכוכבית');
      setDeleteSuccess('המחיקה בוצעה בהצלחה!');
    }
  })


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
      setStudentForAction(openThreeDotsVertical);
      duplicateUser();
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
      alert(deleteSuccess);
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

  const duplicateUser = async () => {
    const userToDuplicate = {
      email: users[openThreeDotsVertical].email,
      user_name: users[openThreeDotsVertical].user_name,
      name: users[openThreeDotsVertical].name,
      phone: users[openThreeDotsVertical].phone,
      cognitiveProfileId:
        users[openThreeDotsVertical].cognitiveProfile?.id || '',
      siteIds:
        users[openThreeDotsVertical].sites.map((siteId) => ({
          id: siteId?.id,
        })) || [],
      routeIds:
        users[openThreeDotsVertical].routes.map((routeId) => ({
          id: routeId?.id,
        })) || [],
      coachId: users[openThreeDotsVertical].coach?.id || '',
      taskIds:
        users[openThreeDotsVertical].tasks.map((taskId) => ({
          id: taskId?.id,
        })) || [],
      picture_url: users[openThreeDotsVertical].picture_url || '',
    };
    try {
      if (requestForEditing === 'duplication') {
        insertUser(userToDuplicate).then((data) => {
          data.picture_url = userToDuplicate.picture_url;
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

    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  const handleConfirm = async () => {
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('name').value;
    const user_name = document.getElementById('userName').value;
    const phone = document.getElementById('phone').value;
    const Password = document.getElementById('password').value;
    // const coach = document.getElementById("coach").value;
    // const coachId = document.getElementById("coach").value;

    if (email === '' || fullName === '') {
      alert(addUserButtonError);
    } else {
      let picture_url;
      try {
        if (picture) picture_url = await uploadFiles(picture, 'Worker media/picture',Foldersite); //await uploadImageGD(picture)

        const user = {
          email,
          phone,
          name: fullName,
          user_name,
          coachId: coach.id,
          picture_url,
          Password
        };
        console.log('user : ', user);
        if (requestForEditing === 'edit' || requestForEditing === 'details') {
          const userToUpdate = users[studentForAction];
          updateUser(userToUpdate.id, user).then((updatedUser) => {
            userToUpdate.name = updatedUser.data.name;
            userToUpdate.email = updatedUser.data.email;
            userToUpdate.phone = updatedUser.data.phone;
            userToUpdate.user_name = updatedUser.data.user_name;
            userToUpdate.coach = updatedUser.data.coach;
            userToUpdate.picture_url = updatedUser.data.picture_url;
            userToUpdate.Password = updatedUser.data.Password;

            const newUsers = [...users];
            setUsers(newUsers);
          });
        } else {
          console.log('user : ', user);
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

  function extractFilenameFromURL(url) {
    const parts = url.split('?');
    const path = parts[0]; // Get the part before the question mark
    const pathParts = path.split('/');
    const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
    return filename;
  }

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_Users();
      if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
        setUsers(usersData);
      } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "EDITOR") {
        const usersDatafilterbycoachId = usersData.filter((user) => user.coachId == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
        setUsers(usersDatafilterbycoachId);
      }else if(JSON.parse(sessionStorage.getItem('jwt'))?.role == "STUDENT"){
        const usersDatafilterbycoachId = usersData.filter((user)=>user.id == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
        setUsers(usersDatafilterbycoachId);
      }
    };

    fetchData();
  }, [updateAdd]);

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  const cache = createCache({
    key: language === 'Hebrew' ? 'muirtl' : 'muiltr',
    stylisPlugins: language === 'Hebrew' ? [prefixer, rtlPlugin] : [prefixer],
  });

  return (
    <CacheProvider value={cache}>
      <div
        style={{
          direction: language === 'Hebrew' ? 'rtl' : 'ltr',
          marginTop: '14px',
          textAlign: '-webkit-center',
        }}
      >
        {/* <Button variant="outlined" onClick={handleJson}>
        הכנסת יכולות קוגנטיביות
      </Button> */}
        <Button variant='outlined' onClick={handleClickOpen}>
          {addUserButtonText}
        </Button>
        <Dialog open={open} onClose={handleClose}>
          {requestForEditing === 'edit' ? (
            <DialogTitle style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr', marginTop: '10px' }}>
              {language === 'Hebrew' ? 'עריכה עובד' : 'Edit Employee'}
            </DialogTitle>
          ) : (
            <DialogTitle style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr', marginTop: '10px' }}>
              {language === 'Hebrew' ? 'עובד חדש' : 'New Employee'}
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
              label={language === 'Hebrew' ? 'אימייל' : 'Email'}
              type='email'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].email
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
            />
            <TextField
              margin='dense'
              id='name'
              label={language === 'Hebrew' ? 'שם מלא' : 'Full Name'}
              type='name'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].name
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
            />
            <TextField
              margin='dense'
              id='phone'
              label={language === 'Hebrew' ? 'טלפון' : 'Phone'}
              type='phone'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].phone
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
            />
            <TextField
              margin='dense'
              id='userName'
              label={language === 'Hebrew' ? 'שם משתמש' : 'Username'}
              type='name'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].user_name
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
            />
            <TextField
              margin='dense'
              id='password'
              label={language === 'Hebrew' ? 'סיסמה' : 'Password'}
              type='password'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? users[openThreeDotsVertical].password
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
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
                <TextField {...params} label={language === 'Hebrew' ? 'בחירת מדריך' : 'Select Coach'} />
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
            <div style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr', marginTop: '10px' }}>
              {language === 'Hebrew' ? 'תמונה:' : 'Picture:'}
            </div>
            <div>
            <h6>
              {language === 'English'
                ? 'Select where to save picture / voice'
                : ':בחר היכן לשמור תמונה/קול'}
              <FcMultipleInputs />
            </h6>
            <BasicSelect setFoldersite={setFoldersite} folderlist={folderNames} />
              <InputFileUpload setPicture={setPicture} language={language === 'Hebrew' ? 'English' : 'Hebrew'} />
              {/* <input
                label={language === 'Hebrew' ? 'שם מלא' : 'Full Name'}
                accept='image/*'
                id='image-input'
                type='file'
                onChange={(e) => setPicture(e.target.files[0])}
              /> */}
              {users[openThreeDotsVertical]?.picture_url ? (
                <div className='selectedFileContainer'>
                  <div className='selectedFileTitle'>
                    {language === 'Hebrew' ? ':תמונה שנבחרה' : 'Selected Picture:'}
                  </div>
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
                  {language === 'Hebrew' ? 'תמונה שנבחרה: לא נמצא קובץ תמונה' : 'Selected Picture: No image file found'}
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{language === 'Hebrew' ? 'ביטול' : 'Cancel'}</Button>
            <Button onClick={handleConfirm}>{language === 'Hebrew' ? 'שמירה' : 'Save'}</Button>
          </DialogActions>
        </Dialog>
        {/* sure for Remove */}
        <Dialog
          open={openRemove}
          onClose={handleCloseRemove}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            {language === 'Hebrew' ? 'מחיקת משתמש' : 'Delete User'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              {language === 'Hebrew' ? 'האם אתה בטוח במחיקת המשתמש?' : 'Are you sure you want to delete the user?'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRemove}>{language === 'Hebrew' ? 'ביטול' : 'Cancel'}</Button>
            <Button onClick={handleCloseRemoveConfirm} autoFocus>
              {language === 'Hebrew' ? 'מחיקה' : 'Delete'}
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


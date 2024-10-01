import React, { useState, useEffect } from 'react';
import {
  deleteSites,
  getingData_Places,
  insertSite,
  updateSite,
  uploadFiles,
} from '../../api/api';
import './placesCards.css';
import defualtSiteImg from '../../Pictures/defualtSiteImg.svg';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { BsThreeDotsVertical } from 'react-icons/bs';
import ModalDropdown from '../Modal/Modal_dropdown';

import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import InputFileUpload from '../InputFileUpload/InputFileUpload';

const PlacesCards = () => {
  const [places, setPlaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [picture, setPicture] = useState(null);

  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [studentForAction, setStudentForAction] = useState('');
  const [updateAdd, setupdateAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);

  const [language, setLanguage] = useState('Hebrew');
  const [addPlaceButtonText, setAddPlaceButtonText] = useState('הוספת אתר חדש');
  const [addUserButtonError, setAddUserButtonError] = useState('עליך למלא שדות חובה המסומנים בכוכבית');
  const [confermdelete, setconfermdelete] = useState('המחיקה בוצעה בהצלחה!');
  const [addImageError, setAddImage] = useState('הוספת תמונה');

  useEffect(() => {
    setLanguage(sessionStorage.getItem('language'));

    if (sessionStorage.getItem('language') == 'English') {
      setAddPlaceButtonText('Add a new site');
      setAddUserButtonError('Please fill in the required fields marked with a star');
      setconfermdelete('The deletion was successful!');
      setAddImage('Add image');
    } else if (sessionStorage.getItem('language') == 'Hebrew') {
      setAddPlaceButtonText('הוספת אתר חדש');
      setAddUserButtonError('עליך למלא שדות חובה המסומנים בכוכבית');
      setconfermdelete('המחיקה בוצעה בהצלחה!');
      setAddImage('הוספת תמונה');
    } else {
      setAddPlaceButtonText('הוספת אתר חדש');
      setAddUserButtonError('עליך למלא שדות חובה המסומנים בכוכבית');
      setconfermdelete('המחיקה בוצעה בהצלחה!');
      setAddImage('הוספת תמונה');
    }
  })

  const cache = createCache({
    key: language === 'Hebrew' ? 'muirtl' : 'muiltr',
    stylisPlugins: language === 'Hebrew' ? [prefixer, rtlPlugin] : [prefixer],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRequestForEditing('');
    setOpenThreeDotsVertical(-1);
  };

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  const handleCloseRemoveConfirm = async () => {
    let deletedPlace = await deleteSites(places[studentForAction].id);

    if (deletedPlace.status === 200) {
      alert(confermdelete);
      const newPlaces = [...places];
      newPlaces.splice(studentForAction, 1); // remove one element at index x
      setPlaces(newPlaces);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  const duplicatePlace = async () => {
    const PlaceToDuplicate = {
      name: places[openThreeDotsVertical].name,
      nameInEnglish: places[openThreeDotsVertical].nameInEnglish,
      description: places[openThreeDotsVertical].description,
      picture_url: places[openThreeDotsVertical].picture_url || '',
    };
    try {
      if (requestForEditing === 'duplication') {
        insertSite(PlaceToDuplicate).then((data) => {
          data.picture_url = PlaceToDuplicate.picture_url;
          updateSite(data.id, data).then((updatedSite) => {
            setPlaces((prev) => [updatedSite.data, ...prev]);
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
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const nameInEnglish = document.getElementById('nameInEnglish').value;

    if (name === '' || description === '') {
      alert(addUserButtonError);
    } else {
      let picture_url;
      try {
        if (picture) {
          picture_url = await uploadFiles(picture, 'Site media/picture', name);
          const place = {
            name,
            description,
            picture_url,
            nameInEnglish
          };
  
          if (requestForEditing === 'edit' || requestForEditing === 'details') {
            const placeToUpdate = places[studentForAction];
            console.log('placeToUpdate', placeToUpdate);
            updateSite(placeToUpdate.id, place).then((updatedPlace) => {
              placeToUpdate.name = updatedPlace.data.name;
              placeToUpdate.description = updatedPlace.data.description;
              placeToUpdate.picture_url = updatedPlace.data.picture_url;
              placeToUpdate.nameInEnglish = updatedPlace.data.nameInEnglish;
              const newplaces = [...places];
              setPlaces(newplaces);
            });
          } else {
            insertSite(place).then((data) => {
              data.picture_url = place.picture_url;
              updateSite(data.id, data).then((updatedSite) => {
                setPlaces((prev) => [updatedSite.data, ...prev]);
                setupdateAdd(true);
              });
            });
            setupdateAdd(false);
          }
        }
        else {
          alert(addImageError);
        }
      } catch (error) {
        console.error(error);
      }
      handleClose(); // Close the dialog after the form is submitted
    }
  };
  useEffect(() => {
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setStudentForAction(openThreeDotsVertical);
      setOpen(true);
    } else if (requestForEditing === 'duplication') {
      setStudentForAction(openThreeDotsVertical);
      duplicatePlace();
    } else if (requestForEditing === 'delete') {
      setStudentForAction(openThreeDotsVertical);
      setOpenRemove(true);
    }
  }, [requestForEditing]);

  function extractFilenameFromURL(url) {
    const parts = url.split('?');
    const path = parts[0]; // Get the part before the question mark
    const pathParts = path.split('/');
    const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
    return filename;
  }
  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const placesData = await getingData_Places();
      if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
        setPlaces(placesData);
      } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "EDITOR" || JSON.parse(sessionStorage.getItem('jwt'))?.role == "STUDENT") {
        const placesDatafilterbyId = placesData.filter((place) => place.editors.map((editor) => editor.id).includes(JSON.parse(sessionStorage.getItem('jwt')).id));
        console.log('placesDatafilterbyId', placesDatafilterbyId);
        setPlaces(placesDatafilterbyId);
      }
    }
    fetchData();
  }, [updateAdd]);

  return (
    <CacheProvider value={cache}>
      <div
        style={{
          direction: language === 'Hebrew' ? 'rtl' : 'ltr',
          marginTop: '14px',
          textAlign: '-webkit-center',
        }}
      >
        <Button size='large' variant='outlined' onClick={handleClickOpen}>
          {addPlaceButtonText}
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr' }}>
            {language === 'Hebrew' ? 'אתר חדש' : 'New Place'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {/* To subscribe to this website, please enter your email address here.
              We will send updates occasionally. */}
            </DialogContentText>
            <TextField
              // autoFocus
              margin='dense'
              id='name'
              label={language === 'Hebrew' ? 'שם' : 'Name'}
              type='name'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? places[openThreeDotsVertical].name
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
            />
            <TextField
              margin='dense'
              id='description'
              label={language === 'Hebrew' ? 'תיאור אתר' : 'Description'}
              type='description'
              fullWidth
              variant='standard'
              defaultValue={
                openThreeDotsVertical !== -1
                  ? places[openThreeDotsVertical].description
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
            />
            <TextField
              // autoFocus
              margin="dense"
              id="nameInEnglish"
              label={language === 'Hebrew' ? 'שם באנגלית' : 'Name in English'}
              type="name in English"
              fullWidth
              variant="standard"
              defaultValue={
                openThreeDotsVertical !== -1
                  ? places[openThreeDotsVertical]?.nameInEnglish
                  : ''
              }
              inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
            />
            <div style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr', marginTop: '10px' }}>
              {language === 'Hebrew' ? 'תמונה:' : 'Picture:'}
            </div>
            <div>
              <InputFileUpload setPicture={setPicture} language={language === 'Hebrew' ? 'English' : 'Hebrew'} />
              {/* <input
                label={language === 'Hebrew' ? 'שם מלא' : 'Full Name'}
                accept='image/*'
                id='image-input'
                type='file'
                onChange={(e) => setPicture(e.target.files[0])}
              /> */}
              {places[openThreeDotsVertical]?.picture_url ? (
                <div className='selectedFileContainer'>
                  <div className='selectedFileTitle'>
                    {language === 'Hebrew' ? ':תמונה שנבחרה' : 'Selected Picture:'}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    {typeof places[openThreeDotsVertical]?.picture_url ===
                      'string'
                      ? extractFilenameFromURL(
                        places[openThreeDotsVertical]?.picture_url
                      )
                      : places[openThreeDotsVertical]?.name}
                  </div>
                  <div className='thumbnail'>
                    {typeof places[openThreeDotsVertical]?.picture_url ===
                      'string' && (
                        <img
                          src={places[openThreeDotsVertical]?.picture_url}
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
            <Button onClick={handleCloseRemoveConfirm}
            // autoFocus
            >
              {language === 'Hebrew' ? 'מחיקה' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        {/* end cencel */}
        <div className='place_cards_warpper'>
          {places.map((place, index) => (
            <div key={index} className='place_card'>
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
                src={place.picture_url || defualtSiteImg}
                alt='Avatar'
                style={{ width: '100%' }}
              />
              <div className='places_cards_container' key={place.name}>
                <h5>{place.name}</h5>
                <p>{place.description}</p>
                {/* <p>{place.nameInEnglish}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CacheProvider>
  );
};

export default PlacesCards;

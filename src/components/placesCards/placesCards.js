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


const PlacesCards = () => {
  const [places, setPlaces] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [picture, setPicture] = useState(null);

  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [studentForAction, setStudentForAction] = useState('');
  const [updateAdd, setupdateAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);


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
      alert('המחיקה בוצעה בהצלחה!');
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
      nameinEnglish: places[openThreeDotsVertical].nameinEnglish,
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
    const nameinEnglish = document.getElementById('nameinEnglish').value;

    if (name === '' || description === '') {
      alert('עליך למלא שדות חובה המסומנים בכוכבית');
    } else {
      let picture_url;
      try {
        if (picture) picture_url = await uploadFiles(picture, 'Site media/picture', nameinEnglish); //await uploadImageGD(picture);

        const place = {
          name,
          description,
          picture_url,
          nameinEnglish
        };

        if (requestForEditing === 'edit' || requestForEditing === 'details') {
          const placeToUpdate = places[studentForAction];
          console.log('placeToUpdate', placeToUpdate);
          updateSite(placeToUpdate.id, place).then((updatedPlace) => {
            placeToUpdate.name = updatedPlace.data.name;
            placeToUpdate.description = updatedPlace.data.description;
            placeToUpdate.picture_url = updatedPlace.data.picture_url;
            placeToUpdate.nameinEnglish = updatedPlace.data.nameinEnglish;
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
      setPlaces(placesData);
    };

    fetchData();
  }, [updateAdd]);

  return (
    <div style={{
      // direction: 'rtl',
      marginTop: '14px',
      textAlign: '-webkit-center',
    }} >
      <Button size='large' variant='outlined' onClick={handleClickOpen}>
        הוספת אתר חדש
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>אתר חדש</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* To subscribe to this website, please enter your email address here.
            We will send updates occasionally. */}
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='שם'
            type='name'
            fullWidth
            variant='standard'
            defaultValue={
              openThreeDotsVertical !== -1
                ? places[openThreeDotsVertical].name
                : ''
            }
          />
          <TextField
            margin='dense'
            id='description'
            label='תיאור אתר'
            type='description'
            fullWidth
            variant='standard'
            defaultValue={
              openThreeDotsVertical !== -1
                ? places[openThreeDotsVertical].description
                : ''
            }
          />
          <TextField
            autoFocus
            margin="dense"
            id="nameinEnglish"
            label="שם באנגלית"
            type="name in English"
            fullWidth
            variant="standard"
            defaultValue={
              openThreeDotsVertical !== -1
                ? places[openThreeDotsVertical]?.nameinEnglish
                : ''
            }
          />
          <div>תמונה:</div>

          <div>
            <input
              label='שם מלא'
              accept='image/*'
              id='image-input'
              type='file'
              onChange={(e) => setPicture(e.target.files[0])}
            />
            {places[openThreeDotsVertical]?.picture_url ? (
              <div className='selectedFileContainer'>
                <div className='selectedFileTitle'>:תמונה שנבחרה</div>
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
                תמונה שנבחרה: לא נמצא קובץ תמונה
              </div>
            )}
          </div>
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
              <p>{place.nameinEnglish}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacesCards;

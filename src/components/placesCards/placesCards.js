import React, { useState, useEffect } from 'react';
import { getingData_Places, insertSite } from '../../api/api';
import './placesCards.css';
import defualtSiteImg from '../../Pictures/defualtSiteImg.svg';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const PlacesCards = () => {
  const [places, setPlaces] = useState([]);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = () => {
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    // const image = document.getElementById("image-input").files[0];

    const place = {
      name: name,
      description: description,
      // pictureId: image,
    };

    insertSite(place).then((data) => {
      setPlaces([data, ...places]);
    });

    handleClose(); // Close the dialog after the form is submitted
    console.log('places', places);
  };

  useEffect(() => {
    const fetchData = async () => {
      const placesData = await getingData_Places();
      setPlaces(placesData);
    };

    fetchData();
    console.log('places', places);
  }, []);

  return (
    <div style={{ marginTop: '14px', textAlign: '-webkit-center' }}>
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
          />
          <TextField
            margin='dense'
            id='description'
            label='תיאור אתר'
            type='description'
            fullWidth
            variant='standard'
          />
          {/* <TextField
            autoFocus
            margin="dense"
            id="coach"
            label="מדריך"
            type="name"
            fullWidth
            variant="standard"
          /> */}
          <div>תמונה:</div>
          <input label='שם מלא' accept='image/*' id='image-input' type='file' />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleConfirm}>שמירה</Button>
        </DialogActions>
      </Dialog>
      <div className='place_cards_warpper'>
        {places.map((place) => (
          <div key={place.id} className='place_card'>
            <img
              src={place.picture_url ? place.picture_url : defualtSiteImg}
              alt='Avatar'
              style={{ width: '100%' }}
            />
            <div className='places_cards_container' key={place.name}>
              <h5>{place.name}</h5>
              <p>{place.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacesCards;

import React, { useState, useEffect } from 'react';
import './Modal.css';
import { FcMultipleInputs } from 'react-icons/fc';
import { RiAsterisk } from 'react-icons/ri';
import { BsExclamationLg } from 'react-icons/bs';
import Modal_Loading from './Modal_Loading';
import CircularProgressWithLabel from './progressbar';
import { baseUrl } from '../../../config';
import stopIcon from '../../../Pictures/stopIcon.svg';
import {
  uploadFile,
  insertStation,
  updateStation,
  uploadFiles,
} from '../../../api/api';
import { useNotification } from "../../../components/Notification/NotificationProvider";


//--------------------------
// let getPicture, getSound;
let ichour = 'אישור';
let flagClickOK = false;
//--------------------------
const Modal_Stations = (props) => {
  const [, setDone] = useState(false);
  const [get_title, settitle] = useState('');
  const [picture, setPicture] = useState([]);
  const [audio, setAudio] = useState(null);
  const [getDescription, setDescription] = useState('');
  const [, setFlagClickOK] = useState(false);
  const [picturePreview, setPicturePreview] = useState(false);
  const [srcImage, setSrcImage] = useState('');
  const [stationUUId, setStationUUId] = useState('');

  const { showNotification } = useNotification();

  useEffect(() => {
    if (
      props.stationArray.length > 0 &&
      props.stationIndex !== undefined &&
      props.stationIndex > -1
    ) {
      const station = props.stationArray[props.stationIndex];
      settitle(station?.title || '');
      setDescription(station?.subtitle || '');
      setStationUUId(station?.id || '');
    }
  }, [props.stationArray, props.stationIndex]);

  //----------------------------------

  const handleTitleInput = (e) => {
    settitle(e.target.value);
  };
  //----------------------------------

  const handleDescriptionInput = (e) => {
    setDescription(e.target.value);
  };
  //----------------------------------
  useEffect(() => {
    if (picture.length > 0) {
      setPicturePreview(true);
      setSrcImage(URL.createObjectURL(picture));
    }
  }, [picture, srcImage]);

  async function Post_Station() {
    setFlagClickOK((flagClickOK = true));

    if (get_title === '' || getDescription === '') {
      setFlagClickOK((flagClickOK = false));
      setDone(false);
      showNotification('error', props.language === "English" ? 'עליך למלא שדות חובה המסומנים בכוכבית' : 'Please fill in the required fields');
      // alert( props.language !== "English" ? 'עליך למלא שדות חובה המסומנים בכוכבית' : 'Please fill in the required fields');

    } else if (props.requestForEditing === 'edit' || props.requestForEditing === 'details') {
      try {
      let response = await updateStation(
        stationUUId,
        get_title,
        getDescription,
        props.mySite.id
      );
      if (response.status === 200) {
        // alert('התחנה עודכנה');
        showNotification('success', props.language !== "English" ? 'The station has been updated' : 'התחנה עודכנה');
        setFlagClickOK((flagClickOK = false));
        props.setOpenModalPlaces(false);
        let station = props.stationArray.find(
          (station) => station.id === stationUUId
        );
        station.title = get_title;
        station.subtitle = getDescription;

        props.setOpenModalPlaces(false);
        props.setOpenThreeDotsVertical(-1);
        props.setRequestForEditing('');
      }
    } catch (error) {
      // alert('שם התחנה כבר קיים - בחר שם אחר');
      showNotification('error', props.language !== "English" ? 'The station name already exists - choose another name' : 'שם התחנה כבר קיים - בחר שם אחר');
      console.error(error);
    }
    } else if (props.requestForEditing === 'duplication') {
      console.log("duplication", props.stationArray);
      let station = props.stationArray.find(
        (station) => station.id === stationUUId
      );
      console.log("station", station);

      let stationtasksIds = [];
      station.tasks.map((task) => {
        stationtasksIds.push(task.id);
      })

      try {
        const post = await insertStation(
          get_title,
          getDescription,
          props.mySite,
          stationtasksIds
        );//, imageData, audioData);
        showNotification('success', props.language !== "English" ? 'The station has been duplicated' : 'התחנה הועתקה');

        setDone(true);
        setFlagClickOK((flagClickOK = false));

        let length = props.stationArray.length + 1;
        let color = props.pastelColors[length];
        post.color = color;
        props.setOpenModalPlaces(false);
        await props.setStationArray((stations) => [...stations, post]);
      } catch (error) {
        // alert('שם התחנה כבר קיים - בחר שם אחר');
        showNotification('error', props.language !== "English" ? 'The station name already exists - choose another name' : 'שם התחנה כבר קיים - בחר שם אחר');
        console.error(error);
      }
    } else {
      // let imageData;
      // let audioData;

      // try {
      //   if (picture) {
      //     imageData = await uploadFiles(picture, 'Station media/picture');
      //   }
      //   if (audio) {
      //     audioData = await uploadFiles(audio, 'Station media/audio');
      //   }
      // } catch (error) {
      //   console.error(error);
      // }

      try {
        const post = await insertStation(
          get_title,
          getDescription,
          props.mySite
        ); //, imageData, audioData);
        showNotification('success', props.language !== "English" ? 'The station has been saved' : 'התחנה נשמרה');
        setDone(true);
        setFlagClickOK((flagClickOK = false));

        let length = props.stationArray.length + 1;
        let color = props.pastelColors[length];
        post.color = color;
        props.setOpenModalPlaces(false);
        await props.setStationArray((stations) => [...stations, post]);
      } catch (error) {
        // alert( props.language !== "English" ? 'שם התחנה כבר קיים - בחר שם אחר' : 'The station name already exists - choose another name');
        showNotification('error', props.language !== "English" ? 'The station name already exists - choose another name' : 'שם התחנה כבר קיים - בחר שם אחר');
        console.error(error);
      }
    }
  }

  return (
    <>
      {props.idTasks === 0 ? (
        <>
          {/* <div className="BackgroundPlasesNoClick"> */}
          <div className='modalContainerPlases'>
            <div className='stopIconContainer'>
              <img src={stopIcon} alt='logo'></img>
            </div>
            <div className='body' style={{ textAlign: 'center' }}>
              <h4> {props.language !== 'English' ? 'You must first select a site, then associate a station with it' :' עליך לבחור ראשית אתר, ואז לשייך אליו תחנה '}</h4>
            </div>
            <div className='footer'>
              <button
                className='cancelBtn'
                onClick={() => {
                  props.setOpenModalPlaces(false);
                }}
              >
                {props.language !== 'English' ? 'Close' : 'סגור'}
              </button>
            </div>
          </div>
          {/* </div> */}
        </>
      ) : (
        <>
          <div className='modalContainerNewStation'>
            <div className='headerNewTask'>
              <div
                className='NewTaskTitle'
                style={{
                  textAlign: props.language === 'English' ? 'right' : 'left',
                }}
              >
                {props.language !== 'English' ? (props.requestForEditing ? 'Edit station' : 'New station') : (props.requestForEditing ? 'עריכת תחנה' : 'תחנה חדשה')}
              </div>
            </div>
            <div
              className='bodyNewStation'
              style={{
                textAlign: props.language === 'English' ? 'right' : 'left',
              }}
            >
              <form id='IPU' className='w3-container'>
                <h6>
                  {props.language !== 'English'
                    ? 'Write the station name:'
                    : ':רשום את שם התחנה'}
                  <RiAsterisk style={{ color: 'red' }} />
                </h6>
                <p>
                  <input
                    value={get_title}
                    required={true}
                    type='text'
                    onChange={handleTitleInput}
                    style={{
                      height: '38px',
                      width: '100%',
                      paddingRight: '20px',
                      direction: props.language === 'English' ? 'rtl' : 'ltr',
                    }}
                  ></input>
                </p>
              </form>
              <form id='IPU' className='w3-container'>
                <h6>
                  {props.language !== 'English'
                    ? 'Describe the station:'
                    : ':תאר במשפט את תחנה'}
                  <RiAsterisk style={{ color: 'red' }} />
                </h6>
                <p>
                  <input
                    value={getDescription}
                    type='text'
                    onChange={handleDescriptionInput}
                    style={{
                      height: '38px',
                      width: '100%',
                      paddingRight: '20px',
                      direction: props.language === 'English' ? 'rtl' : 'ltr',
                    }}
                  ></input>
                </p>
              </form>
              {/* <form id='IPU' className='w3-container'>
                <h6>
                  {props.language !== 'English'
                    ? 'add picture of the station:'
                    : 'הוסף תמונה של התחנה'}
                  <FcMultipleInputs />
                </h6>
                <div className='input-group mb-3'>
                  <input
                    // required={true}
                    accept='.png, .jpg, .jpeg'
                    className='form-control'
                    type='file'
                    // onChange={(e) => setPicture(e.target.files[0])}
                    style={{
                      width: '100%',
                      height: '38px',
                      direction: props.language === 'English' ? 'rtl' : 'ltr',
                    }}
                  ></input>
                  {picturePreview ? (
                    <img
                      className='picturePreview'
                      src={srcImage}
                      alt='picturePreview'
                    ></img>
                  ) : (
                    <></>
                  )}
                </div>
              </form>
              <form id='IPU' className='w3-container'>
                <h6>
                  {props.language !== 'English'
                    ? 'Add a voice clip:'
                    : 'הוסף קטע קול'}

                  <FcMultipleInputs />
                </h6>
                <p>
                  <input
                    // required={true}
                    accept='.mp3'
                    type='file'
                    className='form-control'
                    // onChange={(e) => setAudio(e.target.files[0])}
                    style={{
                      width: '100%',
                      height: '38px',
                      direction: props.language === 'English' ? 'rtl' : 'ltr',
                    }}
                  ></input>
                </p>
              </form> */}
            </div>
            <div className='footerNewStation'>
              <input
                type='submit'
                className='newStationButton'
                value={
                  props.language !== 'English' ? 'Save station' : 'שמור תחנה'
                }
                onClick={Post_Station}
              />
              <input
                type='submit'
                className='newStationButton'
                value={props.language !== 'English' ? 'Cancel' : 'ביטול'}
                onClick={() => {
                  props.setOpenModalPlaces(false);
                  props.setRequestForEditing('');
                }}
              />
            </div>

            {flagClickOK ? (
              <>
                <Modal_Loading props={false} />
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </>
  );
};
export default Modal_Stations;

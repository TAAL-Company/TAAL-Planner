import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { FcMultipleInputs, FcAbout } from 'react-icons/fc';
import { RiAsterisk } from 'react-icons/ri';
import { IoMdCheckbox } from 'react-icons/io';
import Modal_Loading from './Modal_Loading';
import { baseUrl } from '../../config';
import Modal_no_site_selected from './Modal_no_site_selected';
import { uploadFiles, uploadFile, insertTask, updateTask, updateAdditonalHelp, postAdditonalHelp, getingData_Tasks } from '../../api/api';
import uploadFileToBlob from '../azureBlob';
import Gallery2 from '../Gallery/Gallery2';
import Gallery3 from '../Gallery/Gallery3';
import BasicSelect from '../Gallery/BasicSelect';
import { getBlobsInContainer } from '../azureBlob';
import InputFileUpload from '../InputFileUpload/InputFileUpload';
import Draggable from 'react-draggable';

import Model_Tasks_Pop from './Model_Tasks_Pop';
import Model_Tasks_help_Pop from './Model_Tasks_help_Pop';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';

import { useNotification } from "../Notification/NotificationProvider";


const style = {
  position: 'absolute',
  top: '5%',
  left: '5%',
  // transform: 'translate(-50%, -50%)',
  width: '90%', //'1002px',
  height: '90%',//'400px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  overflow: "hidden",
  overflowY: "scroll",
  p: 4,
};

const style2 = {
  position: 'absolute',
  top: '5%',
  left: '5%',
  // transform: 'translate(-50%, -50%)',
  width: '90%', //'1002px',
  height: '90%',//'400px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  // overflow: "hidden",
  // overflowY: "scroll",
  // p: 4,
};

//--------------------------
let ichour = 'אישור';
let file = '';
let myPlacesChoiceTemp = [];

//--------------------------
function Modal_Tasks(props) {
  console.log('props:', props);

  const [, setDone] = useState(false);
  const [get_title, setTitle] = useState(props.title);
  const [getDescription, setDescription] = useState(props.subtitle);
  const [estimatedTimeSeconds, setEstimatedTimeSeconds] = useState(
    props.estimatedTimeSeconds
  );
  const [dataEntryLabel, setdataEntryLabel] = useState(props?.dataEntryLabel);
  const [dataEntryValidation, setdataEntryValidation] = useState(props?.dataEntryValidation);
  const [dataEntryType, setdataEntryType] = useState(props?.dataEntryType);
  const [taskType, setTaskType] = useState(props?.taskType);
  const [dataEntryTypelist, setDataEntryTypelist] = useState(["String", "Int", "Number"]);
  const [TaskTypelist, setTaskTypelist] = useState(["specialTask", "normal", "onlyOnce", "popupAfterCurrentTask"]);
  const [multi_language_description, setMulti_language_description] = useState(props.multi_language_description);
  const [additonalHelp, setAdditonalHelp] = useState(props.additonalHelp);
  const [mainadditonalHelp, setMainAdditonalHelp] = useState([]);
  const [language_description, setlanguage_description] = useState('English');
  const [picture, setPicture] = useState(props.picture);
  const [audio, setAudio] = useState(props.audio);
  const [flagClickOK, setFlagClickOK] = useState(false);
  const [myPlacesChoice, setMyPlacesChoice] = useState([props.myStation.id]
  );
  const audioRef = useRef(null);

  const [Foldersite, setFoldersite] = useState(props.mySite.nameInEnglish);
  const [blobList, setBlobList] = useState([]);
  const [sortedUrls, setSortedUrls] = useState({});
  const [folderNames, setFolderNames] = useState([]);

  const { showNotification } = useNotification();

  const handleDataEntryLabelInput = (e) => {
    setdataEntryLabel(e.target.value);
  };

  const handleDataEntryValidationInput = (e) => {
    setdataEntryValidation(e.target.value);
  };

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

  useEffect(() => {
    if (
      (props.requestForEditing === 'edit' ||
        props.requestForEditing === 'details') &&
      Array.isArray(props.stationOfTask) && props.stationOfTask.length > 0
    ) {
      props.stationOfTask.forEach((station) => {
        setMyPlacesChoice((prev) => [...prev, station.id]);
      });
    }
  }, [props.requestForEditing, props.stationOfTask]);

  const handleTitleInput = (e) => {
    setTitle(e.target.value);
  };
  const handleDescriptionInput = (e) => {
    setDescription(e.target.value);
  };

  const saveTask = async () => {
    setFlagClickOK(true);
    console.log("additonalHelp", additonalHelp);
    console.log(mainadditonalHelp);
    console.log(Foldersite);
    


    if (get_title === '' || getDescription === '') {
      
      // alert(props.language !== "English" ? 'עליך למלא שדות חובה המסומנים בכוכבית' : 'Please fill in the required fields');
      showNotification('error',props.language === "English" ? 'עליך למלא שדות חובה המסומנים בכוכבית' : 'Please fill in the required fields' );
      setDone(false);
      setFlagClickOK(false);
      props.setModalOpen(true);
    } else {
      const urlAlreadyExist = 'https://taalmedia.blob.core.windows.net';
      let picture_url;
      let audio_url;

      try {
        if (picture && !picture?.name?.includes(urlAlreadyExist)) {
          picture_url = await uploadFiles(picture, 'Task media/picture', Foldersite);//ask media/picture
        }
      } catch (error) {
        // console.error(error);
        picture_url = picture
      }
      try {
        if (audio && !audio?.name?.includes(urlAlreadyExist)) {
          audio_url = await uploadFiles(audio, 'Task media/audio', Foldersite);
        }
      } catch (error) {
        // console.error(error);
        audio_url = audio;
      }

      if (props.requestForEditing === 'edit') {
        let newTask = {
          title: get_title,
          subtitle: getDescription,
          stationIds: myPlacesChoice,
          picture_url,
          audio_url,
          estimatedTimeSeconds,
          multi_language_description,
          dataEntryLabel,
          dataEntryValidation,
          dataEntryType,
          taskType,
          additonalHelp: mainadditonalHelp,
        };
        if (newTask.picture_url === undefined) {
          newTask.picture_url = '';
        }
        console.log('newTask: ', newTask);
        console.log('uuid: ', props.uuid);

        update_task(props.uuid, newTask);
      } else {
        Post_Task(picture_url, audio_url);
      }
      props.handleClose();
    }
  };
  const update_task = async (uuid, newTask) => {
    try {
      for (let i = 0; i < additonalHelp.length; i++) {
        if (Array.isArray(additonalHelp[i])) {
          for (let j = 0; j < additonalHelp[i].length; j++) {
            if (!additonalHelp[i][j].id) {
              additonalHelp[i][j].taskId = uuid;
              delete additonalHelp[i][j].id;
              try {
              await postAdditonalHelp(additonalHelp[i][j]);
              showNotification('success', props.language === "English" ? 'עזרה נוספת נוספה בהצלחה' : 'Additional help added successfully');
              } catch (error) {
                showNotification('error',props.language === "English" ? ' שגיאה בהוספת עזרה' :  'Error adding additional help');
              }
            } else {
              try {
              await updateAdditonalHelp(additonalHelp[i][j].id, additonalHelp[i][j]);
              showNotification('success', props.language === "English" ? 'עזרה עודכנה בהצלחה' : 'Additional help updated successfully');
              } catch (error) {
                showNotification('error', props.language === "English" ? ' שגיאה בעדכונה עזרה' :  'Error updating additional help');
              }
            }
          }
        } else {
          if (!additonalHelp[i].id) {
            additonalHelp[i].taskId = uuid;
            delete additonalHelp[i].id;
            try {
            await postAdditonalHelp(additonalHelp[i]);
            showNotification('success', props.language === "English" ? 'עזרה נוספת נוספה בהצלחה' : 'Additional help added successfully');
            } catch (error) {
              showNotification('error', props.language === "English" ? ' שגיאה בהוספת עזרה' :  'Error adding additional help');
            }
          } else {
            try {
            await updateAdditonalHelp(additonalHelp[i].id, additonalHelp[i]);
            showNotification('success', props.language === "English" ? 'עזרה עודכנה בהצלחה' : 'Additional help updated successfully');
            } catch (error) {
              showNotification('error', props.language === "English" ? ' שגיאה בעדכונה עזרה' :  'Error updating additional help');
            }
          }
        }
      }
    } catch (error) {
      // console.error(error);
      showNotification('error', props.language === "English" ? ' שגיאה בעדכונה עזרה' :  'Error updating additional help');
    }

    // Create a copy of newTask without additonalHelp
    const newTaskWithoutHelp = { ...newTask };
    delete newTaskWithoutHelp.additonalHelp;

    try {
      const update = await updateTask(uuid, newTaskWithoutHelp);
      showNotification('success', props.language === "English" ? 'משימה עודכנה בהצלחה' : 'Task updated successfully');  

      if (update.status === 200) {
        let indexStation = props.allStations.findIndex(
          (station) => station.id === props.myStation.id
        );
        let existingTaskIndex = props.allStations[indexStation].tasks.findIndex(
          (task) => task.id === uuid
        );

        if (indexStation !== -1 && existingTaskIndex !== -1) {
          const newTasks = [...props.tasksOfChosenStation];
          newTasks[existingTaskIndex] = update.data;
          (() => {
            props.setTasksOfChosenStation(newTasks);
            props.allStations[indexStation].tasks = newTasks;
          })();
        }

        (() => {
          props.setTaskForEdit(update.data);
          props.setModalOpen(false);
        })();
        setFlagClickOK(false);
      }
    } catch (error) {
      console.error(error);
      showNotification('error', props.language === "English" ? ' שגיאה בעדכונה משימה' :  'Error updating task');
    }
  };
  const Post_Task = async (picture_url, audio_url) => {
    // resultMyPlacesChoice();
    let additonalHelpflat = [];
    console.log("mainadditonalHelp", mainadditonalHelp);
    
    if (mainadditonalHelp.length > 0) {
      additonalHelpflat = mainadditonalHelp.flat(Infinity);
      additonalHelpflat.forEach(item => {
        delete item.id;
      });
      console.log("additonalHelpflat", additonalHelpflat);
    }


    if (myPlacesChoice.length > 0) {
      try {
        const post = await insertTask(
          get_title,
          getDescription,
          myPlacesChoice,
          picture_url,
          audio_url,
          props.mySite.id,
          estimatedTimeSeconds,
          multi_language_description,
          dataEntryLabel,
          dataEntryValidation,
          dataEntryType,
          taskType,
          additonalHelpflat
        )

        showNotification('success', props.language === 'English' ? 'Task added successfully' : 'המשימה נוספה בהצלחה');  

        let color = props.allStations.find(
          (item) => item.id === myPlacesChoice[0]
        ).color;

        post.color = color;
        props.setTasksOfChosenStation((tasks) => [...tasks, post]);
        props.setAllTasksOfTheSite((prev) => [...prev, post]);

        setDone(true);

        setFlagClickOK(false);
        props.setModalOpen(false);
      } catch (error) {
        console.error(error);
        showNotification('error', props.language === "English" ? ' שגיאה בהוספת משימה' :  'Error adding task');
      }
    } else {
      setDone(false);
      setFlagClickOK(false);
      // alert(props.language !== 'English' ? 'You must choose a station!' : 'את/ה חייב/ת לבחור תחנה!')
      showNotification('warning', props.language === 'English' ? 'You must choose a station!' : 'את/ה חייב/ת לבחור תחנה!');
      props.setModalOpen(true);
    }
  };
  // const saveCheckbox = (val) => {
  //   setMyPlacesChoice((prev) => [...prev, val.id]);
  //   // setMyStudents(myStudents.push(val))
  //   // sortById();
  // };

  const saveCheckbox = (val) => {
    setMyPlacesChoice((prev) => {
      if (prev.includes(val.id)) {
        // If ID is already in the array, remove it
        return prev.filter((id) => id !== val.id);
      } else {
        // If ID is not in the array, add it
        return [...prev, val.id];
      }
    });
  };

  // const sortById = () => {
  //   if (myPlacesChoiceTemp.length > 1)
  //     for (let i = 0; i < myPlacesChoiceTemp.length; i++) {
  //       let min = myPlacesChoiceTemp[i];
  //       for (let j = i; j < myPlacesChoiceTemp.length; j++) {
  //         if (myPlacesChoiceTemp[j].id < min.id) {
  //           setMyPlacesChoice((myPlacesChoiceTemp[i] = myPlacesChoiceTemp[j]));
  //           setMyPlacesChoice((myPlacesChoiceTemp[j] = min));
  //           min = myPlacesChoiceTemp[j].id;
  //         }
  //       }
  //     }
  // };

  const resultMyPlacesChoice = () => {
    if (myPlacesChoiceTemp.length > 1)
      for (let i = 0; i < myPlacesChoiceTemp.length; i++) {
        let index = i;
        let count = 1;
        for (let j = i + 1; j < myPlacesChoiceTemp.length; j++) {
          if (myPlacesChoiceTemp[j].id === myPlacesChoiceTemp[i].id) {
            i++;
            count++;
          }
        }
        if (count % 2 !== 0) {
          setMyPlacesChoice(myPlacesChoice.push(myPlacesChoiceTemp[index].id));
        }
      }
  };

  function extractFilenameFromURL(url) {
    const parts = url.split('?');
    const path = parts[0]; // Get the part before the question mark
    const pathParts = path.split('/');
    const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
    return filename;
  }

  const handlePlayClick = () => {
    audioRef.current.play();
  };

  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleOpen2 = () => setOpen2(true);
  const handleOpen3 = () => setOpen3(true);
  const handleOpen4 = () => setOpen4(true);
  const handleClose = () => {
    console.log("additonalHelp", additonalHelp);

    setOpen(false);
    setOpen2(false);
    setOpen3(false);
    setOpen4(false);
  }

  const data = {
    "English": {
      "title": "",
      "estimatedTimeSeconds": 0,
      "subtitle": "",
      "picture_url": "",
      "audio_url": "",
      "dataEntryLabel": "",
      "dataEntryValidation": "",
      "dataEntryType": {},
      "taskType": {}
    },
    "arabic": {
      "title": "",
      "estimatedTimeSeconds": 0,
      "subtitle": "",
      "picture_url": "",
      "audio_url": "",
      "dataEntryLabel": "",
      "dataEntryValidation": "",
      "dataEntryType": {},
      "taskType": {}
    }
  }

  useEffect(() => {
    console.log("multi_language_description", multi_language_description);
    console.log("data", data);

  }, [multi_language_description, data]);

  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {!props.help && !props.siteSelected ? (
        <>
          <Modal_no_site_selected
            setOpenModal={props.setModalOpen}
          ></Modal_no_site_selected>
        </>
      ) : (
        <></>
      )}
      {!props.help && props.siteSelected ? (
        <>
          <Draggable>
            <div
              className='BackgroundTasks'
              style={{
                textAlign: props.language === 'English' ? 'right' : 'left',
                direction: props.language !== 'English' ? 'rtl' : 'ltr',
                top: '3%',
                left: '31%',
              }}
            >
              <div className='modalContainerTasks'>
                <div className='headerNewTask'>
                  <div className='NewTaskTitle'>
                    {props.language !== 'English' ? 'New task' : ':משימה חדשה'}
                  </div>
                </div>
                <div
                  className={`bodyNewTask ${props.requestForEditing === 'details' ? 'disabledModal' : ''
                    }`}
                >
                  {/* <h5 style={{ textAlign: 'center' }}> הוסף משימה</h5> */}
                  <form id='IPU' className='w3-container'>
                    <h6>
                      {props.language !== 'English'
                        ? 'Write the name of the task'
                        : ':רשום את שם המשימה '}

                      <RiAsterisk style={{ color: 'red' }} />
                    </h6>
                    <p>
                      <input
                        required={true}
                        type='text'
                        onChange={handleTitleInput}
                        style={{
                          width: '100%',
                          height: '38px',
                          paddingRight: '20px',
                          direction: props.language === 'English' ? 'rtl' : 'ltr',
                        }}
                        value={get_title}
                      ></input>
                    </p>
                  </form>
                  <form id='IPU' className='w3-container'>
                    <h6>
                      {props.language !== 'English'
                        ? 'Describe the task'
                        : ':תאר במשפט את משימה '}
                      <RiAsterisk style={{ color: 'red' }} />
                    </h6>
                    <p>
                      <input
                        type='text'
                        onChange={handleDescriptionInput}
                        style={{
                          width: '100%',
                          height: '38px',
                          paddingRight: '20px',
                          direction: props.language === 'English' ? 'rtl' : 'ltr',
                        }}
                        value={getDescription}
                      ></input>
                    </p>
                  </form>
                  <div className='estimatedTimeContainer'>
                    <h6>{props.language !== 'English'
                      ? "Enter the estimated time in seconds for the task : "
                      : " זמן מינימלי למשימה (שניות) "}</h6>
                    <input
                      type='number'
                      name='estimatedTimeSeconds'
                      id='estimatedTimeSeconds'
                      min={1}
                      onChange={(e) =>
                        setEstimatedTimeSeconds(parseInt(e.target.value))
                      }
                      value={estimatedTimeSeconds}
                    />
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={showForm}
                      onChange={() => setShowForm(!showForm)}
                      style={{
                        width: '85px',
                        height: '20px',
                        paddingRight: '20px',
                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                      }}
                    />
                    {props.language === 'English' ? 'הוסף נתונים נוספים' : 'Add additional data'}

                  </label>
                  {showForm && (
                    <form id='IPU' className='w3-container'  >
                      <form id='IPU' className='w3-container'>
                        <h6>
                          {props.language !== 'English'
                            ? 'Write a weight'
                            : ':רשום משקל '}
                          <RiAsterisk style={{ color: 'red' }} />
                        </h6>
                        <p>
                          <input
                            required={true}
                            type='text'
                            onChange={handleDataEntryLabelInput}
                            style={{
                              width: '100%',
                              height: '38px',
                              paddingRight: '20px',
                              direction: props.language === 'English' ? 'rtl' : 'ltr',
                            }}
                            value={dataEntryLabel}
                          ></input>
                        </p>
                      </form>
                      <form id='IPU' className='w3-container'>
                        <h6>
                          {props.language !== 'English'
                            ? 'Write Data Entry Validation'
                            : ':רשום את תווית הנתונים '}
                          <RiAsterisk style={{ color: 'red' }} />
                        </h6>
                        <p>
                          <input
                            required={true}
                            type='text'
                            onChange={handleDataEntryValidationInput}
                            style={{
                              width: '100%',
                              height: '38px',
                              paddingRight: '20px',
                              direction: props.language === 'English' ? 'rtl' : 'ltr',
                            }}
                            value={dataEntryValidation}
                          ></input>
                        </p>
                      </form>
                      <h6>
                        {props.language !== 'English'
                          ? 'Select data entry type'
                          : ':בחר סוג נתונים '}
                      </h6>
                      <BasicSelect setFoldersite={setdataEntryType} folderName={dataEntryType} folderlist={dataEntryTypelist} />
                      <h6>
                        {props.language !== 'English'
                          ? 'Select type of task'
                          : ':בחר סוג משימה '}
                      </h6>
                      <BasicSelect setFoldersite={setTaskType} folderName={taskType} folderlist={TaskTypelist} />
                    </form>
                  )}
                  <h6>
                    {props.language !== 'English'
                      ? "Site where the image / voice will be save : "+ props.mySite.nameInEnglish
                      :   props.mySite.nameInEnglish +' : nאתר בו יישמרו התמונה/הקול'}
                    <FcMultipleInputs />
                  </h6>
                  {/* <h6>
                    {props.language !== 'English'
                      ? 'Select where to save picture / voice'
                      : ':בחר היכן לשמור תמונה/קול'}
                    <FcMultipleInputs />
                  </h6>
                  <BasicSelect setFoldersite={setFoldersite} folderlist={folderNames} /> */}
                  <form id='IPU' className='w3-container'>
                    <h6>
                      {props.language !== 'English'
                        ? 'Add a picture of a task from the Gallery / Desktop '
                        : ' : הוסף תמונה של משימה מהגלריה/שולחן העבודה'}
                      <FcMultipleInputs />
                    </h6>
                    <div>
                      <InputFileUpload setPicture={setPicture} language={props.language} />
                      <Button variant="outlined" onClick={handleOpen}>Gallery</Button>
                      <Modal
                        open={open}
                        onClose={() => {
                          handleClose()
                          console.log(open);
                        }}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                      >
                        <Box sx={style2}>
                          <Gallery2 sethandleClose={handleClose} setPicture={setPicture} showaudio={false} showimage={true}/>
                        </Box>
                      </Modal>
                      {picture ? (
                        <div className='selectedFileContainer'>
                          <div className='selectedFileTitle'>:תמונה שנבחרה</div>
                          <div style={{ marginBottom: '1rem' }}>
                            {typeof picture === 'string'
                              ? extractFilenameFromURL(picture)
                              : picture?.name}
                          </div>
                          <div className='thumbnailtask'>
                            {typeof picture === 'string' && (
                              <img
                                src={picture}
                                className='thumbnailImgtask'
                                alt=''
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '1rem' }}>
                          {props.language !== 'English'
                            ? 'Selected image: No image file found'
                            : ' :  תמונה שנבחרה: לא נמצא קובץ תמונה'}
                        </div>
                      )}
                    </div>
                  </form>
                  <form id='IPU' className='w3-container'>
                    <h6>
                      {props.language !== 'English'
                        ? 'Add a voice clip describing the task'
                        : ':הוסף קטע קול המתאר את המשימה '}
                      <FcMultipleInputs />
                    </h6>
                    <InputFileUpload setPicture={setAudio} language={props.language} />
                    <Button variant="outlined" onClick={handleOpen2}>Gallery audio</Button>
                    <Modal
                      open={open2}
                      onClose={() => {
                        handleClose()
                        console.log(open2);
                      }}
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                    >
                      <Box sx={style2}>
                          <Gallery2 sethandleClose={handleClose} setPicture={setAudio} showaudio={true} showimage={false}/>
                        </Box>
                    </Modal>
                  </form>
                  {audio ? (
                    <div className='selectedFileContainertask'>
                      <div className='selectedFileTitle'>
                        <span>:</span>
                        אודיו שנבח
                      </div>
                      <div className='audioNameContainer'>
                        <div style={{ marginBottom: '1rem' }}>
                          {typeof audio === 'string'
                            ? extractFilenameFromURL(audio)
                            : audio?.name}
                        </div>
                        <div>
                          {typeof audio === 'string' && (
                            <button
                              className='play-button'
                              onClick={handlePlayClick}
                            >
                              {/* {audio} */}
                              Play
                            </button>
                          )}
                        </div>
                        <audio ref={audioRef} controls>
                          <source
                            src={typeof audio === 'string' ? audio : ''}
                            type='audio/mpeg'
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '1rem' }}>
                      {props.language !== 'English' ?
                        'Selected audio: No audio file found' :
                        ' אודיו שנבחר: לא נמצא קובץ אודיו'}
                    </div>
                  )}
                  <h6>
                    {props.language !== 'English'
                      ? 'add multi language'
                      : ': רב שפות'}
                    <IoMdCheckbox style={{ color: 'blue' }} />
                  </h6>
                  <Button variant="outlined" onClick={handleOpen3}>
                    {props.language !== 'English'
                      ? 'language'
                      : ' שפות'}
                  </Button>
                  <Modal
                    open={open3}
                    onClose={() => {
                      handleClose()
                      console.log(open3);
                    }}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      {/* <h1>{props.multi_language_description == {} ? props.multi_language_description : 'No description'}</h1>
                    <form id='IPU' className='w3-container'>
                      <h6>
                        {props.language !== 'English'
                          ? 'Write task language '
                          : ': כתוב שפת משימה'}

                        <RiAsterisk style={{ color: 'red' }} />
                      </h6>
                      <p>
                        <input
                          required={true}
                          type='text'
                          onChange={(e) => setlanguage_description( e.target.value)}
                          style={{
                            width: '100%',
                            height: '38px',
                            paddingRight: '20px',
                            direction: props.language === 'English' ? 'rtl' : 'ltr',
                          }}
                          value={language_description}
                        ></input>
                      </p>
                    </form> */}
                      {/* {Object.keys(multi_language_description).map((languagedescription, index) => ( */}
                      <Model_Tasks_Pop
                        // key={index}
                        siteNameInEnglish={props.mySite.nameInEnglish}
                        language={props.language}
                        language_description={language_description}
                        sethandleClose={handleClose}
                        multi_language_description={multi_language_description}//data[language_description]
                        setMulti_language_description={setMulti_language_description}
                      />
                      {/* ))} */}
                    </Box>
                  </Modal>
                  <h6>
                    {props.language !== 'English'
                      ? 'add additional help'
                      : ': הוסף עזרה נוספת'}
                    <IoMdCheckbox style={{ color: 'blue' }} />
                  </h6>
                  <Button variant="outlined" onClick={handleOpen4}>
                    {props.language !== 'English'
                      ? 'additional help'
                      : ' עזרה נוספת'}
                  </Button>
                  <Modal
                    open={open4}
                    onClose={() => {
                      handleClose()
                    }}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      <Model_Tasks_help_Pop
                        siteNameInEnglish={props.mySite.nameInEnglish}
                        allUsers={props.allUsers}
                        language={props.language}
                        additonalHelp={additonalHelp}
                        sethandleClose={handleClose}
                        setAdditonalHelp={setAdditonalHelp}
                        setMainAdditonalHelp={setMainAdditonalHelp}
                        mainadditonalHelp={mainadditonalHelp}
                      />
                    </Box>
                  </Modal>
                  <div className='list-group'>
                    <h6>
                      {props.language !== 'English'
                        ? 'Select the stations you want to associate the task with'
                        : ':בחר את התחנות שברצונך לשייך את המשימה'}
                      <IoMdCheckbox style={{ color: 'blue' }} />
                    </h6>
                    <div className='allTasks'>
                      {props.allStations.map((value, index) => {
                        return (
                          <label key={index} className='list-group-item'>
                            <input
                              className='form-check-input me-1'
                              type='checkbox'
                              onChange={() => saveCheckbox(value)}
                              style={{
                                marginLeft: props.language === 'English' ? '0' : '5px',
                                marginRight: props.language !== 'English' ? '0' : '5px',
                              }}
                              checked={myPlacesChoice.includes(value.id)}
                            ></input>
                            {value.title}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    height: '100px',
                    alignItems: 'center',
                    padding: '40px',
                    marginBottom: '20px',
                  }}
                  className='footerNewTasks'
                >
                  {props.requestForEditing === 'details' ? (
                    <></>
                  ) : (
                    <input
                      type='submit'
                      className='saveTaskButton'
                      value={
                        props.language !== 'English' ? 'Save Task' : 'שמור משימה'
                      }
                      onClick={saveTask}
                    />
                  )}
                  <input
                    type='submit'
                    className='cancelTaskButton'
                    value={props.language !== 'English' ? 'Cancel' : 'ביטול'}
                    onClick={() => {
                      setMyPlacesChoice([]);
                      props.setModalOpen(false);
                      props.handleClose();
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
            </div>
          </Draggable>
        </>
      ) : (
        <></>
        // <div className="Background">
        //   <div className="modalContainerHelpPlanner">
        //     <div className="titleCloseBtn">
        //       <button
        //         onClick={() => {
        //           setModalOpen(false);
        //         }}
        //       >
        //         {" "}
        //         X
        //       </button>
        //     </div>
        //     <h3>
        //       הוראות לבניית מסלול &nbsp;
        //       <FcAbout />
        //     </h3>
        //     <br></br>
        //     <div className="body" style={{ textAlign: "right" }}>
        //       <h6>
        //         בחר/י אתר קיים מרשימת האתרים או הוספ/י אתר משלך <samp>(1</samp>
        //       </h6>
        //       <br></br>
        //       <h6>
        //         בחר/י תחנה השייכת לאתר שבחרת ו/או הוספ/י תחנה חדשה{" "}
        //         <samp>(2</samp>
        //       </h6>
        //       <br></br>
        //       <h6>
        //         גרור לתיבת הגרירות את המשימות הרצויות כדי לבנות מסלול חדש{" "}
        //         <samp>(3</samp>
        //       </h6>
        //       <h6>
        //         ו/או בחר/י בהוסף משימה ושייך משימה זו לתחנות שבהם יש צורך בביצוע
        //         משימה זו
        //       </h6>
        //       <br></br>
        //       <h6>
        //         רשום את שם המסלול ובצע שמירה <samp>(4</samp>
        //       </h6>
        //     </div>
        //   </div>
        // </div>
      )}
    </>
  );
}
export default Modal_Tasks;

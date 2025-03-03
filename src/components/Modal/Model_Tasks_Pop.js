import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { FcMultipleInputs } from 'react-icons/fc';
import { RiAsterisk } from 'react-icons/ri';
import Gallery2 from '../Gallery/Gallery2';
import Gallery3 from '../Gallery/Gallery3';
import BasicSelect from '../Gallery/BasicSelect';
import { getBlobsInContainer } from '../azureBlob';
import InputFileUpload from '../InputFileUpload/InputFileUpload';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
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
function Model_Tasks_Pop(props) {
  let multi_language_description
  console.log('multi_language_description: ', props.multi_language_description);
  console.log("check", Object.keys(props.multi_language_description).length === 0);


  if (Object.keys(props.multi_language_description).length === 0) {
    multi_language_description = props.multi_language_description[props.language_description]
  } else {
    multi_language_description = JSON.parse(props.multi_language_description)[props.language_description] //props.multi_language_description;
  }
  // console.log('multi_language_description: ', JSON.parse(props.multi_language_description)[props.language_description],props.multi_language_description,props.language_description);

  const [get_title, setTitle] = useState(multi_language_description?.title);
  const [estimatedTimeSeconds, setEstimatedTimeSeconds] = useState(multi_language_description?.estimatedTimeSeconds);
  const [get_subtitle, setsubtitle] = useState(multi_language_description?.subtitle);
  const [picture, setPicture] = useState(multi_language_description?.picture);
  const [audio, setAudio] = useState(multi_language_description?.audio);
  const [dataEntryLabel, setdataEntryLabel] = useState(multi_language_description?.dataEntryLabel);
  const [dataEntryValidation, setdataEntryValidation] = useState(multi_language_description?.dataEntryValidation);
  const [dataEntryType, setdataEntryType] = useState(multi_language_description?.dataEntryType);
  const [TaskType, setTaskType] = useState(multi_language_description?.TaskType);

  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleOpen2 = () => setOpen2(true);

  const handleTitleInput = (e) => {
    setTitle(e.target.value);
  };

  const handleDataEntryLabelInput = (e) => {
    setdataEntryLabel(e.target.value);
  };

  const handleDataEntryValidationInput = (e) => {
    setdataEntryValidation(e.target.value);
  };


  const handleDescriptionInput = (e) => {
    setsubtitle(e.target.value);
  };


  const handleClose = () => {
    setOpen(false);
    setOpen2(false);
  }

  const extractFilenameFromURL = (url) => {
    const filename = url.split("/").pop();
    return filename;
  };


  const saveTask = () => {
    let newTask = {};
    newTask[props.language_description] = {
      title: get_title,
      subtitle: get_subtitle,
      picture_url: picture,
      audio_url: audio,
      estimatedTimeSeconds,
      dataEntryLabel,
      dataEntryValidation,
      dataEntryType,
      TaskType
    };

    props.setMulti_language_description(JSON.stringify(newTask)); //{ ...newTask });
    console.log(newTask);
    props.sethandleClose(false)
  };

  const audioRef = useRef(null);

  const [Foldersite, setFoldersite] = useState(props.siteNameInEnglish);
  const [blobList, setBlobList] = useState([]);
  const [sortedUrls, setSortedUrls] = useState({});
  const [folderNames, setFolderNames] = useState([]);

  const [dataEntryTypelist, setDataEntryTypelist] = useState(["String", "Int", "Number"]);
  const [TaskTypelist, setTaskTypelist] = useState(["specialTask", "normal", "onlyOnce", "popupAfterCurrentTask"]);

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

  return (
    <div className='modalContainerTasks'
      style={{
        textAlign: props.language === 'English' ? 'right' : 'left',
        direction: props.language !== 'English' ? 'rtl' : 'ltr',
        // transform:
        //   props.language === 'English'
        //     ? ' translate(-50%, -50%)'
        //     : ' translate(50%, -50%)',
      }}
    >
      <div className='headerNewTask'>
        <div className='NewTaskTitle'>
          {props.language !== 'English' ? `task language  ${props.language_description}` : `${props.language_description}  : שפת משימה`}
        </div>
      </div>
      <div
        className={`bodyNewTask ${props.requestForEditing === 'details' ? 'disabledModal' : ''
          }`}
      >
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
              value={get_subtitle}
            ></input>
          </p>
        </form>
        <div className='estimatedTimeContainer'>
          <h6>{props.language !== 'English'
            ? "Enter the estimated time in seconds for the task : "
            : "תמונה שנבחרה: לא נמצא קובץ תמונה"}</h6>
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
        <form id='IPU' className='w3-container'>
          <h6>
            {props.language !== 'English'
              ? 'Write Data Entry Label'
              : ':רשום את תווית הנתונים '}
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
        <BasicSelect setFoldersite={setTaskType} folderName={TaskType} folderlist={TaskTypelist} />
        {/* <h6>
          {props.language !== 'English'
            ? 'Select where to save picture / voice'
            : ':בחר היכן לשמור תמונה/קול'}
          <FcMultipleInputs />
        </h6>
        <BasicSelect setFoldersite={setFoldersite} folderName={Foldersite} folderlist={folderNames} /> */}
        
        <h6>
          {props.language !== 'English'
            ? "Site where the image / voice will be save : " + props.siteNameInEnglish
            : props.siteNameInEnglish + ' : nאתר בו יישמרו התמונה/הקול'}
          <FcMultipleInputs />
        </h6>
        <form id='IPU' className='w3-container'>
          <h6>
            {props.language !== 'English'
              ? 'Add a picture of a task from the Gallery / Desktop '
              : ' : הוסף תמונה של משימה מהגלריה/שולחן העבודה'}
            <FcMultipleInputs />
          </h6>
          <div>
            <InputFileUpload setPicture={setPicture} language={props.language} />
            {/* <input
              required={true}
              accept='.png, .jpg, .jpeg'
              className='form-control'
              type='file'
              onChange={(e) => setPicture(e.target.files[0])}
              style={{
                textAlign: 'right',
                width: '100%',
                height: '38px',
                direction: props.language === 'English' ? 'rtl' : 'ltr',
              }}
            ></input> */}
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
                <Gallery2 sethandleClose={handleClose} setPicture={setPicture} showaudio={false} showimage={true} />
              </Box>
            </Modal>
            {picture ? (
              <div className='selectedFileContainertask'>
                <div className='selectedFileTitle'>:תמונה שנבחרה</div>
                <div style={{ marginBottom: '1rem' }}>
                  {typeof picture === 'string'
                    ? extractFilenameFromURL(picture)
                    : picture?.name}
                </div>
                <div className='thumbnail'>
                  {typeof picture === 'string' && (
                    <img
                      src={picture}
                      className='thumbnailImg'
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
              <Gallery2 sethandleClose={handleClose} setPicture={setAudio} showaudio={true} showimage={false} />
            </Box>
          </Modal>
          {/* <div>
            <input
              required={true}
              accept='.mp3'
              type='file'
              className='form-control'
              onChange={(e) => setAudio(e.target.files[0])}
              style={{
                textAlign: 'right',
                width: '100%',
                height: '38px',
                direction: props.language === 'English' ? 'rtl' : 'ltr',
              }}
            ></input>
          </div> */}
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
            <Gallery2 sethandleClose={handleClose} setPicture={setPicture} showaudio={false} showimage={true} />
          </Box>
        </Modal>
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
            props.sethandleClose(false)
          }}
        />
      </div>
    </div>
  );
}
export default Model_Tasks_Pop;

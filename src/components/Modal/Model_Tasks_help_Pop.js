import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { FcMultipleInputs } from 'react-icons/fc';
import { RiAsterisk } from 'react-icons/ri';
import Gallery2 from '../Gallery/Gallery2';
import Gallery3 from '../Gallery/Gallery3';
import BasicSelect from '../Gallery/BasicSelect';
import { getBlobsInContainer } from '../azureBlob';
import InputFileUpload from '../InputFileUpload/InputFileUpload';

import Model_Tasks_help_for_user_Popup from './Model_Tasks_help_for_user_Popup';

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
    console.log(props.additonalHelp);
    let additonalHelp = {};

    if (props.additonalHelp.length > 0) {
        if (props.additonalHelp[0].UserID === "General") {
            additonalHelp = props.additonalHelp[0];
        }
    } else {
        additonalHelp = {
            id: '',
            help_text: '',
            picture_url: '',
            audio_url: '',
            video_url: '',
            UserID: "General",
        }
    }

    const [UserIDs, setUserIDs] = useState(additonalHelp?.UserID);
    const [help_text, setHelp_text] = useState(additonalHelp?.help_text);
    const [picture, setPicture] = useState(additonalHelp?.picture_url);
    const [audio, setAudio] = useState(additonalHelp?.audio_url);
    const [video, setVideo] = useState(additonalHelp?.video_url);

    const [additonalHelpUsers, setAdditonalHelpUsers] = useState(props.additonalHelp);


    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleOpen2 = () => setOpen2(true);
    const handleOpen3 = () => setOpen3(true);


    const handlehelptextInput = (e) => {
        setHelp_text(e.target.value);
    };

    const handleClose = () => {
        setOpen(false);
        setOpen2(false);
        setOpen3(false);
    }

    const extractFilenameFromURL = (url) => {
        const filename = url.split("/").pop();
        return filename;
    };


    const saveTask = () => {
        let GeneraladditonalHelp = {
            id: additonalHelp?.id,
            help_text: help_text,
            picture_url: picture,
            audio_url: audio,
            video_url: video,
            UserID: "General",
        };

        if (props.additonalHelp.length > 0 && props.additonalHelp[0].UserID === "General") {
            props.additonalHelp[0] = GeneraladditonalHelp
        } else {
            props.setAdditonalHelp([ GeneraladditonalHelp]);
        }


        if (additonalHelpUsers.length && additonalHelpUsers[0].UserID !== "General") {
            props.setAdditonalHelp([...(props.additonalHelp || []), additonalHelpUsers]);
        }

        props.setMainAdditonalHelp([ GeneraladditonalHelp , additonalHelpUsers]);

        props.sethandleClose(false);
    };

    const audioRef = useRef(null);

    const [Foldersite, setFoldersite] = useState('general');
    const [blobList, setBlobList] = useState([]);
    const [sortedUrls, setSortedUrls] = useState({});
    const [folderNames, setFolderNames] = useState([]);

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

        if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
            setFolderNames(Object.keys(sortedUrls));
        } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "STUDENT" || JSON.parse(sessionStorage.getItem('jwt'))?.role === "EDITOR") {
            const usersites = JSON.parse(sessionStorage.getItem('jwt')).sites;
            const filteredSortedUrls = Object.keys(sortedUrls).filter(url => {
                return usersites.some(site => site.nameInEnglish === url)
            });
            setFolderNames(filteredSortedUrls);
        }
    }, [blobList]);

    return (
        <div className='modalContainerTasks'
            style={{
                textAlign: props.language === 'English' ? 'right' : 'left',
                direction: props.language !== 'English' ? 'rtl' : 'ltr',
            }}
        >
            <div className='headerNewTask'>
                <div className='NewTaskTitle'>
                    {props.language !== 'English' ? 'Adtional Help' : 'תוכן נוסף'}
                </div>
            </div>
            <div
                className={`bodyNewTask ${props.requestForEditing === 'details' ? 'disabledModal' : ''
                    }`}
            >
                <form id='IPU' className='w3-container'>
                    <h6>
                        {props.language !== 'English'
                            ? ' write a additional help text'
                            : ': כתוב טקסט נוסף '}

                        <RiAsterisk style={{ color: 'red' }} />
                    </h6>
                    <p>
                        <input
                            required={true}
                            type='text'
                            onChange={handlehelptextInput}
                            style={{
                                width: '100%',
                                height: '38px',
                                paddingRight: '20px',
                                direction: props.language === 'English' ? 'rtl' : 'ltr',
                            }}
                            value={help_text}
                        ></input>
                    </p>
                </form>
                <h6>
                    {props.language !== 'English'
                        ? 'Select where to save picture / voice'
                        : ':בחר היכן לשמור תמונה/קול'}
                    <FcMultipleInputs />
                </h6>
                <BasicSelect setFoldersite={setFoldersite} folderName={Foldersite} folderlist={folderNames} />
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
                            <Gallery2 sethandleClose={handleClose} setPicture={setAudio} showaudio={true} showimage={false}/>
                        </Box>
                    </Modal>
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
                </form>

                <form id='IPU' className='w3-container'>
                    <h6>
                        {props.language !== 'English'
                            ? 'add additional text for specific students'
                            : ': הוסף טקסט נוסף לתלמידים מסוימים'}
                        <FcMultipleInputs />
                    </h6>
                    <Button variant="outlined" onClick={handleOpen3}>additional help for specific user</Button>

                    <Modal
                        open={open3}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: '15%',
                            left: '15%',
                            width: '70%',
                            height: '70%',
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            overflow: "hidden",
                            overflowY: "scroll",
                            p: 4,
                        }}>
                            <Model_Tasks_help_for_user_Popup
                                allUsers={props.allUsers}
                                UserIDs={UserIDs}
                                setUserIDs={setUserIDs}
                                language={props.language}
                                sethandleClose={handleClose}
                                setAdditonalHelpUsers={setAdditonalHelpUsers}
                                additonalHelpUsers={additonalHelpUsers}
                                setAdditonalHelp={props.setAdditonalHelp}
                                additonalHelp={props.additonalHelp}
                            />
                        </Box>
                    </Modal>
                </form>
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

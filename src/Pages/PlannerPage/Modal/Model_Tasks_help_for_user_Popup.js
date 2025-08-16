import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { FcMultipleInputs } from 'react-icons/fc';
import { RiAsterisk } from 'react-icons/ri';
import Gallery2 from '../../GalleryPage/Gallery/Gallery2';
import { getBlobsInContainer } from '../../../components/azureBlob';
import InputFileUpload from '../../../components/InputFileUpload/InputFileUpload';
import { FormControl, InputLabel, Select, MenuItem, TextField, Box, Button, Modal } from '@mui/material';

const style = {
    position: 'absolute',
    top: '5%',
    left: '5%',
    width: '90%',
    height: '90%',
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
const initialFormConfig = [
    {
        label: 'Select a user',
        type: 'select',
        value: 'UserID',
        options: 'allUsers',
        required: true,
    },
    {
        label: 'Write additional help text',
        type: 'text',
        value: 'help_text',
        required: true,
    },
    {
        label: 'Add a picture of a task from the Gallery / Desktop',
        type: 'file',
        value: 'picture',
        required: false,
    },
    {
        label: 'Add a voice clip describing the task',
        type: 'file',
        value: 'audio',
        required: false,
    },
];

function Model_Tasks_Pop_for_user(props) {
    let additonalHelp = [{
        id: "",
        help_text: "",
        picture: "",
        audio: "",
        video: "",
        UserID: "",
    }];

    if (props.additonalHelp && props.additonalHelp.length > 0) {
        additonalHelp = props.additonalHelp.filter(help => help.UserID !== "General");
        if (additonalHelp.length === 0) {
            additonalHelp = [{
                id: "",
                help_text: "",
                picture: "",
                audio: "",
                video: "",
                UserID: "",
            }];
        }
    } else {
        additonalHelp = [
            {
                id: "",
                help_text: "",
                picture: "",
                audio: "",
                video: "",
                UserID: "",
            }
        ];
    }

    console.log("additonalHelp", additonalHelp);

    const [formData, setFormData] = useState(additonalHelp.map(help => ({
        id: help.id || '',
        help_text: help.help_text || '',
        picture: help.picture || '',
        audio: help.audio || '',
        video: help.video || '',
        UserID: help.UserID || '',
    })));

    const [formConfigs, setFormConfigs] = useState([initialFormConfig]);

    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleOpen2 = () => setOpen2(true);

    const handleClose = () => {
        setOpen(false);
        setOpen2(false);
    };

    const handleInputChange = (e, formIndex) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const newData = [...prevData];
            newData[formIndex] = {
                ...newData[formIndex],
                [name]: value,
            };
            return newData;
        });
    };

    const extractFilenameFromURL = (url) => {
        const filename = url.split("/").pop();
        return filename;
    };

    const saveTask = () => {
        const allHelpData = formData.map(data => ({
            id: data.id,
            help_text: data.help_text,
            picture_url: data.picture,
            audio_url: data.audio,
            video_url: data.video,
            UserID: data.UserID,
        }));

        console.log("allHelpData", allHelpData);
        props.setAdditonalHelpUsers(allHelpData);
        // props.setAdditonalHelp(...(props.additonalHelp || []), allHelpData);
        props.sethandleClose(false);
    };

    const removeForm = (index) => {
        setFormConfigs((prevConfigs) => prevConfigs.filter((_, i) => i !== index));
        setFormData((prevData) => prevData.filter((_, i) => i !== index));
    };

    const audioRef = useRef(null);

    const [Foldersite, setFoldersite] = useState(props.siteNameInEnglish);
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

    const addNewForm = () => {
        setFormConfigs([...formConfigs, initialFormConfig]);
        setFormData([...formData, {
            help_text: '',
            picture: '',
            audio: '',
            video: '',
            UserID: '',
        }]);
    };

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
                {formConfigs.map((formConfig, formIndex) => (
                    <div key={formIndex}>
                        {formConfig.map((field, index) => (
                            <form key={index} id='IPU' className='w3-container'>
                                <h6>
                                    {props.language !== 'English'
                                        ? field.label
                                        : `: ${field.label}`}
                                    {field.required && <RiAsterisk style={{ color: 'red' }} />}
                                </h6>
                                {field.type === 'select' ? (
                                    <Box>
                                        <FormControl fullWidth>
                                            <InputLabel id={`select-label-${index}`}>
                                                {props.language !== 'English'
                                                    ? field.label
                                                    : `: ${field.label}`}
                                            </InputLabel>
                                            <Select
                                                labelId={`select-label-${index}`}
                                                id={`select-${index}`}
                                                name={field.value}
                                                value={formData[formIndex][field.value]}
                                                onChange={(e) => handleInputChange(e, formIndex)}
                                            >
                                                {props[field.options].map((item, idx) => (
                                                    <MenuItem key={idx} value={item.id}>{item.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                ) : field.type === 'text' ? (
                                    <TextField
                                        required={field.required}
                                        type='text'
                                        name={field.value}
                                        onChange={(e) => handleInputChange(e, formIndex)}
                                        style={{
                                            width: '100%',
                                            // height: '38px',
                                            // paddingRight: '20px',
                                            direction: props.language === 'English' ? 'rtl' : 'ltr',
                                        }}
                                        value={formData[formIndex][field.value]}
                                    />
                                ) : field.type === 'file' && field.value === 'picture' ? (
                                    <div>
                                        <InputFileUpload setPicture={(file) => setFormData((prevData) => {
                                            const newData = [...prevData];
                                            newData[formIndex].picture = file;
                                            return newData;
                                        })} language={props.language} />
                                        <Button variant="outlined" onClick={handleOpen}>Gallery</Button>
                                        <Modal
                                            open={open}
                                            onClose={handleClose}
                                            aria-labelledby="modal-modal-title"
                                            aria-describedby="modal-modal-description"
                                        >
                                            <Box sx={style2}>
                                                <Gallery2 sethandleClose={handleClose} setPicture={(file) => setFormData((prevData) => {
                                                    const newData = [...prevData];
                                                    newData[formIndex].picture = file;
                                                    return newData;
                                                })} showaudio={false} showimage={true}/>
                                            </Box>
                                        </Modal>
                                        {formData[formIndex].picture ? (
                                            <div className='selectedFileContainertask'>
                                                <div className='selectedFileTitle'>:תמונה שנבחרה</div>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    {typeof formData[formIndex].picture === 'string'
                                                        ? extractFilenameFromURL(formData[formIndex].picture)
                                                        : formData[formIndex].picture?.name}
                                                </div>
                                                <div className='thumbnail'>
                                                    {typeof formData[formIndex].picture === 'string' && (
                                                        <img
                                                            src={formData[formIndex].picture}
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
                                ) : field.type === 'file' && field.value === 'audio' ? (
                                    <div>
                                        <InputFileUpload setPicture={(file) => setFormData((prevData) => {
                                            const newData = [...prevData];
                                            newData[formIndex].audio = file;
                                            return newData;
                                        })} language={props.language} />
                                        <Button variant="outlined" onClick={handleOpen2}>Gallery audio</Button>
                                        <Modal
                                            open={open2}
                                            onClose={handleClose}
                                            aria-labelledby="modal-modal-title"
                                            aria-describedby="modal-modal-description"
                                        >
                                            <Box sx={style2}>
                                                <Gallery2 sethandleClose={handleClose} setPicture={(file) => setFormData((prevData) => {
                                                    const newData = [...prevData];
                                                    newData[formIndex].audio = file;
                                                    return newData;
                                                })} showaudio={true} showimage={false}/>
                                            </Box>
                                        </Modal>
                                        {formData[formIndex].audio ? (
                                            <div className='selectedFileContainertask'>
                                                <div className='selectedFileTitle'>
                                                    <span>:</span>
                                                    אודיו שנבח
                                                </div>
                                                <div className='audioNameContainer'>
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        {typeof formData[formIndex].audio === 'string'
                                                            ? extractFilenameFromURL(formData[formIndex].audio)
                                                            : formData[formIndex].audio?.name}
                                                    </div>
                                                    <div>
                                                    </div>
                                                    <audio ref={audioRef} controls>
                                                        <source
                                                            src={typeof formData[formIndex].audio === 'string' ? formData[formIndex].audio : ''}
                                                            type='audio/mpeg'
                                                        />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ marginBottom: '1rem' }}>
                                                {props.language !== 'English'
                                                    ? 'Selected audio: No audio file found'
                                                    : ' אודיו שנבחר: לא נמצא קובץ אודיו'}
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                            </form>
                        ))}
                        <Button variant="outlined" color="secondary" onClick={() => removeForm(formIndex)}>Remove</Button>
                    </div>
                ))}
                <Button variant="outlined" onClick={addNewForm}>Add More</Button>
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
export default Model_Tasks_Pop_for_user;
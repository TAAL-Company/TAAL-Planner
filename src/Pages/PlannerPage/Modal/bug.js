import React, { useState } from 'react';
import { Modal, Button, Box, Select, InputLabel, MenuItem, FormControl } from '@mui/material';

function Model_Tasks_help_for_user_Popup(props) {
    const [dataEntryType, setdataEntryType] = useState('');
    const [studentIds, setStudentIds] = useState([]);
    const [formFields, setFormFields] = useState([
        { id: 'UserID', type: 'dropdown', value: '' },
        { id: 'additionalHelpText', type: 'text', value: '' },
        { id: 'picture_url', type: 'text', value: '' },
        { id: 'audio_url', type: 'text', value: '' },
        { id: 'video_url', type: 'text', value: '' },
    ]);

    const handleAddStudentId = () => {
        setStudentIds([...studentIds, {}]);
        setFormFields([...formFields]);
    };

    const handleRemoveStudentId = (index) => {
        setStudentIds(studentIds.filter((_, i) => i !== index));
        setFormFields(formFields.filter((_, i) => i !== index));
    };

    const handleInputChange = (index, fieldId, value) => {
        const updatedFormFields = formFields.map((field, i) => {
            if (i === index && field.id === fieldId) {
                return { ...field, value };
            }
            return field;
        });
        setFormFields(updatedFormFields);
    };

    return (
        <div>
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
                </div>
            </div>
            <h2 id="modal-modal-title">Student IDs</h2>
            <p id="modal-modal-description">
                {(props.studentIds || []).map((studentId, index) => (
                    <div key={index}>{studentId}</div>
                ))}
            </p>
            {studentIds.map((studentId, index) => (
                <div key={index}>
                    {formFields.map((field) => (
                        <form key={field.id} id='IPU' className='w3-container'>
                            <h6>
                                {field.id}
                                {props.language !== 'English'
                                    ? ' write a additional help text'
                                    : ': כתוב טקסט נוסף '}

                                {/* <RiAsterisk style={{ color: 'red' }} /> */}
                            </h6>
                            <p>
                                {field.type === 'dropdown' ? (
                                    <Box >
                                        <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">
                                                {props.language !== 'English'
                                                    ? ' select a user'
                                                    : ': בחר משתמש '}
                                            </InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={field.value}
                                                label="Age"
                                                onChange={(e) => handleInputChange(index, field.id, e.target.value)}>
                                                {props.allUsers.map((item, index) => <MenuItem key={index} value={item.id}>{item.name}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                ) :
                                    <input
                                        required={true}
                                        type={field.type}
                                        onChange={(e) => handleInputChange(index, field.id, e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '38px',
                                            paddingRight: '20px',
                                            direction: props.language === 'English' ? 'rtl' : 'ltr',
                                        }}
                                        value={field.value}
                                    ></input>
                                }

                            </p>
                        </form>
                    ))}
                    <button onClick={() => handleRemoveStudentId(index)}>Remove</button>
                </div>
            ))}
            <button onClick={handleAddStudentId}>Add Student ID</button>
        </div>
    );
}

export default Model_Tasks_help_for_user_Popup;
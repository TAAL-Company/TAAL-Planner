import { Button } from "@mui/material";
import React from "react";
import InputFileUpload from "../../InputFileUpload/InputFileUpload";
import { useTranslation } from "react-i18next";

const DataTable = ({
    data,
    language,
    headerMapping,
    handleRemoveAudio,
    handleUploadAudio,
    handleDragOver,
    handleDrop,
    handleAudioDrop,
    draggedImage,
    draggedAudio,
    handleOpenAudioGallery,
    setData,
    handleOpenImageGallery
}) => {
    const { t } = useTranslation();

    // Add this function inside your component
    const handleRemoveImage = (rowIdx) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], image: null };
            return newData;
        });
    };

    const handleEditCell = (rowIdx, key, value) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], [key]: value };
            return newData;
        });
    };

    const handleUploadImage = (rowIdx, file) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], image: file };
            return newData;
        });
    };

    // Modify the handleAddTask function to insert a task below the specified row
    const handleAddTask = (rowIdx) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData.splice(rowIdx + 1, 0, {
                Task: "",
                Station: "",
                Subtitle: "",
                "Estimated Time Seconds": "",
                Help: "",
                Image: null,
                Audio: null,
            });
            return newData;
        });
    };

    // Add a function to delete a task
    const handleDeleteTask = (rowIdx) => {
        setData((prevData) => prevData.filter((_, idx) => idx !== rowIdx));
    };

    return (
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 800,
                direction: t('Direction'),
                textAlign: t('Direction') === 'rtl' ? 'right' : 'left'
            }}
        >
            <thead>
                <tr>
                    {Object.keys(data[0])
                        .filter(key => key !== "Image" && key !== "Site")
                        .map((key) => (
                            <th
                                key={key}
                                style={{
                                    border: '1px solid #ccc',
                                    padding: 8,
                                    background: '#f0f0f0',
                                    fontWeight: 600,
                                    direction: t('Direction'),
                                    textAlign: t('Direction') === 'rtl' ? 'right' : 'left'
                                }}
                            >
                                {key === 'image'
                                    ? (t('Image'))
                                    : key === 'audio'
                                        ? (t('Audio'))
                                        : (t('Direction') === 'rtl'
                                            ? (headerMapping[key]?.[1] || key)
                                            : key)
                                }
                            </th>
                        ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={idx} style={{ transition: 'background 0.2s', cursor: 'pointer' }}>
                        {Object.keys(data[0])
                            .filter(key => key !== "Image" && key !== "Site")
                            .map((key) => (
                                <td
                                    key={key}
                                    style={{
                                        border: '1px solid #ccc',
                                        padding: 8,
                                        position: 'relative',
                                        verticalAlign: 'middle',
                                        background:
                                            (key === 'image' && draggedImage) || (key === 'audio' && draggedAudio)
                                                ? '#e6f7ff'
                                                : undefined,
                                        outline:
                                            (key === 'image' && draggedImage) || (key === 'audio' && draggedAudio)
                                                ? '2px dashed #256fa1'
                                                : undefined,
                                        transition: 'background 0.2s, outline 0.2s',
                                        direction: t('Direction'),
                                        textAlign: t('Direction') === 'rtl' ? 'right' : 'left'
                                    }}
                                    {...(key === 'image'
                                        ? {
                                            onDragOver: handleDragOver,
                                            onDrop: () => handleDrop(idx),
                                        }
                                        : key === 'audio'
                                            ? {
                                                onDragOver: handleDragOver,
                                                onDrop: () => handleAudioDrop(idx),
                                            }
                                            : {})}
                                >
                                    {key === 'image' ? (
                                        <div style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            minHeight: 40,
                                            direction: t('Direction'),
                                        }}>
                                            {row[key] && (
                                                <>
                                                    <img
                                                        src={typeof row[key] === 'string' ? row[key] : URL.createObjectURL(row[key])}
                                                        alt="preview"
                                                        style={{
                                                            width: 150,
                                                            height: 150,
                                                            objectFit: 'contain',
                                                            borderRadius: 4,
                                                            border: '1px solid #ddd'
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            background: 'rgba(255,255,255,0.85)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            cursor: 'pointer',
                                                            width: 22,
                                                            height: 22,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            color: '#ca0a0a',
                                                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                                        }}
                                                        title={t('SpreadsheetPopup.Remove_image')}
                                                    >×</button>
                                                </>
                                            )}
                                            {/* <label style={{
                                                display: 'inline-block',
                                                padding: '4px 10px',
                                                background: '#eee',
                                                borderRadius: 4,
                                                border: '1px solid #ccc',
                                                cursor: 'pointer',
                                                fontSize: 12,
                                                marginLeft: row[key] ? 8 : 0
                                            }}>
                                                {row[key]
                                                    ? (language === 'English' ? 'החלף' : 'Replace')
                                                    : (language === 'English' ? 'העלה' : 'Upload')}
                                                <input
                                                    dir={language === 'English' ? 'rtl' : 'ltr'}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none', direction: language === 'English' ? 'rtl' : 'ltr', }}
                                                    onChange={e => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleUploadImage(idx, e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </label> */}
                                            <InputFileUpload
                                                language={language}
                                                setPicture={(file) => handleUploadImage(idx, file)}
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleOpenImageGallery(idx)}
                                                style={{
                                                    fontSize: 10,
                                                    padding: '2px 8px',
                                                    minWidth: 'auto'
                                                }}
                                            >
                                                {t('SpreadsheetPopup.Gallery')}
                                            </Button>
                                            {!row[key] && (
                                                <span style={{
                                                    color: '#aaa',
                                                    fontSize: 13,
                                                    marginLeft: 8
                                                }}>
                                                    {t('SpreadsheetPopup.Drag_image_here')}
                                                </span>
                                            )}
                                        </div>
                                    ) : key === 'audio' ? (
                                        <div style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            minHeight: 40,
                                            direction: t('Direction'),
                                        }}>
                                            {row[key] && (
                                                <>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: 4
                                                    }}>
                                                        <audio controls style={{ width: '200px', height: '30px' }}>
                                                            <source src={typeof row[key] === 'string' ? row[key] : URL.createObjectURL(row[key])} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                        <span style={{
                                                            fontSize: 12,
                                                            color: '#666',
                                                            maxWidth: '200px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {typeof row[key] === 'string'
                                                                ? row[key].split('/').pop()
                                                                : row[key].name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAudio(idx)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            background: 'rgba(255,255,255,0.85)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            cursor: 'pointer',
                                                            width: 22,
                                                            height: 22,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            color: '#ca0a0a',
                                                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                                        }}
                                                        title={t("SpreadsheetPopup.Remove_audio")}
                                                    >×</button>
                                                </>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <label style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    background: '#eee',
                                                    borderRadius: 4,
                                                    border: '1px solid #ccc',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    textAlign: 'center'
                                                }}>
                                                    {row[key]
                                                        ? (t('SpreadsheetPopup.Replace'))
                                                        : (t('SpreadsheetPopup.Upload_Audio'))}
                                                    <input
                                                        dir={t('Direction')}
                                                        type="file"
                                                        accept="audio/*"
                                                        style={{ display: 'none', direction: t('Direction'), }}
                                                        onChange={e => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleUploadAudio(idx, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleOpenAudioGallery(idx)}
                                                    style={{
                                                        fontSize: 10,
                                                        padding: '2px 8px',
                                                        minWidth: 'auto'
                                                    }}
                                                >
                                                    {t('SpreadsheetPopup.Gallery')}
                                                </Button>
                                            </div>
                                            {!row[key] && (
                                                <span style={{
                                                    color: '#aaa',
                                                    fontSize: 13,
                                                    marginLeft: 8
                                                }}>
                                                    {t('SpreadsheetPopup.Upload_audio_file')}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={row[key] ?? ''}
                                            onChange={e => handleEditCell(idx, key, e.target.value)}
                                            style={{
                                                width: '100%',
                                                border: '1px solid #ddd',
                                                borderRadius: 4,
                                                background: '#fafafa',
                                                padding: '4px 8px',
                                                fontSize: 14,
                                                direction: t('Direction'),
                                                textAlign: t('Direction') === 'rtl' ? 'right' : 'left'
                                            }}
                                        />
                                    )}
                                </td>
                            ))}
                        {/* Add/Delete Task Buttons */}
                        <td>
                            <button
                                onClick={() => handleDeleteTask(idx)}
                                style={{
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                }}
                            >
                                {t('SpreadsheetPopup.Delete')}
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleAddTask(idx)}
                                style={{
                                    background: 'green',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                }}
                            >
                                {t('SpreadsheetPopup.Add')}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;
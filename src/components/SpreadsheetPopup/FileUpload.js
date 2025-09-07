import React from "react";
import { RiAsterisk } from 'react-icons/ri';

const FileUpload = ({ language, handleOnChange }) => {
    return (
        <form id='IPU' className='w3-container' style={{ marginBottom: 24 }}>
            <h6 style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 8,
                color: '#256fa1',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                direction: language === 'English' ? 'rtl' : 'ltr',
                textAlign: language === 'English' ? 'right' : 'left'
            }}>
                <span role="img" aria-label="upload" style={{ fontSize: 22 }}>📤</span>
                {language !== 'English' ? 'Upload a xlsx file' : ' העלה קובץ xlsx '}
                <RiAsterisk style={{ color: 'red' }} />
            </h6>
            <div
                style={{
                    border: '2px dashed #256fa1',
                    borderRadius: 8,
                    background: '#f8faff',
                    padding: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    transition: 'border 0.2s',
                    direction: language === 'English' ? 'rtl' : 'ltr',
                }}
                onClick={() => document.getElementById('xlsx-upload-input').click()}
                tabIndex={0}
                onKeyPress={e => { if (e.key === 'Enter') document.getElementById('xlsx-upload-input').click(); }}
                title={language !== 'English'
                    ? 'Click or drag a file here'
                    : 'לחץ או גרור קובץ לכאן'}
            >
                <span role="img" aria-label="drag" style={{ fontSize: 32 }}>📂</span>
                <span style={{
                    fontSize: 16,
                    color: '#256fa1',
                    fontWeight: 500
                }}>
                    {language !== 'English'
                        ? 'Click or drag your Excel file here'
                        : 'לחץ או גרור את קובץ האקסל לכאן'}
                </span>
                <input
                    id="xlsx-upload-input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleOnChange}
                    required={true}
                    style={{ display: 'none' }}
                />
            </div>
            <div style={{
                fontSize: 13,
                color: '#888',
                marginTop: 8,
                direction: language === 'English' ? 'rtl' : 'ltr',
                textAlign: language === 'English' ? 'right' : 'left'
            }}>
                {language !== 'English'
                    ? 'Supported formats: .xlsx, .xls'
                    : 'פורמטים נתמכים: .xlsx, .xls'}
            </div>
        </form>
    );
};

export default FileUpload;
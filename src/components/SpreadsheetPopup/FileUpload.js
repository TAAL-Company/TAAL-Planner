import React from "react";
import { useTranslation } from "react-i18next";
import { RiAsterisk } from 'react-icons/ri';

const FileUpload = ({ language, handleOnChange }) => {
    const { t } = useTranslation();
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
                direction: t('Direction'),
                textAlign: t('Direction') === 'rtl' ? 'right' : 'left'
            }}>
                <span role="img" aria-label="upload" style={{ fontSize: 22 }}>📤</span>
                {t('SpreadsheetPopup.Upload_a_xlsx_file')}
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
                    direction: t('Direction'),
                }}
                onClick={() => document.getElementById('xlsx-upload-input').click()}
                tabIndex={0}
                onKeyPress={e => { if (e.key === 'Enter') document.getElementById('xlsx-upload-input').click(); }}
                title={t('SpreadsheetPopup.Click_or_drag_a_file_here')}
            >
                <span role="img" aria-label="drag" style={{ fontSize: 32 }}>📂</span>
                <span style={{
                    fontSize: 16,
                    color: '#256fa1',
                    fontWeight: 500
                }}>
                    {t('SpreadsheetPopup.Click_or_drag_your_Excel_file_here')}
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
                direction: t('Direction'),
                textAlign: t('Direction') === 'rtl' ? 'right' : 'left'
            }}>
                {t('SpreadsheetPopup.Supported_formats_xlsx_xls_only')}
            </div>
        </form>
    );
};

export default FileUpload;
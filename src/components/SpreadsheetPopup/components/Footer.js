import React from "react";
import { useTranslation } from "react-i18next";

const Footer = ({ language, processGroupedData, handleCloseopenUpload }) => {
    const { t } = useTranslation();
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                height: '100px',
                alignItems: 'center',
                padding: '40px',
                marginBottom: '20px',
                flex: '0 0 auto',
            }}
            className='footerNewTasks'
        >
            <input
                type='submit'
                className='saveTaskButton'
                style={{ backgroundColor: '#ca0a0a' }}
                value={t('SpreadsheetPopup.Upload_data')}
                onClick={processGroupedData}
            />
            <input
                type='submit'
                className='cancelTaskButton'
                value={t('SpreadsheetPopup.Cancel')}
                onClick={handleCloseopenUpload}
            />
        </div>
    );
};

export default Footer;
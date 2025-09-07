import React from "react";

const Footer = ({ language, processGroupedData, handleCloseopenUpload }) => {
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
                value={
                    language !== 'English' ? 'Upload data' : ' העלה נתונים '
                }
                onClick={processGroupedData}
            />
            <input
                type='submit'
                className='cancelTaskButton'
                value={language !== 'English' ? 'Cancel' : 'ביטול'}
                onClick={handleCloseopenUpload}
            />
        </div>
    );
};

export default Footer;
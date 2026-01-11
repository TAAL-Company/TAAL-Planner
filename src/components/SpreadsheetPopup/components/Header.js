import React from "react";
import { useTranslation } from "react-i18next";

const Header = ({ language, selectedSite }) => {
    const { t } = useTranslation();
    return (
        <div className='headerNewTask' style={{ backgroundColor: 'green', flex: '0 0 auto' }}>
            <div className='NewTaskTitle'>
                {t(`SpreadsheetPopup.Selected_Site`)+`${selectedSite.name}`} 
            </div>
        </div>
    );
};

export default Header;
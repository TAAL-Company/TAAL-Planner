import React from "react";

const Header = ({ language, selectedSite }) => {
    return (
        <div className='headerNewTask' style={{ backgroundColor: 'green', flex: '0 0 auto' }}>
            <div className='NewTaskTitle'>
                {language !== 'English'
                    ? `Selected Site : ${selectedSite.name}`
                    : `${selectedSite.name} : אתר נבחר`}
            </div>
        </div>
    );
};

export default Header;
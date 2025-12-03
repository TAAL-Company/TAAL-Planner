import React from 'react';
import { getTranslation } from '../i18n';

const Status = ({ classification, language = 'he' }) => {
  const getStatusStyle = () => {
    switch (classification) {
      case 'green':
        return {
          backgroundColor: '#4CAF50',
          color: 'white',
          label: language === 'he' ? 'ירוק' : 'Green',
        };
      case 'yellow':
        return {
          backgroundColor: '#FFC107',
          color: 'white',
          label: language === 'he' ? 'צהוב' : 'Yellow',
        };
      case 'red':
        return {
          backgroundColor: '#F44336',
          color: 'white',
          label: language === 'he' ? 'אדום' : 'Red',
        };
      default:
        return {
          backgroundColor: '#9E9E9E',
          color: 'white',
          label: language === 'he' ? 'לא ידוע' : 'Unknown',
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div
      style={{
        backgroundColor: statusStyle.backgroundColor,
        color: statusStyle.color,
        padding: '5px 15px',
        borderRadius: '15px',
        display: 'inline-block',
        fontWeight: 'bold',
        fontSize: '0.9rem',
      }}
    >
      {statusStyle.label}
    </div>
  );
};

export default Status;

import React from 'react';
import { getTranslation } from '../i18n';

const GeneralPerformanceColumns = ({ language }) => {
  const t = (key) => getTranslation(key, language);

  const columns = [
    {
      field: 'id',
      headerName: t('id'),
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.id) + 1,
    },
    { 
      field: 'index', 
      headerName: 'NO' 
    },
    { 
      field: 'trait', 
      headerName: t('trait'), 
      flex: 1 
    },
    { 
      field: 'requiredField', 
      headerName: t('requiredField'), 
      flex: 1 
    },
    { 
      field: 'category', 
      headerName: t('category'), 
      flex: 1 
    },
    { 
      field: 'score', 
      headerName: t('score'), 
      flex: 1 
    },
    { 
      field: 'ML', 
      headerName: t('ml') 
    },
  ];

  return { columns };
};

export default GeneralPerformanceColumns;

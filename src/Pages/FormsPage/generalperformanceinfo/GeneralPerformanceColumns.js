import React from 'react';
import { useTranslation } from 'react-i18next';

const GeneralPerformanceColumns = () => {
  const { t } = useTranslation();

  const columns = [
    {
      field: 'id',
      headerName: t('FormsPage.id'),
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.id) + 1,
    },
    { 
      field: 'index', 
      headerName: 'NO' 
    },
    { 
      field: 'trait', 
      headerName: t('FormsPage.trait'), 
      flex: 1 
    },
    { 
      field: 'requiredField', 
      headerName: t('FormsPage.requiredField'), 
      flex: 1 
    },
    { 
      field: 'category', 
      headerName: t('FormsPage.category'), 
      flex: 1 
    },
    { 
      field: 'score', 
      headerName: t('FormsPage.score'), 
      flex: 1 
    },
    { 
      field: 'ML', 
      headerName: t('FormsPage.ml') 
    },
  ];

  return { columns };
};

export default GeneralPerformanceColumns;

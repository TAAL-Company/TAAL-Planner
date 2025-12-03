import React from 'react';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { getTranslation } from '../i18n';

const PersonalInfoColumns = ({ language, handleEdit }) => {
  const t = (key) => getTranslation(key, language);

  const columns = [
    {
      field: 'id',
      headerName: t('id'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'fieldHEPrivateCard',
      headerName: t('fieldHE'),
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'xPrivateCard',
      headerName: t('xField'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'yPrivateCard',
      headerName: t('yField'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'fieldENPrivateCard',
      headerName: t('fieldEN'),
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'classificationHEPrivateCard',
      headerName: t('classificationHE'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'beginningOfWorkPrivateCard',
      headerName: t('beginningOfWork'),
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'employersPrivateCard',
      headerName: t('employers'),
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'reportsPrivateCard',
      headerName: t('reports'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'improvementPrivateCard',
      headerName: t('improvement'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'Remarks',
      headerName: t('remarks'),
      width: 250,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actionsPrivateCard',
      type: 'actions',
      width: 180,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon style={{ fill: 'gray' }} />}
          label={t('edit')}
          onClick={() => handleEdit(params.row)}
          showInMenu
        />,
      ],
    },
  ];

  return { columns };
};

export default PersonalInfoColumns;

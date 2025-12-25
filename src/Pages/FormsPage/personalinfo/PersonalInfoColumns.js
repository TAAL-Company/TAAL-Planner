import React from 'react';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';

const PersonalInfoColumns = ({  handleEdit }) => {
  const { t } = useTranslation();

  const columns = [
    {
      field: 'id',
      headerName: t('FormsPage.id'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'fieldHEPrivateCard',
      headerName: t('FormsPage.fieldHE'),
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'xPrivateCard',
      headerName: t('FormsPage.xField'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'yPrivateCard',
      headerName: t('FormsPage.yField'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'fieldENPrivateCard',
      headerName: t('FormsPage.fieldEN'),
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'classificationHEPrivateCard',
      headerName: t('FormsPage.classificationHE'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'beginningOfWorkPrivateCard',
      headerName: t('FormsPage.beginningOfWork'),
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'employersPrivateCard',
      headerName: t('FormsPage.employers'),
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'reportsPrivateCard',
      headerName: t('FormsPage.reports'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'improvementPrivateCard',
      headerName: t('FormsPage.improvement'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'Remarks',
      headerName: t('FormsPage.remarks'),
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
          label={t('FormsPage.edit')}
          onClick={() => handleEdit(params.row)}
          showInMenu
        />,
      ],
    },
  ];

  return { columns };
};

export default PersonalInfoColumns;

import React from 'react';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';

const TaskPerformanceColumns = ({ handleEdit }) => {
  const { t } = useTranslation();

  const columns = [
    {
      field: 'id',
      headerName: t('FormsPage.id'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ textAlign: 'center', fontSize: '1rem' }}>
          {params.row.id + 1}
        </div>
      ),
    },
    {
      field: 'fieldHE',
      headerName: t('FormsPage.fieldHE'),
      width: 200,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'mustField',
      headerName: t('FormsPage.mustField'),
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'subfield',
      headerName: t('FormsPage.subfield'),
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'grade',
      headerName: t('FormsPage.grade'),
      width: 150,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: ['F', 'D', 'C', 'B', 'A'],
    },
    {
      field: 'fieldEN',
      headerName: t('FormsPage.fieldEN'),
      width: 160,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'classificationHE',
      headerName: t('FormsPage.classificationHE'),
      width: 200,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'classificationEN',
      headerName: 'classification',
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'MLFactor',
      headerName: t('FormsPage.mlFactor'),
      width: 120,
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
      field: 'actions',
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

export default TaskPerformanceColumns;

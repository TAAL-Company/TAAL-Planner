import React from 'react';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { getTranslation } from '../i18n';

const TaskPerformanceColumns = ({ language, handleEdit }) => {
  const t = (key) => getTranslation(key, language);

  const columns = [
    {
      field: 'id',
      headerName: t('id'),
      width: 90,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ textAlign: 'right', fontSize: '1rem' }}>
          {params.row.id + 1}
        </div>
      ),
    },
    {
      field: 'fieldHE',
      headerName: t('fieldHE'),
      width: 200,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'mustField',
      headerName: t('mustField'),
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'subfield',
      headerName: t('subfield'),
      width: 120,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'grade',
      headerName: t('grade'),
      width: 150,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: ['F', 'D', 'C', 'B', 'A'],
    },
    {
      field: 'fieldEN',
      headerName: t('fieldEN'),
      width: 160,
      editable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'classificationHE',
      headerName: t('classificationHE'),
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
      headerName: t('mlFactor'),
      width: 120,
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
      field: 'actions',
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

export default TaskPerformanceColumns;

import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Status from './Status';
import { getTranslation } from '../i18n';

const FlagsColumns = ({ language, handleEdit, handleDelete }) => {
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
      field: 'image',
      headerName: t('image'),
      headerAlign: 'center',
      width: 100,
      editable: false,
      sortable: false,
      disableExport: true,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <div>
            <img
              src={params.row.image}
              alt=''
              style={{
                marginRight: '10px',
                marginTop: '4px',
                width: '71px',
                height: '45px',
                borderRadius: '6px',
              }}
            />
          </div>
        );
      },
    },
    {
      field: 'task',
      headerName: t('task'),
      width: 200,
      editable: false,
      headerAlign: 'center',
      align: language === 'he' ? 'left' : 'left',
      renderCell: (params) => (
        <div style={{ textAlign: language === 'he' ? 'right' : 'left', fontSize: '1rem' }}>
          {params.row.task}
        </div>
      ),
    },
    {
      field: 'classification',
      headerName: t('classification'),
      width: language === 'he' ? 140 : 160,
      editable: false,
      renderCell: (params) => (
        <Status classification={params.row.classification} language={language} />
      ),
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'taskAbilityField',
      headerName: t('taskAbility'),
      width: 300,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ textAlign: 'right', fontSize: '1rem' }}>
          {params.row.classification === 'GREEN' ? (
            <></>
          ) : (
            <select
              id='combo-box-demo'
              style={{ width: 300, height: 50 }}
              value='DEFAULT'
              readOnly
            >
              <option value='DEFAULT' disabled>
                {t('taskAbilityListPlaceholder')}
              </option>

              {params.row.TaskAbilitylist?.map((option, index) => (
                <option
                  key={index}
                  value={option}
                  style={{
                    textAlign: 'right',
                    fontSize: '1rem',
                  }}
                >
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: t('actions'),
      headerAlign: language === 'he' ? 'left' : 'center',
      align: language === 'he' ? 'left' : 'center',
      type: 'actions',
      direction: language === 'he' ? 'rtl' : 'ltr',
      width: 90,
      editable: false,
      sortable: false,
      disableExport: true,
      getActions: (params) => {
        let actions = [];

        if (params.row.classification !== 'GREEN') {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon style={{ fill: 'gray' }} />}
              label={t('edit')}
              onClick={() => handleEdit(params.row)}
              showInMenu
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            icon={<DeleteIcon style={{ fill: 'gray' }} />}
            label={t('delete')}
            onClick={() => handleDelete(params.id)}
            showInMenu
          />
        );
        return actions;
      },
    },
  ];

  return { columns };
};

export default FlagsColumns;

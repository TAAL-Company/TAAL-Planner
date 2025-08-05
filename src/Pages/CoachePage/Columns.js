import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

const Columns = ({ handleClickMenu }) => {
  const { t } = useTranslation();

  // Columns for the DataGrid
  const columns = [
    {
      field: 'picture_url',
      headerName: t('CoachPage.Avatar'),
      width: 70,
      renderCell: (params) => {
        return <Avatar alt="Coach Avatar" src={params.value} />;
      },
    },
    { field: 'name', headerName: t('CoachPage.Name'), width: 150 },
    { field: 'email', headerName: t('CoachPage.Email'), width: 200 },
    { field: 'phone', headerName: t('CoachPage.Phone'), width: 150 },
    {
      field: 'created_at',
      headerName: t('CoachPage.CreatedAt'),
      width: 150,
      valueGetter: (params) => {
        const createdAt = params.row.createdAt;
        return createdAt ? new Date(createdAt).toLocaleString() : '';
      },
    },
    {
      field: 'last_login_at',
      headerName: t('CoachPage.LastLoginAt'),
      width: 150,
      valueGetter: (params) => {
        const lastLoginAt = params.row.lastLoginAt;
        return lastLoginAt ? new Date(lastLoginAt).toLocaleString() : '';
      },
    },
    {
      field: 'menu',
      headerName: '',
      width: 50,
      renderCell: (params) => {
        return (
          <IconButton onClick={(e) => handleClickMenu(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        );
      },
    },
  ];

  return { columns };
};

export default Columns;
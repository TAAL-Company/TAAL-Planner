import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import I18nHoverText from '../../components/I18nHoverText/I18nHoverText';

const Columns = ({ handleClickMenu }) => {
  const { t } = useTranslation();
  // DataGrid headerName stays a plain string (used for sorting/column menu a11y text); renderHeader adds the hover.
  const renderHeaderWithHover = (key) => () => (
    <I18nHoverText translationKey={key}>{t(key)}</I18nHoverText>
  );

  // Columns for the DataGrid
  const columns = [
    {
      field: 'picture_url',
      headerName: t('CoachPage.Avatar'),
      renderHeader: renderHeaderWithHover('CoachPage.Avatar'),
      width: 70,
      renderCell: (params) => {
        return <Avatar alt="Coach Avatar" src={params.value} />;
      },
    },
    { field: 'name', headerName: t('CoachPage.Name'), renderHeader: renderHeaderWithHover('CoachPage.Name'), width: 150 },
    { field: 'email', headerName: t('CoachPage.Email'), renderHeader: renderHeaderWithHover('CoachPage.Email'), width: 200 },
    { field: 'phone', headerName: t('CoachPage.Phone'), renderHeader: renderHeaderWithHover('CoachPage.Phone'), width: 150 },
    {
      field: 'created_at',
      headerName: t('CoachPage.CreatedAt'),
      renderHeader: renderHeaderWithHover('CoachPage.CreatedAt'),
      width: 150,
      valueGetter: (params) => {
        const createdAt = params.row.createdAt;
        return createdAt ? new Date(createdAt).toLocaleString() : '';
      },
    },
    {
      field: 'last_login_at',
      headerName: t('CoachPage.LastLoginAt'),
      renderHeader: renderHeaderWithHover('CoachPage.LastLoginAt'),
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
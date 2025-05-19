import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

const Columns = ({ handleClickMenu }) => {
  const { t } = useTranslation();

  const columns = [
    {
      field: 'picture_url',
      headerName: t('SitePage.Avatar'),
      width: 70,
      renderCell: (params) => <Avatar alt="Site" src={params.value} />,
    },
    { field: 'name', headerName: t('SitePage.Name'), width: 150 },
    { field: 'description', headerName: t('SitePage.Description') || 'Description', width: 200 },
    { field: 'nameInEnglish', headerName: t('SitePage.NameInEnglish') || 'Name in English', width: 180 },
    {
      field: 'menu',
      headerName: '',
      width: 50,

      renderCell: (params) => (
        <IconButton onClick={(e) => handleClickMenu(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return { columns };
};

export default Columns;
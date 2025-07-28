import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableViewIcon from '@mui/icons-material/TableView';

const Columns = ({ handleClickMenu, handleSectionExpandToggle }) => {
    const { t } = useTranslation();

    const columns = [
        {
            field: 'picture_url',
            headerName: t('UserPage.Avatar'),
            width: 100,
            renderCell: (params) => (
                <Avatar alt={params.row.name} src={params.value || ''} />
            ),
        },
        { field: 'name', headerName: t('UserPage.Name'), width: 150 },
        { field: 'email', headerName: t('UserPage.Email'), width: 200 },
        { field: 'phone', headerName: t('UserPage.Phone'), width: 120 },
        { field: 'role', headerName: t('UserPage.Role'), width: 120 },
        {
            field: 'sites',
            headerName: t('SitePage.Sites'),
            width: 100,
            renderCell: (params) => {
                const hassites = params.row.sites && params.row.sites.length > 0;
                if (!hassites) return null;
                return (
                    <div onClick={() => handleSectionExpandToggle(params.row.id, 'sites', params.row)}>
                        <TableViewIcon style={{ color: 'teal', cursor: 'pointer' }} />
                    </div>
                );
            },
        },
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

    const siteColumns = [
        { field: 'name', headerName: t('SitePage.Name'), width: 180 },
        { field: 'description', headerName: t('SitePage.Description'), width: 220 },
        { field: 'nameInEnglish', headerName: t('SitePage.NameInEnglish'), width: 180 },
    ];

    return { columns, siteColumns };
};

export default Columns;
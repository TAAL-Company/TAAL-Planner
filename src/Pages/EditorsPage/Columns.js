import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableViewIcon from '@mui/icons-material/TableView';
import I18nHoverText from '../../components/I18nHoverText/I18nHoverText';

const Columns = ({ handleClickMenu, handleSectionExpandToggle }) => {
    const { t } = useTranslation();
    // DataGrid headerName stays a plain string (used for sorting/column menu a11y text); renderHeader adds the hover.
    const renderHeaderWithHover = (key) => () => (
        <I18nHoverText translationKey={key}>{t(key)}</I18nHoverText>
    );

    const columns = [
        {
            field: 'picture_url',
            headerName: t('UserPage.Avatar'),
            renderHeader: renderHeaderWithHover('UserPage.Avatar'),
            width: 100,
            renderCell: (params) => (
                <Avatar alt={params.row.name} src={params.value || ''} />
            ),
        },
        { field: 'name', headerName: t('UserPage.Name'), renderHeader: renderHeaderWithHover('UserPage.Name'), width: 150 },
        { field: 'email', headerName: t('UserPage.Email'), renderHeader: renderHeaderWithHover('UserPage.Email'), width: 200 },
        { field: 'phone', headerName: t('UserPage.Phone'), renderHeader: renderHeaderWithHover('UserPage.Phone'), width: 120 },
        { field: 'role', headerName: t('UserPage.Role'), renderHeader: renderHeaderWithHover('UserPage.Role'), width: 120 },
        {
            field: 'created_at',
            headerName: t('Route.CreatedAt'),
            renderHeader: renderHeaderWithHover('Route.CreatedAt'),
            width: 150,
            valueGetter: (value, row) => {
        const params = { value, row };
                const createdAt = params.row.createdAt;
                if (!createdAt) return '';
                const d = new Date(createdAt);
                return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            },
        },
        {
            field: 'sites',
            headerName: t('SitePage.Sites'),
            renderHeader: renderHeaderWithHover('SitePage.Sites'),
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
        { field: 'name', headerName: t('SitePage.Name'), renderHeader: renderHeaderWithHover('SitePage.Name'), width: 180 },
        { field: 'description', headerName: t('SitePage.Description'), renderHeader: renderHeaderWithHover('SitePage.Description'), width: 220 },
        { field: 'nameInEnglish', headerName: t('SitePage.NameInEnglish'), renderHeader: renderHeaderWithHover('SitePage.NameInEnglish'), width: 180 },
    ];

    return { columns, siteColumns };
};

export default Columns;
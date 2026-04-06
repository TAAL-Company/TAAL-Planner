import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableViewIcon from '@mui/icons-material/TableView';
import { Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function SiteCard({ site, handleClickMenu, handleSectionExpandToggle }) {
    const { t } = useTranslation();

    const hasStudents = site.students && site.students.length > 0;
    const hasRoutes = site.routes && site.routes.length > 0;
    const hasTasks = site.tasks && site.tasks.length > 0;
    const hasStations = site.stations && site.stations.length > 0;
    const hasEditors = site.editors && site.editors.length > 0;

    return (
        <Card 
            sx={{ 
                maxWidth: 345, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                }
            }}
        >
            <CardMedia
                component="img"
                alt={site.name}
                height="200"
                image={site.picture_url || '/static/images/cards/default-site.jpg'}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {site.name}
                    </Typography>
                    <IconButton
                        aria-label="settings"
                        onClick={(e) => handleClickMenu(e, site)}
                        size="small"
                    >
                        <MoreVertIcon />
                    </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {site.description}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    {t('SitePage.NameInEnglish')}: {site.nameInEnglish}
                </Typography>
                
                {/* Quick Stats */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {hasStudents && (
                        <Chip
                            label={`${site.students.length} ${t('SitePage.Users')}`}
                            size="small"
                            onClick={() => handleSectionExpandToggle(site.id, 'students', site)}
                            icon={<TableViewIcon style={{ color: 'black' }} />}
                            sx={{ cursor: 'pointer' }}
                        />
                    )}
                    {hasRoutes && (
                        <Chip
                            label={`${site.routes.length} ${t('SitePage.Routes')}`}
                            size="small"
                            onClick={() => handleSectionExpandToggle(site.id, 'routes', site)}
                            icon={<TableViewIcon style={{ color: 'blue' }} />}
                            sx={{ cursor: 'pointer' }}
                        />
                    )}
                    {hasTasks && (
                        <Chip
                            label={`${site.tasks.length} ${t('SitePage.Tasks')}`}
                            size="small"
                            onClick={() => handleSectionExpandToggle(site.id, 'tasks', site)}
                            icon={<TableViewIcon style={{ color: 'orange' }} />}
                            sx={{ cursor: 'pointer' }}
                        />
                    )}
                    {hasStations && (
                        <Chip
                            label={`${site.stations.length} ${t('SitePage.Stations')}`}
                            size="small"
                            onClick={() => handleSectionExpandToggle(site.id, 'stations', site)}
                            icon={<TableViewIcon style={{ color: 'red' }} />}
                            sx={{ cursor: 'pointer' }}
                        />
                    )}
                    {hasEditors && (
                        <Chip
                            label={`${site.editors.length} ${t('SitePage.Editors')}`}
                            size="small"
                            onClick={() => handleSectionExpandToggle(site.id, 'editors', site)}
                            icon={<TableViewIcon style={{ color: 'teal' }} />}
                            sx={{ cursor: 'pointer' }}
                        />
                    )}
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {site.createdAt ? new Date(site.createdAt).toLocaleDateString() : ''}
                </Typography>
            </CardActions>
        </Card>
    );
}

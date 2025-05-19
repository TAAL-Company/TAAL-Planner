import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import {
    getingData_Places,
    deleteSites,
    insertSite,
    updateSite,
    insertTask,
    insertStation,
    insertRoute,
    getingDataStationbyId,
    getingData_RoutesbyIds
} from '../../api/api';
import { useState, useEffect } from 'react';
import { Button, MenuItem, Menu } from '@mui/material';
import SiteForm from './SiteForm';
import Toolbar from '../Student/Toolbar';
import { useNotification } from "../Notification/NotificationProvider";
import { useTranslation } from "react-i18next";
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import Rows from './Rows';
import Columns from './Columns';

const cacheRtl = createCache({
    key: 'data-grid-rtl-demo',
    stylisPlugins: [prefixer, rtlPlugin],
});
const cacheLtr = createCache({
    key: 'data-grid-ltr-demo',
    stylisPlugins: [prefixer],
});

export default function SitesTable() {
    const [expandedRows, setExpandedRows] = useState({});
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState([]);
    const [newSite, setNewSite] = useState({
        name: '',
        description: '',
        picture_url: '',
        nameInEnglish: '',
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [title, setTitle] = useState('');
    const { showNotification } = useNotification();
    const { t } = useTranslation();

    const handleClickMenu = (event, site) => {
        setAnchorEl(event.currentTarget);
        setSelectedSite(site);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedSite(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewSite({
            name: '',
            description: '',
            picture_url: '',
            nameInEnglish: '',
        });
        setSelectedSite(null);
        setAnchorEl(null);
    };

    const handleClickOpenDialog = () => {
        setOpenDialog(true);
        setNewSite(newSite);
        setTitle(t('SitePage.ADDANewSite'));
    };

    const handleClickOpenEditDialog = () => {
        setOpenDialog(true);
        setNewSite(selectedSite);
        setTitle(t('SitePage.EditSiteInfo'));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const sitesData = await getingData_Places();
            setSites(sitesData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleDeleteSite = async () => {
        try {
            await deleteSites(selectedSite.id).then(() => {
                showNotification('success', t('showNotification.Success_delete_site'));
                setSites(prevSites => prevSites.filter(site => site.id !== selectedSite.id));
                handleCloseMenu();
            });
        } catch (error) {
            showNotification('error', t('showNotification.Error_delete_site'));
        }
    };

    const handleDuplicateSite = async () => {
        if (!selectedSite) return;
        setLoading(true);
        let newTasksID = [];
        let newStationsID = [];
        let newRoutesID = [];

        // Step 1: Prepare site duplication details
        let siteToDuplicate = {
            id: null,
            name: selectedSite.name + ' (Copy)',
            nameInEnglish: selectedSite.nameInEnglish,
            description: selectedSite.description,
            picture_url: selectedSite.picture_url,
            studentIds: [],
            editorIds: [],
            taskIds: [],
            routeIds: [],
            stationIds: [],
            tasks: [],
            stations: [],
            routes: [],
            editors: [],
            students: [],
        };

        try {
            // Insert the duplicated site
            const siteInfo = await insertSite(siteToDuplicate);
            siteToDuplicate.id = siteInfo.id;

            // Step 2: Duplicate Stations and Collect All Tasks
            const stations = selectedSite.stations || [];
            const allTasksMap = new Map();
            const stationTasksMap = new Map();

            for (const station of stations) {
                const stationDetails = await getingDataStationbyId(station.id);

                let stationTaskIDs = [];
                for (const task of stationDetails.tasks) {
                    if (!allTasksMap.has(task.id)) {
                        const newTask = await insertTask(
                            task.title,
                            task.subtitle,
                            [],
                            task.picture_url,
                            task.audio_url,
                            siteInfo.id,
                            task.estimatedTimeSeconds,
                            task.multi_language_description,
                            task.dataEntryLabel,
                            task.dataEntryValidation,
                            task.dataEntryType,
                            task.taskType
                        );
                        siteToDuplicate.tasks.push(newTask);
                        allTasksMap.set(task.id, newTask.id);
                    }
                    stationTaskIDs.push(allTasksMap.get(task.id));
                }

                const newStation = await insertStation(
                    station.title,
                    station.subtitle,
                    siteInfo,
                    stationTaskIDs
                );
                newStationsID.push(newStation.id);
                stationTasksMap.set(station.id, stationTaskIDs);
                siteToDuplicate.stations.push(newStation);
            }

            // Step 3: Duplicate Routes
            const routes = selectedSite.routes || [];
            for (const route of routes) {
                const routesTasks = await getingData_RoutesbyIds([route.id]);
                let routeTaskIDs = [];
                for (const task of (routesTasks[0]?.tasks || [])) {
                    if (allTasksMap.has(task.taskId)) {
                        routeTaskIDs.push(allTasksMap.get(task.taskId));
                    }
                }
                const newRoute = await insertRoute({
                    name: route.name,
                    studentIds: [],
                    taskIds: routeTaskIDs,
                    siteIds: [siteInfo.id],
                    OnlyOnce: false
                });
                newRoutesID.push(newRoute.id);
                siteToDuplicate.routes.push(newRoute);
            }

            // Update the site with the new stations and routes
            const updatedSite = {
                ...siteInfo.data,
                stationIds: newStationsID,
                routeIds: newRoutesID,
            };
            await updateSite(siteInfo.id, updatedSite);
            
            setSites((prev) => [siteToDuplicate, ...prev]);
            setLoading(false);
            showNotification('success', t('SitePage.DuplicateSuccess'));
            handleCloseMenu();
        } catch (error) {
            showNotification('error', t('SitePage.DuplicateError'));
            setLoading(false);
        }
    };

    const { getRowsWithDetails } = Rows({ sites, expandedRows });
    const { columns } = Columns({ handleClickMenu });

    const existingTheme = useTheme();
    const theme = React.useMemo(
        () =>
            createTheme({}, t('localeText', { returnObjects: true }), existingTheme, {
                direction: t('Direction'),
            }),
        [existingTheme]
    );
    const cache = t('Direction') === 'rtl' ? cacheRtl : cacheLtr;

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <div dir={t('Direction')} style={{ textAlign: '-webkit-center' }}>
                    <Button
                        style={{
                            marginTop: '14px',
                            marginBottom: '14px',
                        }}
                        variant="outlined"
                        onClick={handleClickOpenDialog}
                    >
                        {t('SitePage.ADDANewSite')}
                    </Button>
                    <Box style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            style={{ direction: t('Direction') }}
                            rows={getRowsWithDetails()}
                            columns={columns}
                            pageSize={12}
                            autoHeight={true}
                            rowsPerPageOptions={[12]}
                            loading={loading}
                            components={{
                                Toolbar: Toolbar,
                            }}
                        />
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                            <MenuItem onClick={handleClickOpenEditDialog}>{t('SitePage.Edit')}</MenuItem>
                            <MenuItem onClick={handleDuplicateSite}>{t('SitePage.Duplicate')}</MenuItem>
                            <MenuItem onClick={handleDeleteSite}>{t('SitePage.Delete')}</MenuItem>
                        </Menu>

                        <SiteForm
                            open={openDialog}
                            handleCloseDialog={handleCloseDialog}
                            title={title}
                            initialValues={newSite}
                            setSites={setSites}
                            SiteAction="add"
                        />
                    </Box>
                </div>
            </ThemeProvider>
        </CacheProvider>
    );
}
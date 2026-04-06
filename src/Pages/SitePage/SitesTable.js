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
import { Button, MenuItem, Menu, Grid, ToggleButton, ToggleButtonGroup, Typography, CircularProgress, Backdrop, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SiteForm from './SiteForm';
import SiteCard from './SiteCard';
import Toolbar from '../../components/Toolbar/Toolbar';
import { useNotification } from "../../components/Notification/NotificationProvider";
import { useTranslation } from "react-i18next";
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import Rows from './Rows';
import Columns from './Columns';
import PopupTable from '../../components/PopupTable/popuptable';

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
    const [pageSize, setPageSize] = useState(10);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

    // Helper to toggle expand for a section
    const handleSectionExpandToggle = (siteId, section, row) => {
        setPopupSection(section);
        setPopupRow(row);
        setPopupOpen(true);
    };

    const handleViewModeChange = (event, newMode) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

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

    // General data
    const [SiteAction, setSiteAction] = useState(''); // Added SiteAction state

    const [popupOpen, setPopupOpen] = useState(false);
    const [popupSection, setPopupSection] = useState('');
    const [popupRow, setPopupRow] = useState(null);

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
        setSiteAction(''); // Reset SiteAction
    };

    const handleClickOpenDialog = () => {
        setOpenDialog(true);
        setSiteAction('add'); // Set SiteAction to 'add'
        setNewSite(newSite);
        setTitle(t('SitePage.ADDANewSite'));
    };

    const handleClickOpenEditDialog = () => {
        setOpenDialog(true);
        setSiteAction('edit'); // Set SiteAction to 'edit'
        setNewSite(selectedSite);
        setTitle(t('SitePage.EditSiteInfo'));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const sitesData = await getingData_Places();
                const jwt = sessionStorage.getItem('jwt');
                let role = null;
                let userId = null;

                if (jwt) {
                    try {
                        const parsedJwt = JSON.parse(jwt);
                        role = parsedJwt?.role;
                        userId = parsedJwt?.id;
                    } catch (error) {
                        console.error("Failed to parse JWT:", error);
                    }
                }

                if (role === "ADMIN") {
                    setSites(sitesData);
                } else if ((role === "EDITOR" || role === "STUDENT") && userId) {
                    const filteredSites = sitesData.filter(site =>
                        site.editors.some(editor => editor.id === userId)
                    );
                    setSites(filteredSites);
                }
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
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
            nameInEnglish: selectedSite.nameInEnglish + ' (Copy)',
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

    // Function to group sites by common prefix
    const groupSitesByPrefix = (sites) => {
        const groups = {};
        const ungrouped = [];

        sites.forEach(site => {
            const words = site.name.trim().split(/\s+/);
            if (words.length > 1) {
                const prefix = words[0];
                // Check if there are other sites with the same prefix
                const hasSamePrefix = sites.some(
                    s => s.id !== site.id && s.name.trim().startsWith(prefix + ' ')
                );
                
                if (hasSamePrefix) {
                    if (!groups[prefix]) {
                        groups[prefix] = [];
                    }
                    groups[prefix].push(site);
                } else {
                    ungrouped.push(site);
                }
            } else {
                ungrouped.push(site);
            }
        });

        return { groups, ungrouped };
    };

    const { getRowsWithDetails } = Rows({ sites, expandedRows });
    const columnsObj = Columns({
        handleClickMenu,
        expandedRows,
        handleSectionExpandToggle: (siteId, section, row) => {
            setPopupSection(section);
            setPopupRow(row);
            setPopupOpen(true);
        }
    });
    const { columns, taskColumns, routeColumns, stationColumns, studentColumns, editorColumns } = columnsObj;

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
                <div dir={t('Direction')} style={{ minHeight: '100vh', background: '#f5f6fa', padding: '32px 0' }}>
                    <div
                        className="headline"
                        style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            margin: '20px 0 8px 0',
                            textAlign: 'center',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {t('SitePage.Sites')}
                    </div>
                    <div
                        style={{
                            width: '80%',
                            maxWidth: '1400px',
                            margin: '0 auto 24px auto',
                            borderBottom: '2px solid #e0e0e0',
                        }}
                    />
                    <div
                        className="table"
                        style={{
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            padding: '32px 20px 24px 20px',
                            maxWidth: '1400px',
                            margin: '0 auto',
                            minHeight: '700px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={handleViewModeChange}
                                aria-label="view mode"
                                size="small"
                            >
                                <ToggleButton value="table" aria-label="table view">
                                    <ViewListIcon />
                                </ToggleButton>
                                <ToggleButton value="cards" aria-label="cards view">
                                    <ViewModuleIcon />
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Button
                                variant="outlined"
                                onClick={handleClickOpenDialog}
                                sx={{
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                }}
                            >
                                {t('SitePage.ADDANewSite')}
                            </Button>
                        </div>
                        <div style={{ width: '100%' }}>
                            {viewMode === 'table' ? (
                                <DataGrid
                                    style={{ direction: t('Direction') }}
                                    rows={getRowsWithDetails()}
                                    columns={columns}
                                    pageSize={pageSize}
                                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                    rowsPerPageOptions={[10, 25, 50, 100]}
                                    autoHeight
                                    loading={loading}
                                    components={{
                                        Toolbar: Toolbar,
                                    }}
                                    sx={{
                                        background: '#fafbfc',
                                        borderRadius: 2,
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: 'rgb(0, 112, 166)',
                                            borderBottom: '1px solid rgb(224, 224, 224)',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            color: '#fff',
                                        },
                                        '& .MuiDataGrid-cell': {
                                            fontSize: '1rem',
                                        },
                                    }}
                                />
                            ) : (
                                <>
                                    {loading ? (
                                        <Grid container>
                                            <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                                                <CircularProgress size="10rem" color="info" />
                                            </Grid>
                                        </Grid>
                                    ) : sites.length === 0 ? (
                                        <Grid container>
                                            <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography>{t('SitePage.NoSites') || 'No sites available'}</Typography>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        (() => {
                                            const { groups, ungrouped } = groupSitesByPrefix(sites);
                                            return (
                                                <>
                                                    {/* Render ungrouped sites in General Group */}
                                                    {ungrouped.length > 0 && (
                                                        <Accordion 
                                                            defaultExpanded
                                                            sx={{ 
                                                                mb: 2,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                '&:before': {
                                                                    display: 'none',
                                                                }
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon />}
                                                                sx={{
                                                                    backgroundColor: '#f5f5f5',
                                                                    '&:hover': {
                                                                        backgroundColor: '#eeeeee',
                                                                    }
                                                                }}
                                                            >
                                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                                    {t('SitePage.GeneralGroup') || 'General'} ({ungrouped.length})
                                                                </Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{ p: 3 }}>
                                                                <Grid container spacing={3}>
                                                                    {ungrouped.map((site) => (
                                                                        <Grid item xs={12} sm={6} md={4} lg={3} key={site.id}>
                                                                            <SiteCard
                                                                                site={site}
                                                                                handleClickMenu={handleClickMenu}
                                                                                handleSectionExpandToggle={handleSectionExpandToggle}
                                                                            />
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    )}
                                                    
                                                    {/* Render grouped sites */}
                                                    {Object.entries(groups).map(([prefix, groupedSites]) => (
                                                        <Accordion 
                                                            key={prefix} 
                                                            defaultExpanded
                                                            sx={{ 
                                                                mb: 2,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                '&:before': {
                                                                    display: 'none',
                                                                }
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon />}
                                                                sx={{
                                                                    backgroundColor: '#f5f5f5',
                                                                    '&:hover': {
                                                                        backgroundColor: '#eeeeee',
                                                                    }
                                                                }}
                                                            >
                                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                                    {prefix} ({groupedSites.length})
                                                                </Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{ p: 3 }}>
                                                                <Grid container spacing={3}>
                                                                    {groupedSites.map((site) => (
                                                                        <Grid item xs={12} sm={6} md={4} lg={3} key={site.id}>
                                                                            <SiteCard
                                                                                site={site}
                                                                                handleClickMenu={handleClickMenu}
                                                                                handleSectionExpandToggle={handleSectionExpandToggle}
                                                                            />
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    ))}
                                                </>
                                            );
                                        })()
                                    )}
                                </>
                            )}
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                                <MenuItem onClick={handleClickOpenEditDialog}>{t('SitePage.Edit')}</MenuItem>
                                <MenuItem onClick={handleDuplicateSite}>{t('SitePage.Duplicate')}</MenuItem>
                                <MenuItem onClick={handleDeleteSite}>{t('SitePage.Delete')}</MenuItem>
                            </Menu>

                            <PopupTable
                                open={popupOpen}
                                onClose={() => setPopupOpen(false)}
                                section={popupSection}
                                row={popupRow}
                                columnsMap={{
                                    taskColumns,
                                    routeColumns,
                                    stationColumns,
                                    studentColumns,
                                    editorColumns
                                }}
                            />

                            <SiteForm
                                open={openDialog}
                                handleCloseDialog={handleCloseDialog}
                                title={title}
                                initialValues={newSite}
                                setSites={setSites}
                                SiteAction={SiteAction} // Pass SiteAction to SiteForm
                            />
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </CacheProvider>
    );
}
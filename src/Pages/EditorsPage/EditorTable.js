import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { getingData_Editors, deleteEditor, getingData_Places, getingData_Users, getingData_coaches } from '../../api/api';
import { useState, useEffect } from 'react';
import { Button, MenuItem, Menu } from '@mui/material';
import EditorForm from './EditorForms';
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

// Create rtl cache
const cacheRtl = createCache({
    key: 'data-grid-rtl-demo',
    stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
    key: 'data-grid-ltr-demo',
    stylisPlugins: [prefixer],
});

export default function EditorTable() {
    const [expandedRows, setExpandedRows] = useState({});
    const [loading, setLoading] = useState(true);
    const [Editors, setEditors] = useState([]);
    const [newEditor, setNewEditor] = useState({
        email: '',
        name: '',
        googleID: '',
        siteIds: [],
        role: '',
        phone: '',
        picture_url: '',
        password: '',
        userid: '',
        defaultdashboard: '',
    });
    const [sites, setSites] = useState([]);
    const [users, setUsers] = useState([]);
    const [coaches, setcoaches] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEditor, setSelectedEditor] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [title, setTitle] = useState('');
    const { showNotification } = useNotification();
    const { t } = useTranslation();

    const [popupOpen, setPopupOpen] = useState(false);
    const [popupSection, setPopupSection] = useState('');
    const [popupRow, setPopupRow] = useState(null);

    const handleClickMenu = (event, Editor) => {
        setAnchorEl(event.currentTarget);
        setSelectedEditor(Editor);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedEditor(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewEditor({
            email: '',
            name: '',
            googleID: '',
            siteIds: [],
            role: '',
            phone: '',
            picture_url: '',
            password: '',
            userid: '',
            defaultdashboard: '',
        });
        setSelectedEditor(null);
        setAnchorEl(null);
    };

    const handleClickOpenDialog = () => {
        setOpenDialog(true);
        setNewEditor(newEditor);
        setTitle(t('EditorPage.ADDANewEditor'));
    };

    const handleClickOpenEditDialog = () => {
        setOpenDialog(true);
        setNewEditor(selectedEditor);
        setTitle(t('EditorPage.EditCoachInfo'));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const EditorsData = await getingData_Editors();

                const jwt = sessionStorage.getItem('jwt');
                const jwtEditor = sessionStorage.getItem('jwt-EDITOR');

                let role = null;
                let userId = null;

                if (jwt) {
                    try {
                        role = JSON.parse(jwt)?.role;
                    } catch (error) {
                        console.error("Failed to parse JWT:", error);
                    }
                }

                if (jwtEditor) {
                    try {
                        userId = JSON.parse(jwtEditor)?.id;
                    } catch (error) {
                        console.error("Failed to parse JWT-EDITOR:", error);
                    }
                }

                if (role === "ADMIN") {
                    setEditors(EditorsData);
                }
                // else if (role === "EDITOR" && userId) {
                //     const filteredCoaches = EditorsData.filter((coach) => coach.id == userId && userId != null);
                //     setEditors(filteredCoaches);
                // } else if (role === "STUDENT" && userId) {
                //     const filteredCoaches = EditorsData.filter((coach) => coach.id == JSON.parse(jwt).coachId && JSON.parse(jwt).id != null);
                //     setEditors(filteredCoaches);
                // }
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setSites(await getingData_Places());
                setUsers(await getingData_Users());
                setcoaches(await getingData_coaches());
            } catch (error) {
                console.error(error.message);
                showNotification('error', t('Error_fetch_data') + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteEditor = async () => {
        try {
            await deleteEditor(selectedEditor.id).then(() => {
                showNotification('success', t('Success_delete_editor'));
                setEditors(prevEditors => prevEditors.filter(Editor => Editor.id !== selectedEditor.id));
                handleCloseMenu();
            });
        } catch (error) {
            console.error(error.message);
            showNotification('error', t('Error_delete_editor'));
        }
    };

    // Function to get rows with details
    const { getRowsWithDetails } = Rows({ editors: Editors, expandedRows });

    // Add this handler in EditorTable
    const handleSectionExpandToggle = (editorId, section, row) => {
        setPopupSection(section);
        setPopupRow(row);
        setPopupOpen(true);
    };

    // Get columns from Columns.js, pass the handler
    const { columns, siteColumns } = Columns({ handleClickMenu, handleSectionExpandToggle });

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
                        {t('EditorPage.Editors')}
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
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
                                {t('EditorPage.ADDANewEditor')}
                            </Button>
                        </div>
                        <div style={{ width: '100%' }}>
                            <DataGrid
                                style={{ direction: t('Direction') }}
                                rows={getRowsWithDetails()}
                                columns={columns}
                                pageSize={12}
                                rowsPerPageOptions={[12, 24, 50]}
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
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                                <MenuItem onClick={handleClickOpenEditDialog}>{t('EditorPage.Edit')}</MenuItem>
                                <MenuItem onClick={handleDeleteEditor}>{t('EditorPage.Delete')}</MenuItem>
                            </Menu>

                            <EditorForm
                                open={openDialog}
                                handleCloseDialog={handleCloseDialog}
                                title={title}
                                initialValues={newEditor}
                                setEditors={setEditors}
                                EditorAction={selectedEditor ? "edit" : "add"}
                                users={users}
                                sites={sites}
                                coaches={coaches}
                            />

                            {/* 5. PopupTable for sites */}
                            <PopupTable
                                open={popupOpen}
                                onClose={() => setPopupOpen(false)}
                                section="sites"
                                row={popupRow}
                                columnsMap={{
                                    siteColumns,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </CacheProvider>
    );
}
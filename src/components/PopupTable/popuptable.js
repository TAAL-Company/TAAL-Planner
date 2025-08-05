import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

const PopupTable = ({
    open,
    onClose,
    section,
    row,
    columnsMap,
}) => {
    const { t } = useTranslation();
    if (!section || !row) return null;

    let rows = [];
    let cols = [];
    let title = '';

    switch (section) {
        case 'tasks':
            rows = row.tasks || [];
            cols = columnsMap.taskColumns;
            title = t('SitePage.Tasks');
            break;
        case 'routes':
            rows = row.routes || [];
            cols = columnsMap.routeColumns;
            title = t('SitePage.Routes');
            break;
        case 'stations':
            rows = row.stations || [];
            cols = columnsMap.stationColumns;
            title = t('SitePage.Stations');
            break;
        case 'students':
            rows = row.students || [];
            cols = columnsMap.studentColumns;
            title = t('SitePage.Users');
            break;
        case 'editors':
            rows = row.editors || [];
            cols = columnsMap.editorColumns;
            title = t('SitePage.Editors');
            break;
        case 'sites':
            rows = row.sites || [];
            cols = columnsMap.siteColumns;
            title = t('SitePage.Sites');
            break;
        default:
            break;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            style={{ direction: t('Direction') }}
        >
            <DialogTitle sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{title}</span>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                            marginLeft: 2
                        }}
                        size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        style={{ direction: t('Direction') }}
                        rows={rows.map((r, i) => ({ ...r, id: r.id || i }))}
                        columns={cols}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        autoHeight
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PopupTable;
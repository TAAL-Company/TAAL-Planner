import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Box, Autocomplete, TextField, Button } from '@mui/material';

// Optional assign/unassign support, enabled per section via `assignment`:
// { [section]: { options, getOptionLabel, onAssign(option), onUnassign(item) } }
const PopupTable = ({
    open,
    onClose,
    section,
    row,
    columnsMap,
    assignment,
}) => {
    const { t } = useTranslation();
    const [selected, setSelected] = React.useState(null);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        setSelected(null);
    }, [section, row?.id, open]);

    if (!section || !row) return null;

    const assign = assignment?.[section];

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

    if (assign) {
        cols = [
            ...(cols || []),
            {
                field: '__unassign',
                headerName: '',
                width: 130,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Button
                        size="small"
                        color="error"
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            try {
                                await assign.onUnassign(params.row);
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        {t('Unassign', { defaultValue: 'Unassign' })}
                    </Button>
                ),
            },
        ];
    }

    const assignedIds = new Set(rows.map((r) => r.id));
    const options = (assign?.options || []).filter((o) => !assignedIds.has(o.id));

    const handleAssign = async () => {
        if (!selected) return;
        setBusy(true);
        try {
            await assign.onAssign(selected);
            setSelected(null);
        } finally {
            setBusy(false);
        }
    };

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
                {assign && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
                        <Autocomplete
                            sx={{ flex: 1 }}
                            size="small"
                            options={options}
                            value={selected}
                            onChange={(_, v) => setSelected(v)}
                            getOptionLabel={(o) => assign.getOptionLabel(o) || ''}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            renderInput={(params) => (
                                <TextField {...params} label={t('Assign', { defaultValue: 'Assign' })} />
                            )}
                        />
                        <Button variant="contained" disabled={!selected || busy} onClick={handleAssign}>
                            {t('Assign', { defaultValue: 'Assign' })}
                        </Button>
                    </Box>
                )}
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        style={{ direction: t('Direction') }}
                        rows={rows.map((r, i) => ({ ...r, id: r.id || i }))}
                        columns={cols}
                        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                        pageSizeOptions={[5]}
                        autoHeight
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PopupTable;
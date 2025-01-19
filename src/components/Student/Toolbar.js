import React, { useState, useEffect } from 'react';
import {
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector,
    GridToolbarQuickFilter
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
export default function Toolbar() {

    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector
                slotProps={{ tooltip: { title: 'Change density' } }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarQuickFilter />
            <GridToolbarExport
                slotProps={{
                    tooltip: { title: 'Export data' },
                    button: { variant: 'outlined' },
                }}
            />
        </GridToolbarContainer>
    );
}
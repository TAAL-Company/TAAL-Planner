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
            <GridToolbarDensitySelector/>
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarQuickFilter />
            <GridToolbarExport
            />
        </GridToolbarContainer>
    );
}
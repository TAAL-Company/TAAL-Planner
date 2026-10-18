import React, { useState, useEffect } from 'react';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useTranslation } from 'react-i18next';
import { useTranslator } from '../../Utility/TranslationProvider';

export default function Toolbar() {
    const { t } = useTranslation();
    const { translationEnabled, setTranslationEnabled } = useTranslator();

    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <FormControlLabel
                sx={{ mx: 1 }}
                control={
                    <Switch
                        size="small"
                        checked={translationEnabled}
                        onChange={(e) => setTranslationEnabled(e.target.checked)}
                    />
                }
                label={t('translate_data')}
            />
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarQuickFilter />
            <GridToolbarExport
            />
        </GridToolbarContainer>
    );
}
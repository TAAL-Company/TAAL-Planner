import React, { useState, useEffect } from 'react';
import { Checkbox, ListItemText, MenuItem, Select, InputLabel, FormControl, OutlinedInput } from '@mui/material';

export default function MultipleSelect({ label, formValues, handleChange, sites }) {
    const [selectedSites, setSelectedSites] = useState([]);
    useEffect(() => {
        sites.map((site) => {
            if (formValues.sites.find((item) => item.id === site.id)) {
                setSelectedSites((prev) => [...prev, site]);
            }
        })
    }, []);

    const handleSiteChange = (event) => {
        const { value } = event.target;
        setSelectedSites(value);
        handleChange('sites', value);
    };

    return (
        <FormControl fullWidth margin="normal">
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={selectedSites}
                onChange={handleSiteChange}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => selected.map((option) => option.name).join(', ')}
            >
                {sites.map((site) => (
                    <MenuItem key={site.id} value={site}>
                        <Checkbox
                            checked={selectedSites.some((selectedSite) => selectedSite.id === site.id)}
                        />
                        <ListItemText primary={site.name} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
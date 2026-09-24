import React, { useState, useEffect } from 'react';
import { Checkbox, ListItemText, MenuItem, Select, InputLabel, FormControl, OutlinedInput } from '@mui/material';
import I18nHoverText from '../I18nHoverText/I18nHoverText';

export default function MultipleSelect({ label, translationKey, formValues, handleChange, sites, setFormValues }) {
    const [selectedSites, setSelectedSites] = useState([]);
    useEffect(() => {
        console.log('sites', sites);
        sites.map((site) => {
            if (formValues?.sites?.find((item) => item.id === site.id)) {
                setSelectedSites((prev) => [...prev, site]);
            }
        })
    }, []);

    const handleSiteChange = (event) => {
        const { value } = event.target;
        setSelectedSites(value);
        handleChange('sites', value);
        setFormValues((prev) => ({
            ...prev,
            sites: value,
        }));
    };

    return (
        <FormControl fullWidth margin="normal">
            <InputLabel>
                {translationKey ? <I18nHoverText translationKey={translationKey}>{label}</I18nHoverText> : label}
            </InputLabel>
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
import React from 'react';
import { Checkbox, ListItemText, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

export default function MultipleSelect({ label, options, selectedOptions, onChange }) {
    const handleChange = (event) => {
        const value = event.target.value;
        onChange(typeof value === 'string' ? value.split(',') : value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={selectedOptions}
                onChange={handleChange}
                renderValue={(selected) => selected.map((option) => option.name).join(', ')}
            >
                {options.map((option) => (
                    <MenuItem key={option.id} value={option}>
                        <Checkbox checked={selectedOptions.indexOf(option.name) > -1} />
                        <ListItemText primary={option.name} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function BasicSelect(props) {
    const [Folder, setFolder] = React.useState(props.folderName);

    const handleChange = (event) => {
        props.setFoldersite(event.target.value);
        setFolder(event.target.value);
    };

    return (
        <Box >
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">select</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={Folder}
                    label="Age"
                    onChange={handleChange}>
                    {props.folderlist.map((item, index) => <MenuItem key={index} value={item}>{item}</MenuItem>)}
                </Select>
            </FormControl>
        </Box>
    );
}
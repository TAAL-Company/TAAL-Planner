import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
} from '@mui/material';

import { insertUser, uploadFiles, updateUser } from '../../api/api';
import MultipleSelect from './MultipleSelectCheckmarks';
import BasicSelect from '../Gallery/BasicSelect';
import InputFileUpload from '../InputFileUpload/InputFileUpload';
import { getBlobsInContainer } from '../azureBlob';

export default function UserForm({
    open,
    handleCloseDialog,
    initialValues,
    title,
    coaches,
    setUsers,
    sites,
    UserAction
}) {
    const [formValues, setFormValues] = useState({ ...initialValues });
    const [Foldersite, setFoldersite] = useState('general');
    const [blobList, setBlobList] = useState([]);
    const [sortedUrls, setSortedUrls] = useState({});
    const [folderNames, setFolderNames] = useState([]);
    const [picture, setPicture] = useState(null);

    useEffect(async () => {
        // prepare UI for results
        setBlobList(await getBlobsInContainer());
    }, []);

    useEffect(() => {
        for (const key in blobList) {
            const url = blobList[key];
            const parts = url.split('/');
            let folderName = 'general';

            const imageIndex = parts.indexOf('images');
            if (imageIndex !== -1 && imageIndex + 2 < parts.length) {
                folderName = parts[imageIndex + 1];
            }

            let fileType = getFileType(url);
            let fileTypeFolder = '';

            if (['jpeg', 'png', 'jpg', 'webp'].includes(fileType)) {
                fileTypeFolder = 'pictures';
            } else if (['aac', 'mp3', 'wav'].includes(fileType)) {
                fileTypeFolder = 'audio';
            }

            sortedUrls[folderName] = sortedUrls[folderName] || {};
            sortedUrls[folderName][fileTypeFolder] = sortedUrls[folderName][fileTypeFolder] || {};
            sortedUrls[folderName][fileTypeFolder][key] = url;
        }
        console.log("sortedUrls", Object.keys(sortedUrls));
        console.log("sortedUrls- 2", sortedUrls);

        if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
            setFolderNames(Object.keys(sortedUrls));
        } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "STUDENT" || JSON.parse(sessionStorage.getItem('jwt'))?.role === "EDITOR") {
            const usersites = JSON.parse(sessionStorage.getItem('jwt')).sites;
            console.log("usersites", usersites);
            const filteredSortedUrls = Object.keys(sortedUrls).filter(url => {
                console.log("url", url);
                return usersites.some(site => site.nameInEnglish === url)
            });
            console.log(filteredSortedUrls);
            setFolderNames(filteredSortedUrls);
        }
    }, [blobList]);

    const getFileType = (url) => {
        if (typeof url === 'string') {
            const parts = url.split('.');
            const extension = parts[parts.length - 1];
            const fileType = extension.toLowerCase();

            return fileType;
        } else {
            return 'unknown';
        }
    };

    // Reset form values when initialValues change
    useEffect(() => {
        setFormValues({ ...initialValues });
    }, [initialValues]);

    const handleChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = async () => {
        try {
            if (picture) {
                formValues.picture_url = await uploadFiles(picture, 'Worker media/picture', Foldersite);
            }
            if (UserAction === 'edit') {
                await updateUser(formValues.id,formValues).then((response) => {
                    setUsers((prevUsers) => [...prevUsers, { ...response.data }]);
                });

            } else {
                await insertUser({ ...formValues }).then((response) => {
                    setUsers((prevUsers) => [...prevUsers, { ...response }]);
                });
            }

        } catch (error) {
            alert(error.message);
        }
        handleCloseDialog(); // Close the dialog
    };

    return (
        <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    label="Email"
                    fullWidth
                    value={formValues.email}
                    onChange={handleChange('email')}
                    margin="normal"
                />
                <TextField
                    label="Name"
                    fullWidth
                    value={formValues.name}
                    onChange={handleChange('name')}
                    margin="normal"
                />
                <TextField
                    label="Phone"
                    fullWidth
                    value={formValues.phone}
                    onChange={handleChange('phone')}
                    margin="normal"
                />
                <TextField
                    label="Username"
                    fullWidth
                    value={formValues.user_name}
                    onChange={handleChange('user_name')}
                    margin="normal"
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={formValues.password}
                    onChange={handleChange('password')}
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Coach</InputLabel>
                    <Select
                        value={formValues.coachId}
                        onChange={handleChange('coachId')}
                    >
                        {coaches.map((coach) => (
                            <MenuItem key={coach.id} value={coach.id}>
                                {coach.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Sites</InputLabel>
                    <Select
                        multiple
                        value={formValues.sites || []} // Ensure value is always an array
                        onChange={handleChange('sites')}
                        renderValue={(selected) => selected.map((option) => option.name).join(', ')}
                    >
                        {sites.map((site) => (
                            <MenuItem key={site.id} value={site}>
                                <Checkbox
                                    checked={(formValues.sites || []).some((selectedSite) => selectedSite.id === site.id)}
                                />
                                <ListItemText primary={site.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <BasicSelect setFoldersite={setFoldersite} folderlist={folderNames} />
                    <InputFileUpload setPicture={setPicture} />
                </FormControl>
                {/* Add the MultipleSelect for sites //TODO: ask marc about this
                <FormControl fullWidth margin="normal">
                    <MultipleSelect
                        label="Select Sites"
                        options={sites}
                        selectedOptions={selectedSites}
                        onChange={handleSitesChange}
                    />
                </FormControl> */}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
}

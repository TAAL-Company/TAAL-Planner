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
    MenuItem
} from '@mui/material';

import { insertUser, uploadFiles, updateUser } from '../../api/api';
import MultipleSelect from './MultipleSelectCheckmarks';
import BasicSelect from '../Gallery/BasicSelect';
import InputFileUpload from '../InputFileUpload/InputFileUpload';
import { getBlobsInContainer } from '../azureBlob';

import { useNotification } from '../Notification/NotificationProvider';

import { useTranslation } from "react-i18next";

export default function UserForm({
    open,
    handleCloseDialog,
    initialValues,
    title,
    coaches,
    setUsers,
    sites,
    UserAction,
    setupdateduplicateUser,
    updateduplicateUser

}) {
    const [formValues, setFormValues] = useState({ ...initialValues });
    const [Foldersite, setFoldersite] = useState('general');
    const [blobList, setBlobList] = useState([]);
    const [sortedUrls, setSortedUrls] = useState({});
    const [folderNames, setFolderNames] = useState([]);
    const [picture, setPicture] = useState(null);

    const [errors, setErrors] = useState({});
    const { showNotification } = useNotification();

    const { t } = useTranslation();

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

    const validate = () => {
        let tempErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!formValues.email) {
            tempErrors.email = t("FormsErrors.emailRequired");
        } else if (!emailRegex.test(formValues.email)) {
            tempErrors.email = t("FormsErrors.emailFormat");
        }
    
        if (!formValues.name) tempErrors.name = t("FormsErrors.nameRequired");
        if (!formValues.user_name) tempErrors.user_name = t("FormsErrors.usernameRequired");
        if (!formValues.password) tempErrors.password = t("FormsErrors.passwordRequired");
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            console.log('formValues', formValues);
            if (picture) {
                formValues.picture_url = await uploadFiles(picture, 'Worker media/picture', Foldersite);
            }
            if (UserAction === 'edit') {
                try {
                    await updateUser(formValues.id, formValues).then((response) => {
                        showNotification('success', t("showNotification.Success_edit_user"));
                        setUsers((prevUsers) => prevUsers.map(user => user.id === formValues.id ? { ...response.data } : user));
                    });
                } catch (error) {
                    showNotification('error', t("showNotification.Error_edit_user") +error.message);
                }

            } else {
                try {
                    debugger
                await insertUser({ ...formValues }).then((response) => {
                    showNotification('success', t("showNotification.Success_add_user"));
                    // setUsers((prevUsers) => [...prevUsers, { ...response }]);
                    setupdateduplicateUser(!updateduplicateUser);
                });
                } catch (error) {
                    showNotification('error', t("showNotification.Error_add_user") +error.message);
                }
            }

        } catch (error) {
            showNotification('error', t("showNotification.Error_add_user") +error.message);
            // alert(error.message);
        }
        handleCloseDialog(); // Close the dialog
    };

    return (
        <Dialog open={open} style={{ direction: t('Direction') }}  >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dir={t('Direction')} >
                <TextField
                    required
                    label={t("Forms.Email")}
                    fullWidth
                    value={formValues.email}
                    onChange={handleChange('email')}
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    required
                    label={t("Forms.Name")}
                    fullWidth
                    value={formValues.name}
                    onChange={handleChange('name')}
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name}
                />
                <TextField
                    label={t("Forms.Phone")}
                    fullWidth
                    value={formValues.phone}
                    onChange={handleChange('phone')}
                    margin="normal"
                />
                <TextField
                    required
                    label={t("Forms.Username")}
                    fullWidth
                    value={formValues.user_name}
                    onChange={handleChange('user_name')}
                    margin="normal"
                    error={!!errors.user_name}
                    helperText={errors.user_name}
                />
                <TextField
                    required
                    label={t("Forms.Password")}
                    type="password"
                    fullWidth
                    value={formValues.password}
                    onChange={handleChange('password')}
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>{t("Forms.Select_Coach")}</InputLabel>
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

                <MultipleSelect
                    label={t("Forms.Select_Sites")}
                    formValues={formValues}
                    handleChange={handleChange}
                    sites={sites}
                    setFormValues={setFormValues}
                />
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
                <Button onClick={handleCloseDialog}>{t("Forms.Cancel")}</Button>
                <Button onClick={handleSubmit}>{t("Forms.Submit")}</Button>
            </DialogActions>
        </Dialog>
    );
}

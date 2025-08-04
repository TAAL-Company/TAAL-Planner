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
import MultipleSelect from '../../components/MultipleSelectCheckmarks/MultipleSelectCheckmarks';
import BasicSelect from '../../components/Gallery/BasicSelect';
import InputFileUpload from '../../components/InputFileUpload/InputFileUpload';
import { getBlobsInContainer } from '../../components/azureBlob';

import { useNotification } from '../../components/Notification/NotificationProvider';

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
    const [loading, setLoading] = useState(false); // Add loading state

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

    const handleClose = () => {
        setPicture(null);
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
                setLoading(true); // Start loading
                try {
                    const response = await updateUser(formValues.id, formValues);
                    console.log('API Response:', response); // Debugging
                    if (response && response.data) {
                        showNotification('success', t("showNotification.Success_edit_user"));
                        setUsers((prevUsers) =>
                            prevUsers.map(user =>
                                user.id === formValues.id ? { ...response.data } : user
                            )
                        );
                    } else {
                        throw new Error('Invalid API response');
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                    showNotification('error', t("showNotification.Error_edit_user") + error.message);
                } finally {
                    setLoading(false); // Stop loading
                }
            } else {
                try {
                    const response = await insertUser({ ...formValues });
                    console.log('API Response:', response); // Debugging
                    if (response) {
                        showNotification('success', t("showNotification.Success_add_user"));
                        setupdateduplicateUser(!updateduplicateUser);
                    } else {
                        throw new Error('Invalid API response');
                    }
                } catch (error) {
                    console.error('Error adding user:', error);
                    showNotification('error', t("showNotification.Error_add_user") + error.message);
                }
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            showNotification('error', t("showNotification.Error_add_user") + error.message);
        }
        setPicture(null);
        handleCloseDialog(); // Close the dialog
    };

    return (
        <Dialog open={open} onClose={() => { handleClose(); handleCloseDialog(); }} style={{ direction: t('Direction') }}  >
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
                    <p>{t("Forms.SelectCoachText")}</p>
                </FormControl>

                <MultipleSelect
                    label={t("Forms.Select_Sites")}
                    formValues={formValues}
                    handleChange={handleChange}
                    sites={sites}
                    setFormValues={setFormValues}
                />
                <p>{t("Forms.SelectSitesText")}</p>
                <FormControl fullWidth margin="normal">
                    {formValues.picture_url && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={formValues.picture_url instanceof Blob ? URL.createObjectURL(formValues.picture_url) : formValues.picture_url} alt="Uploaded Picture" style={{ width: '50%', height: '50%' }} />
                        </div>
                    )}
                    <br />
                    <BasicSelect setFoldersite={setFoldersite} folderlist={folderNames} />
                    <InputFileUpload
                        setPicture={(newPicture) => {
                            formValues.picture_url = newPicture
                            setPicture(newPicture)
                        }} />
                    <p>{t("Forms.UploadImageText")}</p>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>{t("Forms.Cancel")}</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? t("Forms.Loading") : t("Forms.Submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

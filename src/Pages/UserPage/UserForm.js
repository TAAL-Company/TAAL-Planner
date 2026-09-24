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
import BasicSelect from '../../components/BasicSelect/BasicSelect';
import InputFileUpload from '../../components/InputFileUpload/InputFileUpload';
import { getBlobsInContainer } from '../../components/azureBlob';

import { useNotification } from '../../components/Notification/NotificationProvider';

import { useTranslation } from "react-i18next";
import I18nHoverText from '../../components/I18nHoverText/I18nHoverText';

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
    const [errorKeys, setErrorKeys] = useState({});
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
        let tempErrorKeys = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formValues.email) {
            tempErrorKeys.email = "FormsErrors.EmailRequired";
            tempErrors.email = t(tempErrorKeys.email);
        } else if (!emailRegex.test(formValues.email)) {
            tempErrorKeys.email = "FormsErrors.EmailFormat";
            tempErrors.email = t(tempErrorKeys.email);
        }

        if (!formValues.name) {
            tempErrorKeys.name = "FormsErrors.NameRequired";
            tempErrors.name = t(tempErrorKeys.name);
        }
        if (!formValues.user_name) {
            tempErrorKeys.user_name = "FormsErrors.UsernameRequired";
            tempErrors.user_name = t(tempErrorKeys.user_name);
        }
        if (!formValues.password) {
            tempErrorKeys.password = "FormsErrors.PasswordRequired";
            tempErrors.password = t(tempErrorKeys.password);
        }
        setErrors(tempErrors);
        setErrorKeys(tempErrorKeys);
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
            <DialogTitle><I18nHoverText translationKey={UserAction === 'edit' ? 'UserPage.EditEmployeeInfo' : 'UserPage.ADDANewEmployee'}>{title}</I18nHoverText></DialogTitle>
            <DialogContent dir={t('Direction')} >
                <TextField
                    required
                    label={<I18nHoverText translationKey="Forms.Email">{t("Forms.Email")}</I18nHoverText>}
                    fullWidth
                    value={formValues.email}
                    onChange={handleChange('email')}
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email && (
                        <I18nHoverText translationKey={errorKeys.email}>{errors.email}</I18nHoverText>
                    )}
                />
                <TextField
                    required
                    label={<I18nHoverText translationKey="Forms.Name">{t("Forms.Name")}</I18nHoverText>}
                    fullWidth
                    value={formValues.name}
                    onChange={handleChange('name')}
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name && (
                        <I18nHoverText translationKey={errorKeys.name}>{errors.name}</I18nHoverText>
                    )}
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
                    translationKey="Forms.Select_Sites"
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

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
} from '@mui/material';

import { insertEditor, updateEditor, uploadFiles } from '../../api/api';
import MultipleSelect from '../MultipleSelectCheckmarks/MultipleSelectCheckmarks';
import BasicSelect from '../Gallery/BasicSelect';
import InputFileUpload from '../InputFileUpload/InputFileUpload';
import { getBlobsInContainer } from '../azureBlob';
import { useNotification } from '../Notification/NotificationProvider';
import { useTranslation } from "react-i18next";

export default function EditorForm({
    open,
    handleCloseDialog,
    initialValues,
    title,
    setEditors,
    EditorAction,
    users = [],
    sites = [],
    coaches = []
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

    // New state for filtered users/coaches and dashboard routes
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredCoaches, setFilteredCoaches] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]);

    useEffect(() => {
        async function fetchBlobs() {
            setBlobList(await getBlobsInContainer());
        }
        fetchBlobs();
    }, []);

    useEffect(() => {
        let sorted = {};
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

            sorted[folderName] = sorted[folderName] || {};
            sorted[folderName][fileTypeFolder] = sorted[folderName][fileTypeFolder] || {};
            sorted[folderName][fileTypeFolder][key] = url;
        }
        setSortedUrls(sorted);

        if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
            setFolderNames(Object.keys(sorted));
        } else if (
            JSON.parse(sessionStorage.getItem('jwt'))?.role === "STUDENT" ||
            JSON.parse(sessionStorage.getItem('jwt'))?.role === "EDITOR"
        ) {
            const usersites = JSON.parse(sessionStorage.getItem('jwt')).sites;
            const filteredSortedUrls = Object.keys(sorted).filter(url =>
                usersites.some(site => site.nameInEnglish === url)
            );
            setFolderNames(filteredSortedUrls);
        }
    }, [blobList]);

    function getFileType(url) {
        if (typeof url === 'string') {
            const parts = url.split('.');
            const extension = parts[parts.length - 1];
            return extension.toLowerCase();
        } else {
            return 'unknown';
        }
    }

    // Reset form values when initialValues change
    useEffect(() => {
        setFormValues({ ...initialValues });
    }, [initialValues]);

    // Update filtered users/coaches when role changes
    useEffect(() => {
        if (formValues.role === 'EDITOR') {
            setFilteredCoaches(coaches);
        } else if (formValues.role === 'STUDENT') {
            setFilteredUsers(users);
        }
    }, [formValues.role, users, coaches]);

    // Update filtered routes when siteIds change
    useEffect(() => {
        if (formValues.sites && formValues.sites.length > 0) {
            // Filter sites based on selected siteIds
            const selectedSites = sites.filter(site => formValues.sites.map(s => s.id).includes(site.id));
            // Flatten the routes from selected sites
            const routes = selectedSites.flatMap(site => site.routes || []);

            setFilteredRoutes(routes);
        } else {
            setFilteredRoutes([]);
        }
    }, [formValues.sites, sites]);

    const handleChange = (field) => (eventOrValue) => {
        let value;
        // If called from MultipleSelect, eventOrValue is an array of site objects
        if (field === 'siteIds' && Array.isArray(eventOrValue)) {
            value = eventOrValue.map(site => site.id);
        } else if (eventOrValue && eventOrValue.target) {
            value = eventOrValue.target.value;
            // If value is array of site objects (from MultipleSelect), map to ids
            if (field === 'siteIds' && Array.isArray(value) && value[0]?.id) {
                value = value.map(site => site.id);
            }
        } else {
            value = eventOrValue;
        }
        setFormValues((prev) => ({ ...prev, [field]: value }));
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
        if (!formValues.password) tempErrors.password = t("FormsErrors.passwordRequired");
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            if (picture) {
                formValues.picture_url = await uploadFiles(picture, 'Editors media/picture', Foldersite);
            }
            if (EditorAction === 'edit') {
                try {
                    formValues.siteIds = formValues.sites.map(site => site.id);
                    const response = await updateEditor(formValues.id, formValues);
                    if (response && response.data) {
                        setEditors((prevEditors) =>
                            prevEditors.map(editor =>
                                editor.id === formValues.id
                                    ? { ...editor, ...response.data, id: editor.id }
                                    : editor
                            )
                        );
                        showNotification('success', t("showNotification.Success_edit_editor"));
                    } else {
                        throw new Error('Invalid API response');
                    }
                } catch (error) {
                    showNotification('error', t("showNotification.Error_edit_editor") + error.message);
                }
            } else if (EditorAction === 'add')  {
                try {
                    formValues.siteIds = formValues.sites.map(site => site.id);
                    const response = await insertEditor({ ...formValues });
                    if (response) {
                        response.sites = formValues.sites;
                        setEditors((prevEditors) => [...prevEditors, { ...response }]);
                        showNotification('success', t("showNotification.Success_add_editor"));
                    } else {
                        throw new Error('Invalid API response' + JSON.stringify(response));
                    }
                } catch (error) {
                    showNotification('error', t("showNotification.Error_add_editor") + error.message);
                }
            }
        } catch (error) {
            showNotification('error', t("showNotification.Error_add_editor") + error.message);
        }
        setPicture(null);
        handleCloseDialog();
    };

    return (
        <Dialog open={open} onClose={handleCloseDialog} style={{ direction: t('Direction') }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dir={t('Direction')}>
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
                    label="Google ID"
                    fullWidth
                    value={formValues.googleID}
                    onChange={handleChange('googleID')}
                    margin="normal"
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
                    <InputLabel>{t("Forms.Role") || "Role"}</InputLabel>
                    <Select
                        value={formValues.role}
                        onChange={handleChange('role')}
                    >
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                        <MenuItem value="EDITOR">EDITOR</MenuItem>
                        <MenuItem value="STUDENT">STUDENT</MenuItem>
                    </Select>
                </FormControl>

                {/* Dynamic user/coach selection based on role */}
                {formValues.role === 'EDITOR' && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>{t("Forms.SelectCoach")}</InputLabel>
                        <Select
                            value={formValues.userid || ''}
                            onChange={handleChange('userid')}
                        >
                            {filteredCoaches.map((coach) => (
                                <MenuItem key={coach.id} value={coach.id}>
                                    {coach.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                {formValues.role === 'STUDENT' && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>{t("Forms.SelectUser")}</InputLabel>
                        <Select
                            value={formValues.userid || ''}
                            onChange={handleChange('userid')}
                        >
                            {filteredUsers.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* MultipleSelect for sites */}

                <MultipleSelect
                    label={t("Forms.Select_Sites")}
                    formValues={formValues}
                    handleChange={handleChange}
                    sites={sites}
                    setFormValues={setFormValues}
                />

                {/* Default dashboard selection based on selected sites */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{t("Forms.DefaultDashboard")}</InputLabel>
                    <Select
                        value={formValues.defaultdashboard}
                        onChange={handleChange('defaultdashboard')}
                    >
                        {filteredRoutes.map(route => (
                            <MenuItem key={route.id} value={route.id}>
                                {route.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    {formValues.picture_url && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src={formValues.picture_url instanceof Blob ? URL.createObjectURL(formValues.picture_url) : formValues.picture_url}
                                alt="Uploaded"
                                style={{ width: '50%', height: '50%' }}
                            />
                        </div>
                    )}
                    <br />
                    <BasicSelect setFoldersite={setFoldersite} folderlist={folderNames} />
                    <InputFileUpload
                        setPicture={(newPicture) => {
                            formValues.picture_url = newPicture;
                            setPicture(newPicture);
                        }}
                    />
                    <p>{t("Forms.UploadImageText")}</p>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>{t("Forms.Cancel")}</Button>
                <Button onClick={handleSubmit}>{t("Forms.Submit")}</Button>
            </DialogActions>
        </Dialog>
    );
}
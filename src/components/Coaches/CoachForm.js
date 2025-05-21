import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    FormControl,
} from '@mui/material';

import { insertCoach, updateCoach, uploadFiles } from '../../api/api';
import InputFileUpload from '../InputFileUpload/InputFileUpload';
import BasicSelect from '../Gallery/BasicSelect';
import { getBlobsInContainer } from '../azureBlob';
import { useNotification } from '../Notification/NotificationProvider';
import { useTranslation } from "react-i18next";

export default function CoachForm({
    open,
    handleCloseDialog,
    initialValues,
    title,
    setCoaches,
    CoachAction,
}) {
    const [formValues, setFormValues] = useState({ ...initialValues });
    const [picture, setPicture] = useState(null);
    const [errors, setErrors] = useState({});
    const [Foldersite, setFoldersite] = useState('general');
    const [blobList, setBlobList] = useState([]);
    const [sortedUrls, setSortedUrls] = useState({});
    const [folderNames, setFolderNames] = useState([]);
    const { showNotification } = useNotification();
    const { t } = useTranslation();

    // Fetch blob list on mount
    useEffect(() => {
        async function fetchBlobs() {
            setBlobList(await getBlobsInContainer());
        }
        fetchBlobs();
    }, []);

    // Sort blob URLs and set folder names
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
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            if (picture) {
                formValues.picture_url = await uploadFiles(picture, 'Coaches media/picture', Foldersite);
            }
            if (CoachAction === 'edit') {
                try {
                    await updateCoach(formValues.id, formValues).then((response) => {
                        showNotification('success', t("showNotification.Success_edit_coach"));
                        setCoaches((prevCoaches) =>
                            prevCoaches.map(coach => coach.id === formValues.id ? { ...response.data } : coach)
                        );
                    });
                } catch (error) {
                    showNotification('error', t("showNotification.Error_edit_coach") + error.message);
                }
            } else {
                try {
                    await insertCoach({ ...formValues }).then((response) => {
                        showNotification('success', t("showNotification.Success_add_coach"));
                        setCoaches((prevCoaches) => [...prevCoaches, { ...response }]);
                    });
                } catch (error) {
                    showNotification('error', t("showNotification.Error_add_coach") + error.message);
                }
            }
        } catch (error) {
            showNotification('error', t("showNotification.Error_add_coach") + error.message);
        }
        setPicture(null);
        handleCloseDialog(); // Close the dialog
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
                <FormControl fullWidth margin="normal">
                    {formValues.picture_url && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src={formValues.picture_url instanceof Blob ? URL.createObjectURL(formValues.picture_url) : formValues.picture_url}
                                alt="Uploaded Picture"
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
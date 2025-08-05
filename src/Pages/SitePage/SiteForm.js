import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    FormControl,
    CircularProgress,
    Typography,
} from '@mui/material';
import { insertSite, updateSite, uploadFiles } from '../../api/api';
import InputFileUpload from '../../components/InputFileUpload/InputFileUpload';
import { useNotification } from '../../components/Notification/NotificationProvider';
import { useTranslation } from "react-i18next";

export default function SiteForm({
    open,
    handleCloseDialog,
    initialValues,
    title,
    setSites,
    SiteAction,
}) {
    const [formValues, setFormValues] = useState({ ...initialValues });
    const [picture, setPicture] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); // Error state
    const { showNotification } = useNotification();
    const { t } = useTranslation();

    useEffect(() => {
        setFormValues({ ...initialValues });
    }, [initialValues]);

    const handleChange = (field) => (event) => {
        setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const validate = () => {
        let tempErrors = {};
        if (!formValues.name) tempErrors.name = t("FormsErrors.NameRequired");
        if (!formValues.description) tempErrors.description = t("FormsErrors.DescriptionRequired");
        if (!formValues.nameInEnglish) tempErrors.nameInEnglish = t("FormsErrors.NameInEnglishRequired");
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true); // Start loading
        setError(null); // Reset error state

        try {
            if (picture) {
                formValues.picture_url = await uploadFiles(picture, 'Site media/picture', formValues.nameInEnglish);
            }
            if (SiteAction === 'edit') {
                const response = await updateSite(formValues.id, formValues);
                showNotification('success', t("showNotification.Success_edit_site"));
                setSites((prevSites) =>
                    prevSites.map(site => site.id === formValues.id ? { ...response.data } : site)
                );
            } else {
                const response = await insertSite({ ...formValues });
                showNotification('success', t("showNotification.Success_add_site"));
                setSites((prevSites) => [...prevSites, { ...response }]);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || t("showNotification.Error_add_site"));
            showNotification('error', t("showNotification.Error_add_site") + error.message);
        } finally {
            setLoading(false); // Stop loading
        }

        setPicture(null);
        handleCloseDialog();
    };

    return (
        <Dialog open={open} onClose={handleCloseDialog} style={{ direction: t('Direction') }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dir={t('Direction')}>
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <CircularProgress />
                    </div>
                )}
                {error && (
                    <Typography color="error" style={{ marginBottom: '16px', textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}
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
                    required
                    label={t("Forms.Description")}
                    fullWidth
                    value={formValues.description}
                    onChange={handleChange('description')}
                    margin="normal"
                    error={!!errors.description}
                    helperText={errors.description}
                />
                <TextField
                    label={t("Forms.NameInEnglish")}
                    fullWidth
                    value={formValues.nameInEnglish}
                    onChange={handleChange('nameInEnglish')}
                    margin="normal"
                    disabled={SiteAction === 'edit'} // Disable if SiteAction is 'edit'
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
                <Button onClick={handleCloseDialog} disabled={loading}>
                    {t("Forms.Cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {t("Forms.Submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
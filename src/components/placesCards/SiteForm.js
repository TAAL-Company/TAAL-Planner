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
import { insertSite, updateSite, uploadFiles } from '../../api/api';
import InputFileUpload from '../InputFileUpload/InputFileUpload';
import { useNotification } from '../Notification/NotificationProvider';
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

        try {
            if (picture) {
                formValues.picture_url = await uploadFiles(picture, 'Site media/picture', formValues.nameInEnglish);
            }
            if (SiteAction === 'edit') {
                await updateSite(formValues.id, formValues).then((response) => {
                    showNotification('success', t("showNotification.Success_edit_site"));
                    setSites((prevSites) =>
                        prevSites.map(site => site.id === formValues.id ? { ...response.data } : site)
                    );
                });
            } else {
                await insertSite({ ...formValues }).then((response) => {
                    showNotification('success', t("showNotification.Success_add_site"));
                    setSites((prevSites) => [...prevSites, { ...response }]);
                });
            }
        } catch (error) {
            showNotification('error', t("showNotification.Error_add_site") + error.message);
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
                <Button onClick={handleCloseDialog}>{t("Forms.Cancel")}</Button>
                <Button onClick={handleSubmit}>{t("Forms.Submit")}</Button>
            </DialogActions>
        </Dialog>
    );
}
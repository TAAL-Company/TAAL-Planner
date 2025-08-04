import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTranslation } from "react-i18next";
import { insertRoute, updateRoute } from '../../api/api';
import { useNotification } from '../../components/Notification/NotificationProvider';
import MultipleSelect from '../../components/MultipleSelectCheckmarks/MultipleSelectCheckmarks';

export default function RouteForm({
  open,
  handleCloseDialog,
  initialValues,
  title,
  setRoutes,
  RouteAction,
  sites,
  routes,
}) {
  const [formValues, setFormValues] = useState({ ...initialValues });
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  useEffect(() => {
    setFormValues({ ...initialValues });
    setErrors({});
  }, [initialValues]);

  const handleChange = (field) => (event) => {
    const value = field === 'OnlyOnce' ? event.target.checked : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formValues.name) tempErrors.name = t("FormsErrors.nameRequired");
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (RouteAction === 'edit') {
        formValues.siteIds = formValues.sites.map(site => site.id); // Ensure siteIds is set for the API call
        formValues.studentIds = formValues.students.map(student => student.id); // Ensure studentIds is set for the API call
        formValues.taskIds = formValues.tasks.map(task => task.id); // Ensure taskIds is set for the API call
        await updateRoute(formValues.id, formValues).then((response) => {
          showNotification('success', t("showNotification.Success_edit_route"));
          setRoutes((prevRoutes) =>
            prevRoutes.map(route => route.id === formValues.id ? { ...response } : route)
          );
        });
      } else if (RouteAction === 'add') {
        formValues.siteIds = formValues.sites.map(site => site.id); // Ensure siteIds is set for the API call
        delete formValues.sites; // Remove id for new route creation
        await insertRoute(formValues).then((response) => {
          showNotification('success', t("showNotification.Success_add_route"));
          setRoutes((prevRoutes) => [...prevRoutes, { ...response }]);
        });
      }
    } catch (error) {
      showNotification('error', t("showNotification.Error_route") + (error.message));
    }
    handleCloseDialog();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} style={{ direction: t('Direction') }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dir={t('Direction')}>
        <TextField
          required
          label={t("Route.Name")}
          fullWidth
          value={formValues.name}
          onChange={handleChange('name')}
          margin="normal"
          error={errors.name}
          helperText={errors.name}
        />
        <TextField
          label={t("Route.multi_language_description")}
          fullWidth
          value={formValues.multi_language_description}
          onChange={handleChange('multi_language_description')}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>{t("Route.ParentRouteId")}</InputLabel>
          <Select
            value={formValues.parentRouteId}
            onChange={handleChange('parentRouteId')}
          >
            {routes.map(route => (
              <MenuItem key={route.id} value={route.id}>
                {route.name}
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
        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.OnlyOnce}
              onChange={handleChange('OnlyOnce')}
            />
          }
          label={t("Route.OnlyOnce")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>{t("Forms.Cancel")}</Button>
        <Button onClick={handleSubmit}>{t("Forms.Submit")}</Button>
      </DialogActions>
    </Dialog>
  );
}
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
import I18nHoverText from '../../components/I18nHoverText/I18nHoverText';

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
    if (!formValues.name) tempErrors.name = t("FormsErrors.NameRequired");
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

  const titleKey = RouteAction === 'edit' ? 'RoutePage.EditRouteInfo' : 'RoutePage.ADDANewRoute';

  return (
    <Dialog open={open} onClose={handleCloseDialog} style={{ direction: t('Direction') }}>
      <DialogTitle>
        <I18nHoverText translationKey={titleKey}>{title}</I18nHoverText>
      </DialogTitle>
      <DialogContent dir={t('Direction')}>
        <TextField
          required
          label={<I18nHoverText translationKey="Route.Name">{t("Route.Name")}</I18nHoverText>}
          fullWidth
          value={formValues.name}
          onChange={handleChange('name')}
          margin="normal"
          error={errors.name}
          helperText={errors.name}
        />
        <TextField
          label={<I18nHoverText translationKey="Route.multi_language_description">{t("Route.multi_language_description")}</I18nHoverText>}
          fullWidth
          value={formValues.multi_language_description}
          onChange={handleChange('multi_language_description')}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>
            <I18nHoverText translationKey="Route.ParentRouteId">{t("Route.ParentRouteId")}</I18nHoverText>
          </InputLabel>
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
          translationKey="Forms.Select_Sites"
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
          label={<I18nHoverText translationKey="Route.OnlyOnce">{t("Route.OnlyOnce")}</I18nHoverText>}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}><I18nHoverText translationKey="Forms.Cancel">{t("Forms.Cancel")}</I18nHoverText></Button>
        <Button onClick={handleSubmit}><I18nHoverText translationKey="Forms.Submit">{t("Forms.Submit")}</I18nHoverText></Button>
      </DialogActions>
    </Dialog>
  );
}
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import {
  getingData_Editors,
  getingData_Places,
  getingData_Users,
  getingData_coaches,
} from '../../api/api';
import EditorForm from '../EditorsPage/EditorForms';

const Field = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
    <Typography sx={{ fontWeight: 'bold', minWidth: 180 }}>{label}</Typography>
    <Typography sx={{ wordBreak: 'break-word' }}>{value}</Typography>
  </Box>
);

const Profile = () => {
  const { t } = useTranslation();
  const [editor, setEditor] = useState(null);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = JSON.parse(sessionStorage.getItem('jwt'));
        const [all, allSites, allUsers, allCoaches] = await Promise.all([
          getingData_Editors(),
          getingData_Places(),
          getingData_Users(),
          getingData_coaches(),
        ]);
        setEditor(all.find((e) => e.id === me?.id) || me);
        setSites(allSites);
        setUsers(allUsers);
        setCoaches(allCoaches);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };
    load();
  }, []);

  // EditorForm updates the list through an updater function; here the "list" is just this editor
  const setEditorFromList = (updater) => {
    setEditor((prev) => {
      const next = updater([prev])[0];
      const stored = JSON.parse(sessionStorage.getItem('jwt') || '{}');
      sessionStorage.setItem('jwt', JSON.stringify({ ...stored, ...next }));
      return next;
    });
  };

  if (error) {
    return <Alert severity="error">{t('ProfilePage.LoadError')}</Alert>;
  }
  if (!editor) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress aria-label={t('plannerPage.Loading')} />
      </Box>
    );
  }

  const none = '-';
  const linked = (editor.role === 'EDITOR' ? coaches : users).find((x) => x.id === editor.userid);
  const siteNames = (editor.sites || sites.filter((s) => (editor.siteIds || []).includes(s.id)))
    .map((s) => s.name)
    .join(', ');
  const dashboard = sites
    .flatMap((s) => s.routes || [])
    .find((r) => r.id === editor.defaultdashboard);

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto', direction: t('Direction') }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar src={editor.picture_url || undefined} sx={{ width: 80, height: 80 }} />
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('ProfilePage.MyProfile')}
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          {t('ProfilePage.EditProfile')}
        </Button>
      </Box>

      <Field label={t('Forms.Name')} value={editor.name || none} />
      <Field label={t('Forms.Email')} value={editor.email || none} />
      <Field label={t('Forms.Phone')} value={editor.phone || none} />
      <Field label={t('ProfilePage.GoogleID')} value={editor.googleID || none} />
      <Field label={t('Forms.Role')} value={editor.role || none} />
      <Field label={t('ProfilePage.LinkedUser')} value={linked?.name || none} />
      <Field label={t('Forms.Select_Sites')} value={siteNames || none} />
      <Field label={t('Forms.DefaultDashboard')} value={dashboard?.name || none} />
      <Field
        label={t('ProfilePage.AIAccess')}
        value={editor.canUseAI ? t('ProfilePage.Yes') : t('ProfilePage.No')}
      />
      {editor.canUseAI && (
        <Field
          label={t('ProfilePage.AIUsage')}
          value={`${editor.aiUsageCount ?? 0} / ${editor.aiUsageLimit ?? 10}`}
        />
      )}

      <EditorForm
        open={open}
        handleCloseDialog={() => setOpen(false)}
        initialValues={editor}
        title={t('ProfilePage.EditProfile')}
        setEditors={setEditorFromList}
        EditorAction="edit"
        users={users}
        sites={sites}
        coaches={coaches}
      />
    </Box>
  );
};

export default Profile;

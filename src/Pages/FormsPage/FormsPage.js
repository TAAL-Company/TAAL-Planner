import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CircularProgress, Backdrop, IconButton, Tooltip, Fab, Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import FlagsTable from './flags/FlagsTable';
import PersonalInfoTable from './personalinfo/PersonalInfoTable';
import TaskPerformanceTable from './taskperformanceinfo/TaskPerformanceTable';
import TaskAbilityTable from './taskability/TaskAbilityTable';
import GeneralPerformanceTable from './generalperformanceinfo/GeneralPerformanceTable';
import SettingsDialog from './components/SettingsDialog';
import { useTranslation } from "react-i18next";
import { useTranslator } from '../../Utility/TranslationProvider';
import './FormsPage.css';
import {
  getingData_Users,
  getingData_Tasks,
  getingData_Routes,
  getCognitiveAbillities,
  getAllCognitiveProfiles,
  getAllTaskCognitiveRequirements,
  getingData_Places,
} from '../../api/api';

const FormsPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [cognitiveAbillities, setCognitiveAbillities] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState([]);
  const [taskAbilityLists, setTaskAbilityList] = useState([]);
  const [selectedTable, setSelectedTable] = useState('flags');

  // Settings and translation state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentTranslationLang, setCurrentTranslationLang] = useState('');

  // Original data refs (to restore from)
  const originalDataRef = useRef({
    users: [],
    tasks: [],
    routes: [],
    abilities: [],
    sites: [],
  });

  const { t } = useTranslation();
  const { translateArrayOfObjects } = useTranslator();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [users, tasks, routes, abilities, cognitiveProfiles, taskRequirements, sitesData] = await Promise.all([
          getingData_Users(),
          getingData_Tasks(),
          getingData_Routes(),
          getCognitiveAbillities(),
          getAllCognitiveProfiles(),
          getAllTaskCognitiveRequirements(),
          getingData_Places()
        ]);

        const profileIds = new Set(
          (cognitiveProfiles || []).map((profile) => profile.studentId)
        );

        const requirementIds = new Set(
          (taskRequirements || []).map((req) => req.taskId)
        );

        const markedTasks = (tasks || []).map((task) => ({
          ...task,
          hasTaskCognitiveRequirements: requirementIds.has(task.id),
        }));

        const markedRoutes = (routes || []).map((route) => {
          const mappedTasks = (route.tasks || []).map((task) => {
            const taskIdentifier = task.taskId ?? task.id;
            return {
              ...task,
              hasTaskCognitiveRequirements: requirementIds.has(taskIdentifier),
            };
          });

          return {
            ...route,
            tasks: mappedTasks,
            hasTaskCognitiveRequirements: mappedTasks.some(
              (task) => task.hasTaskCognitiveRequirements
            ),
          };
        });

        const routesById = new Map(
          (markedRoutes || []).map((route) => [route.id, route])
        );

        const markedUsers = (users || []).map((user) => ({
          ...user,
          hasCognitiveProfile: profileIds.has(user.id),
          routes: (user.routes || []).map(
            (route) => routesById.get(route.id) ?? route
          ),
        }));

        const markedSites = (sitesData || []).map((site) => {
          const siteRouteIds = site.routes.map((route) => route.id);
          const siteRoutes = markedRoutes.filter((route) =>
            siteRouteIds.includes(route.id)
          );
          return {
            ...site,
            routes: siteRoutes,
            hasTaskCognitiveRequirements: siteRoutes.some(
              (route) => route.hasTaskCognitiveRequirements
            ),
          };
        });

        setAllUsers(markedUsers);
        setAllTasks(markedTasks);
        setAllRoutes(markedRoutes);
        setCognitiveAbillities(abilities || []);
        setSites(markedSites || []);

        // Store original data for restore functionality
        originalDataRef.current = {
          users: markedUsers,
          tasks: markedTasks,
          routes: markedRoutes,
          abilities: abilities || [],
          sites: markedSites || [],
        };

        // --- Automatic translation based on login language ---
        // Map sessionStorage language to translation code
        const langMap = {
          Hebrew: 'he',
          English: 'en',
          Arabic: 'ar',
          Russian: 'ru',
        };
        const loginLang = sessionStorage.getItem('language');
        const code = langMap[loginLang];
        // Only auto-translate if not Hebrew (original data)
        if (code && code !== 'original') {
          await handleTranslateData(code);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
  };

  // Handle translating all API data
  const handleTranslateData = useCallback(async (targetLang) => {
    setIsTranslating(true);
    try {
      const original = originalDataRef.current;

      // Translate all data in parallel using efficient batch translation
      const [
        translatedUsers,
        translatedTasks,
        translatedRoutes,
        translatedAbilities,
        translatedSites,
      ] = await Promise.all([
        // Translate users (name fields , role fields)
        translateArrayOfObjects(original.users, targetLang, ['name', 'role']),
        // Translate tasks (title, subtitle fields)
        translateArrayOfObjects(original.tasks, targetLang, ['title', 'subtitle']),
        // Translate routes (name fields)
        translateArrayOfObjects(original.routes, targetLang, ['name']),
        // Translate cognitive abilities (category, trait fields)
        translateArrayOfObjects(original.abilities, targetLang, ['category', 'trait']),
        // Translate sites (name, description fields)
        translateArrayOfObjects(original.sites, targetLang, ['name', 'description']),
      ]);

      console.log("Translation complete:", {
        users: translatedUsers,
        tasks: translatedTasks,
        routes: translatedRoutes,
        abilities: translatedAbilities,
        sites: translatedSites,
      });

      const translatedRoutesById = new Map(
        translatedRoutes.map(route => [route.id, route])
      );

      const translatedUsersWithRoutesNames = translatedUsers.map(user => ({
        ...user,
        routes: (user.routes || []).map(route =>
          translatedRoutesById.get(route.id) ?? route
        )
      }));

      setAllUsers(translatedUsersWithRoutesNames);
      setAllTasks(translatedTasks);
      setAllRoutes(translatedRoutes);
      setCognitiveAbillities(translatedAbilities);
      setSites(translatedSites);

      setIsTranslated(true);
      setCurrentTranslationLang(targetLang);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [translateArrayOfObjects]);

  // Handle restoring original data
  const handleRestoreOriginal = useCallback(() => {
    const original = originalDataRef.current;
    setAllUsers(original.users);
    setAllTasks(original.tasks);
    setAllRoutes(original.routes);
    setCognitiveAbillities(original.abilities);
    setSites(original.sites);
    setIsTranslated(false);
    setCurrentTranslationLang('');
  }, []);

  return (
    <div className='Forms'>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size='10rem' color={isTranslating ? 'secondary' : 'primary'} />
          {isTranslating && (
            <Typography position='absolute'>
              <span style={{ marginTop: 24, fontSize: 28 }}>{t('FormsPage.translating')}</span>
            </Typography>
          )}
        </Box>
      </Backdrop>

      <div style={{ width: '100%' }}>
        <Fab
          title={t('FormsPage.settings') || 'Settings'}
          color="primary"
          size="small"
          onClick={() => setSettingsOpen(true)}
          sx={{
            position: "absolute",
            top: 80,
            [t('Direction') === 'rtl' ? 'left' : 'right']: 16,
            bgcolor: "#114260",
            "&:hover": { bgcolor: "#0d324d" },
            zIndex: 1000,
          }}
        >
          <SettingsIcon />
        </Fab>
        <div
          className='NavbarForms'
          style={{ direction: t('Direction') }}
        >
          <nav>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('flags')}
            >
              {t('FormsPage.flags')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('personalInfo')}
            >
              {t('FormsPage.personalInfo')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('taskPerformanceInfo')}
            >
              {t('FormsPage.taskPerformanceInfo')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('taskability')}
            >
              {t('FormsPage.taskability')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('generalPerformanceInfo')}
            >
              {t('FormsPage.generalPerformanceInfo')}
            </button>
          </nav>
        </div>

        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onTranslate={handleTranslateData}
          onRestore={handleRestoreOriginal}
          isTranslating={isTranslating}
          isTranslated={isTranslated}
          currentTranslationLang={currentTranslationLang}
        />

        {selectedTable === 'flags' && (
          <div>
            <div className='headlineForms'>{t('FormsPage.flagsTitle')}</div>
            <div className='tableForms'>
              <FlagsTable
                allUsers={allUsers}
                allRoutes={allRoutes}
                worker={worker}
                setWorker={setWorker}
                cognitiveList={cognitiveAbillities}
                taskAbilityLists={taskAbilityLists}
                setTaskAbilityList={setTaskAbilityList}
                allTasks={allTasks}
              />
            </div>
          </div>
        )}

        {selectedTable === 'personalInfo' && (
          <div>
            <div className='headlineForms'>{t('FormsPage.personalInfoTitle')}</div>
            <div className='tableForms'>
              <PersonalInfoTable
                worker={worker}
              />
            </div>
          </div>
        )}

        {selectedTable === 'taskPerformanceInfo' && (
          <div>
            <div className='headlineForms'>{t('FormsPage.taskPerformanceTitle')}</div>
            <div className='tableForms'>
              <TaskPerformanceTable
                allUsers={allUsers}
                worker={worker}
                setWorker={setWorker}
                cognitiveAbilities={cognitiveAbillities}
              />
            </div>
          </div>
        )}

        {selectedTable === 'taskability' && (
          <div>
            <div className='headlineForms'>{t('FormsPage.taskabilityTitle')}</div>
            <div className='tableForms'>
              <TaskAbilityTable
                allRoutes={allRoutes}
                allTasks={allTasks}
                cognitiveAbilities={cognitiveAbillities}
                sites={sites}
              />
            </div>
          </div>
        )}

        {selectedTable === 'generalPerformanceInfo' && (
          <div>
            <div className='headlineForms'>{t('FormsPage.generalPerformanceTitle')}</div>
            <div className='tableForms'>
              <GeneralPerformanceTable cognitiveList={cognitiveAbillities} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsPage;

import React, { useState, useEffect } from 'react';
import { CircularProgress, Backdrop } from '@mui/material';
import FlagsTable from './flags/FlagsTable';
import PersonalInfoTable from './personalinfo/PersonalInfoTable';
import TaskPerformanceTable from './taskperformanceinfo/TaskPerformanceTable';
import TaskAbilityTable from './taskability/TaskAbilityTable';
import GeneralPerformanceTable from './generalperformanceinfo/GeneralPerformanceTable';
import { getTranslation } from './i18n';
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
  const [language, setLanguage] = useState('hebrew');

  const t = (key) => getTranslation(key, language === 'hebrew' ? 'he' : 'en');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          users,
          tasks,
          routes,
          abilities,
          cognitiveProfiles,
          taskRequirements,
          sitesData,
        ] = await Promise.all([
          getingData_Users(),
          getingData_Tasks(),
          getingData_Routes(),
          getCognitiveAbillities(),
          getAllCognitiveProfiles(),
          getAllTaskCognitiveRequirements(),
          getingData_Places(),
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

        setAllUsers(markedUsers);
        setAllTasks(markedTasks);
        setAllRoutes(markedRoutes);
        setCognitiveAbillities(abilities || []);
        setSites(sitesData || []);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
  };

  return (
    <div className='Forms'>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress size='10rem' color='info' />
      </Backdrop>

      <div style={{ width: '100%' }}>
        <div>
          <button
            className={`switch-button-forms ${
              language === 'hebrew' ? 'hebrew' : 'english'
            }`}
            onClick={() =>
              setLanguage(language === 'hebrew' ? 'english' : 'hebrew')
            }
          >
            {language === 'hebrew' ? (
              <>
                <i className='flag-icon flag-icon-il'></i>
                <h4 style={{ marginLeft: 'd' }}>EN</h4>
              </>
            ) : (
              <>
                <i className='flag-icon flag-icon-us'></i>
                <h4 style={{ marginLeft: 'd' }}>HE</h4>
              </>
            )}
          </button>
        </div>

        <div
          className='NavbarForms'
          style={{ direction: language === 'hebrew' ? 'rtl' : 'ltr' }}
        >
          <nav>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('flags')}
            >
              {t('flags')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('personalInfo')}
            >
              {t('personalInfo')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('taskPerformanceInfo')}
            >
              {t('taskPerformanceInfo')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('taskability')}
            >
              {t('taskability')}
            </button>
            <button
              className='btn_nav_forms'
              onClick={() => handleSelectTable('generalPerformanceInfo')}
            >
              {t('generalPerformanceInfo')}
            </button>
          </nav>
        </div>

        {selectedTable === 'flags' && (
          <div>
            <div className='headlineForms'>{t('flagsTitle')}</div>
            <div className='tableForms'>
              <FlagsTable
                language={language === 'hebrew' ? 'he' : 'en'}
                allUsers={allUsers}
                allRoutes={allRoutes}
                worker={worker}
                setWorker={setWorker}
                cognitiveList={cognitiveAbillities}
                taskAbilityLists={taskAbilityLists}
                setTaskAbilityList={setTaskAbilityList}
              />
            </div>
          </div>
        )}

        {selectedTable === 'personalInfo' && (
          <div>
            <div className='headlineForms'>{t('personalInfoTitle')}</div>
            <div className='tableForms'>
              <PersonalInfoTable
                language={language === 'hebrew' ? 'he' : 'en'}
                worker={worker}
              />
            </div>
          </div>
        )}

        {selectedTable === 'taskPerformanceInfo' && (
          <div>
            <div className='headlineForms'>{t('taskPerformanceTitle')}</div>
            <div className='tableForms'>
              <TaskPerformanceTable
                language={language === 'hebrew' ? 'he' : 'en'}
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
            <div className='headlineForms'>{t('taskabilityTitle')}</div>
            <div className='tableForms'>
              <TaskAbilityTable
                language={language === 'hebrew' ? 'he' : 'en'}
                allRoutes={allRoutes}
                allTasks={allTasks}
                cognitiveAbilities={cognitiveAbillities}
              />
            </div>
          </div>
        )}

        {selectedTable === 'generalPerformanceInfo' && (
          <div>
            <div className='headlineForms'>{t('generalPerformanceTitle')}</div>
            <div className='tableForms'>
              <GeneralPerformanceTable
                language={language === 'hebrew' ? 'he' : 'en'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsPage;

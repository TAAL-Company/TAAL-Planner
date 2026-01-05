import React, { useState, useEffect } from 'react';
import './Modal.css';
import { insertRoute } from '../../../api/api';
import { useNotification } from "../../../components/Notification/NotificationProvider";
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTranslation } from 'react-i18next';

function Model_assigned_route_to_parent({
  setOpenModalRouteChosen,
  language,
  routeName,
  tasksForNewRoute,
  myStudentsList,
  routeUUID,
  setFilteredDataRoutes,
  routesList
}) {
  const { t } = useTranslation();
  let today = new Date();
  const [routeTitle, setRouteTitle] = useState(routeName + "-" + " Child " + "-" + today.toLocaleDateString("en-US"));
  const { showNotification } = useNotification();
  const [searchRoute, setSearchRoute] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(routeUUID);

  function Post_new_Route() {
    let taskIdList = [];
    tasksForNewRoute.map((task) => taskIdList.push(task.id));

    let studentIdList = [];
    myStudentsList.map((student) => studentIdList.push(student.id));//myStudents

    let newRouteObj = {
      name: routeTitle,
      studentIds: studentIdList,
      taskIds: taskIdList,
      siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
      parentRouteId: selectedRoute 
    };

    console.log(newRouteObj);

    try {
      insertRoute(newRouteObj).then((data) => {
        setFilteredDataRoutes((prevRoutes) => [...prevRoutes, data]);
      });
      setOpenModalRouteChosen(false);
      showNotification("success", t("plannerPage.route_created_successfully"));
    } catch (error) {
      console.error(error.message);
      showNotification("error", t("plannerPage.Error_Creating_Route"));
    }
  }

  return (
    <Box sx={{
      position: 'absolute',
      top: '0%',
      left: '0%',
      bgcolor: 'background.paper',
      boxShadow: 24,
    }}>
      <Box className='headerNewRoute'
        dir={language === 'English' ? 'ltr' : 'rtl'} >
        <Box className='newRoutTitle'>
          {t("plannerPage.Save_Route")}
        </Box>
      </Box>
      <Box className='bodySaveRoute'
        style={{
          textAlign:
            language === 'English' ? 'right' : 'left',
        }}
      >
        <Box>
          {t("plannerPage.Name_of_the_route")}
        </Box>
        <input
          className='inputRouteName'
          style={{ paddingRight: language !== 'English' ? '' : '10px', paddingLeft: language !== 'English' ? '10px' : '' }}
          required={true}
          type='text'
          value={routeTitle}
          onChange={(e) => setRouteTitle(e.target.value)}
        ></input>
        <Box>
          {t("plannerPage.List_of_Routes")}
        </Box>
        <input
          type='text'
          style={{ paddingRight: language !== 'English' ? '' : '10px', paddingLeft: language !== 'English' ? '10px' : '', width: '100%' }}
          placeholder={t("plannerPage.Search_Route")}
          value={searchRoute}
          onChange={(e) => setSearchRoute(e.target.value)}
        />
        <Box className='allStudent'>
          {routesList
            .filter((route) => route.parentRouteId === null)
            .filter((value) => value.name.toLowerCase().includes(searchRoute.toLowerCase()))
            .map((route) => (
              <Box key={route.id} className={`list-group-item ${language !== 'English' ? 'english' : ''}`}>
                <FormControlLabel
                  control={
                    <Radio
                      checked={selectedRoute === route.id}
                      onChange={(e) => setSelectedRoute(route.id)}
                      value={route.id}
                    />
                  }
                  label={route.name}
                />
              </Box>
            ))}
        </Box>
      </Box>
      <Box className='footer'>
        <button className='continueBtn' onClick={Post_new_Route}>
          {t("plannerPage.Save_Route")}
        </button>
        <button
          className='cancelBtn'
          onClick={() => {
            setOpenModalRouteChosen(false);
          }}
        >
          {t("plannerPage.Cancel")}
        </button>
      </Box>
    </Box>
  )
}
export default Model_assigned_route_to_parent;
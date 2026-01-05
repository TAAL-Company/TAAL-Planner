import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import boot from './boot.module.css';
import './style.css';
// import { AiFillCheckCircle } from "react-icons/ai";
// import { MdHelpOutline } from "react-icons/md";
import Places from '../Places/Places';
import 'reactjs-popup/dist/index.css';
import Modal from '../Modal/Modal';

//-------------------------
const Planner = () => {
  const { t } = useTranslation();
  const [get_logged_in, setLogged_in] = useState(false); // for TextView
  const [
    get_Name,
    // setName
  ] = useState(null); // for TextView
  const [marginHebrew, setMarginHebrew] = useState('150px');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [Hebrew, setHebrew] = useState(false);
  const [language, setLanguage] = useState('English');
  const [floatLan, setFloatLan] = useState('left');
  const [sites, setSites] = useState(t('plannerPage.Sites'));
  const [addSite, setAddSite] = useState(t('plannerPage.Add_sites'));
  const [stations, setStations] = useState(t('plannerPage.Stations'));
  const [addStation, setAddStation] = useState(t('plannerPage.Add_stations'));
  const [myTasks, setTasks] = useState(t('plannerPage.Tasks'));
  const [addMyTask, setAddTask] = useState(t('plannerPage.Add_tasks'));
  const [saveButton, setSaveButton] = useState(t('plannerPage.Save_route'));
  const [siteLanguage, setSiteLanguage] = useState(t('plannerPage.Site'));
  const [workerLanguage, setWorkerLanguage] = useState(t('plannerPage.Worker'));
  const [siteQuestionLanguage, setSiteQuestionLanguage] = useState(
    t('plannerPage.select_site_to_build_route_on')
  );
  const [SiteStudentQuestionLanguage, setSiteStudentQuestionLanguage] = useState(
    t('plannerPage.for_which_worker_do_you_want_to_build_a_track')
  );
  const [
    ,
    // routeWrite
    setRouteWrite,
  ] = useState(t('plannerPage.Write_down_the_name_of_the_route'));
  const [drag, setRDrag] = useState('route view');
  const [routesBeforeChoosingSite, setRoutesBeforeChoosingSite] = useState(
    t('plannerPage.After_selecting_the_site_this_column_will_show_routes_that_exist_on_the_site')
  );
  const [tasksBeforeChoosingSite, setTasksBeforeChoosingSite] = useState(
    t('plannerPage.After_selecting_the_station_this_column_will_show_tasks_that_exist_in_it')
  );
  const [stationsBeforeChoosingSite, setStationsBeforeChoosingSite] = useState(
    t('plannerPage.After_selecting_the_route_this_column_will_show_the_stations_that_exist_in_it')
  );

  const [titlePlacesCss, setTitlePlacesCss] = useState(
    'linear-gradient(90deg, #7A78B7  5%, #7A78B71F 1%)'
  );
  const [titleStationCss, setTitleStationCss] = useState(
    'linear-gradient(90deg, #F2AE69 5%, #FEF5ED 1%)'
  );
  const [titleTaskCss, setTitleTaskCss] = useState(
    'linear-gradient(90deg, #C4CE9C 5%, #F8F9F3 1%)'
  );
  const [
    ,
    // inputSide
    setInputSide,
  ] = useState('left');
  const [flagHebrew, setflagHebrew] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setLogged_in(sessionStorage.getItem('logged_in'));
        // getData();
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };

    if (sessionStorage.getItem('language') === 'English') {
      hebrew();
    } else if (sessionStorage.getItem('language') === 'Hebrew') {
      english();
    } else if (sessionStorage.getItem('language') === 'Arabic') {
      english();
    } else if (sessionStorage.getItem('language') === 'Russian') {
      hebrew();
    } else {
      english();
    }
    
    fetchData();
  }, []);

  //-------------------input-------------------------
  // function getName(val) {
  //     setName(val.target.value)
  // }

  /*changing between Hebrew and English */
  const hebrew = () => {
    setHebrew(false);
    setLanguage(t('plannerPage.Hebrew'));
    setFloatLan('left');
    setSites(t('plannerPage.Sites'));
    setStations(t('plannerPage.Stations'));
    setTasks(t('plannerPage.Tasks'));
    setSaveButton(t('plannerPage.Save_route'));
    setRouteWrite(t('plannerPage.Write_down_the_name_of_the_route'));
    setRDrag(t('plannerPage.Route_View'));
    setAddSite(t('plannerPage.Add_sites'));
    setAddStation(t('plannerPage.Add_stations'));
    setAddTask(t('plannerPage.Add_tasks'));
    setSiteQuestionLanguage(t('plannerPage.select_site_to_build_route_on'));
    setSiteStudentQuestionLanguage(t('plannerPage.for_which_worker_do_you_want_to_build_a_track'));
    setSiteLanguage(t('plannerPage.Site'));
    setWorkerLanguage(t('plannerPage.Worker'));
    setRoutesBeforeChoosingSite(
      t('plannerPage.After_selecting_the_site_this_column_will_show_routes_that_exist_on_the_site')
    );
    setTasksBeforeChoosingSite(
      t('plannerPage.After_selecting_the_station_this_column_will_show_tasks_that_exist_in_it')
    );
    setStationsBeforeChoosingSite(
      t('plannerPage.After_selecting_the_route_this_column_will_show_the_stations_that_exist_in_it')
    );
    // setTitlePlacesCss("linear-gradient(90deg, #7A78B7  5%, #7A78B71F 1%)");
    // setTitleStationCss("linear-gradient(90deg,#F2AE69 5%, #FEF5ED 1%)");
    // setTitleTaskCss("linear-gradient(90deg, #C4CE9C 5%, #F8F9F3 1%)");
    setInputSide('left');
    setflagHebrew(true);
    setMarginHebrew('150px');
  };
  const english = () => {//hebrow
    setHebrew(true);
    setLanguage(t('plannerPage.English'));
    setFloatLan('right');
    setSiteQuestionLanguage(t('plannerPage.select_site_to_build_route_on'));
    setSiteStudentQuestionLanguage(t('plannerPage.for_which_worker_do_you_want_to_build_a_track'));
    setSiteLanguage(t('plannerPage.Site'));
    setWorkerLanguage(t('plannerPage.Worker'));
    setSites(t('plannerPage.Sites'));
    setStations(t('plannerPage.Stations'));
    setTasks(t('plannerPage.Tasks'));
    setSaveButton(t('plannerPage.Save_route'));
    setRouteWrite(t('plannerPage.Write_down_the_name_of_the_route'));
    setRDrag(t('plannerPage.Route_View'));
    setAddSite(t('plannerPage.Add_sites'));
    setAddStation(t('plannerPage.Add_stations'));
    setAddTask(t('plannerPage.Add_tasks'));
    setRoutesBeforeChoosingSite(
      t('plannerPage.After_selecting_the_site_this_column_will_show_routes_that_exist_on_the_site')
    );
    setTasksBeforeChoosingSite(
      t('plannerPage.After_selecting_the_station_this_column_will_show_tasks_that_exist_in_it')
    );
    setStationsBeforeChoosingSite(
      t('plannerPage.After_selecting_the_route_this_column_will_show_the_stations_that_exist_in_it')
    );
    // setTitlePlacesCss("linear-gradient(90deg,  #7A78B71F 95%, #7A78B7 1%)");
    // setTitleStationCss("linear-gradient(90deg, #FEF5ED 95%, #F2AE69 1%)");
    // setTitleTaskCss("linear-gradient(90deg, #F8F9F3 95%, #C4CE9C 1%)");
    setInputSide('right');
    setflagHebrew(false);
    setMarginHebrew('150px');
  };
  return (
    <>
      {!get_logged_in ? (
        <div style={{ color: 'white' }}>{t('plannerPage.Please_connect_properly')}</div>
      ) : (
        <>
          <div className={boot.Planner} >
            {loading && <div>{t('plannerPage.Loading')}</div>}
            {!loading && (
              <>
                {/* <div
                  className={`Actions ${
                    language !== "English" ? "english" : ""
                  }`}
                > */}
                {/* כפתור שפות */}
                {/* <button
                    className="language"
                    style={{ marginLeft: marginHebrew, marginTop: "22px" }}
                    onClick={() => {
                      if (Hebrew !== false) hebrew();
                      else english();
                    }}
                  >
                    {language}
                  </button> */}
                {/* </div> */}

                {modalOpen && (
                  <Modal setOpenModal={setModalOpen} setText={get_Name} />
                )}
                <div className='warpper'>
                  <Places
                    setFloatLang={floatLan}
                    stationsBeforeChoosingSite={stationsBeforeChoosingSite}
                    tasksBeforeChoosingSite={tasksBeforeChoosingSite}
                    routesBeforeChoosingSite={routesBeforeChoosingSite}
                    language={language}
                    sites={sites}
                    stations={stations}
                    siteLanguage={siteLanguage}
                    workerLanguage={workerLanguage}
                    siteQuestionLanguage={siteQuestionLanguage}
                    SiteStudentQuestionLanguage={SiteStudentQuestionLanguage}
                    saveButton={saveButton}
                    myTasks={myTasks}
                    drag={drag}
                    addSite={addSite}
                    addStation={addStation}
                    addMyTask={addMyTask}
                    titlePlacesCss={titlePlacesCss}
                    titleStationCss={titleStationCss}
                    titleTaskCss={titleTaskCss}
                    flagHebrew={flagHebrew}
                    hebrew={hebrew}
                    english={english}
                    Hebrew={Hebrew}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};
export default Planner;

import React, { useState, useEffect, useCallback } from 'react';
import {
  getingData_Routes,
  getingData_Tasks,
  getingData_Places,
  getingDataStation,
  getingData_Users,
  deleteRoute,
  updateRoute,
  getingData_Editors,
  insertRoute
} from '../../api/api';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stations from '../Stations/Stations';
import Tasks from '../Tasks/tasks';
import Modal from '../Modal/Modal';
import ModalDropdown from '../Modal/Modal_dropdown';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { CgSearch } from 'react-icons/cg';
import textArea from '../../Pictures/textArea.svg';
import ModalRouteChosen from '../Modal/Modal_route_chosen';
import ModalSiteChosen from '../Modal/Modal_site_chosen';
import { DragDropContext } from 'react-beautiful-dnd';
import stopIcon from '../../Pictures/stopIcon.svg';
import '../Modal/Modal.css';
import './style.css';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { useNotification } from "../Notification/NotificationProvider";
import ButtonToRunScript from '../csvtojson/csvtojson';
import CsvtojsonRouteAdd from '../csvtojson/csvtojsonRouteAdd';
import CsvtojsonAddFullRoute from "../csvtojson/csvtojsonaddfullroute";
import DescriptionIcon from '@mui/icons-material/Description';

let tasksOfRoutes = {};
// let allRoutes = [];
let allPlaces = [];
// let places = [];
// let myRoutes = [];
let Places_and_their_stations = [];
let thisIdTask = 0;
// let filteredData = [];
// let filteredDataRoutes = [];
let inputText = '';
let inputTextRouts = '';
let mySite = { name: '', id: '', nameInEnglish: '' };
// let flagButtonRoute = false;
// let tasksOfRoutes = [];
let clickAddRoute = false;
let myCategory = false;
let flagTest = false;

//-----------------------
const Places = (props) => {
  const { showNotification } = useNotification();
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [tempSelectedSite, setTempSelectedSite] = useState(null);
  const [allWorkersForSite, setAllWorkersForSite] = useState([]);
  const [done, setDone] = useState(false);
  const [Loading, setLoading] = useState(true);
  const [, setStateStation] = useState([]);
  const [stationArray, setStationArray] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIconsOpen, setModalIconsOpen] = useState(false);
  const [myRouteClick, setMyRouteClick] = useState(0);
  const [, setClickAddRoute] = useState(false);
  const [, setFlagStudent] = useState(false);
  const [, setThisIdTask] = useState(0);
  const [onlyAllStation, setOnlyAllStation] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [myRoutes, setRoutes] = useState([]);
  const [filteredDataRoutes, setFilteredDataRoutes] = useState([]);
  const [, setInputText] = useState('');
  const [, setInputTextRouts] = useState('');
  const [, setFlagTest] = useState(false);
  const [siteSelected, setSiteSelected] = useState(false);
  const [newTitleForRoute, setNewTitleForRoute] = useState({});
  const [flagRoute, setRouteFlags] = useState(false);
  const [openModalRouteChosen, setOpenModalRouteChosen] = useState(false);
  const [openModalSiteChosen, setOpenModalSiteChosen] = useState(false);
  const [replaceSite, setReplaceSite] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allTasksOfTheSite, setAllTasksOfTheSite] = useState([]);
  const [firstStationName, setFirstStationName] = useState('');
  const [boardArrayDND, setBoardArrayDND] = useState([]);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [replaceRoute, setReplaceRoute] = useState([]);
  const [replaceRouteFlag, setReplaceRouteFlag] = useState(false);
  const [replaceSiteFlag, setReplaceSiteFlag] = useState(false);
  const [progressBarFlag, setProgressBarFlag] = useState(false);
  const [percentProgressBar, setPercentProgressBar] = useState(5);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [openRemove, setOpenRemove] = React.useState(false);
  const [newRoute, setNewRoute] = useState([]);
  const [routeName, setRouteName] = useState([]);
  const [routeUUID, setRouteUUID] = useState([]);
  const [routrForDelete, setRouteForDelete] = useState([]);
  const [tasksOfChosenStation, setTasksOfChosenStation] = useState([]);
  const [chosenStation, setChosenStation] = useState([]);
  const [dropToBoard, setDropToBoard] = useState({});
  const [tasksLength, setTasksLength] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [openUpload, setOpenUpload] = React.useState(false);
  const [openUploadsheets, setOpenUploadsheets] = React.useState(false);
  const [uploadOption, setUploadOption] = useState(null);

  useEffect(() => {
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setModalOpen(true);
      setRouteName(filteredDataRoutes[openThreeDotsVertical].name);
      setRouteUUID(filteredDataRoutes[openThreeDotsVertical].id);
    } else if (requestForEditing == 'duplication') {
      console.log(filteredDataRoutes[openThreeDotsVertical]);
      let newRoute = filteredDataRoutes[openThreeDotsVertical];

      let today = new Date();

      let taskIdList = [];
      filteredDataRoutes[openThreeDotsVertical].tasks.map((task) => taskIdList.push(task.taskId));

      let studentIdList = [];
      filteredDataRoutes[openThreeDotsVertical].students.map((student) => studentIdList.push(student.id));

      let newRouteObj = {
        // ...newRoute,
        name: newRoute.name + "-" + (Math.floor((Math.random() * 100000))) + "-" + today.toLocaleDateString("en-US"),
        studentIds: studentIdList,
        taskIds: taskIdList,
        siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
      };

      // delete newRouteObj.students;
      // delete newRouteObj.tasks;
      // delete newRouteObj.sites;

      // console.log(newRouteObj);
      try {
        insertRoute(newRouteObj).then(async (newaddedroute) => {
          // alert(props.language ? 'ההוראה הועתקה בהצלחה!' : 'The instruction was copied successfully!');
          showNotification("success", props.language ? "ההוראה הועתקה בהצלחה!" : "The instruction was copied successfully!");
          setOpenThreeDotsVertical(-1);
          setRequestForEditing('');
          let newadded = await getingData_Routes().then(data => {
            return data.find(route => route.id === newaddedroute.id);
          })
          console.log(newadded);

          const newRoutes = [...filteredDataRoutes];
          newRoutes.push(newadded);
          setFilteredDataRoutes(newRoutes);
        })
      } catch (error) {
        console.log(error);
        showNotification("error", props.language ? "ההוראה לא הועתקה!" : "The instruction was not copied!");
      }


    } else if (requestForEditing === 'delete') {
      setOpenRemove(true);
      setRouteForDelete(openThreeDotsVertical);
    } else if (requestForEditing === 'uploadfromsheet') {
      setOpenUpload(true);
    }
  }, [requestForEditing]);

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };
  const handleCloseopenUpload = () => {
    setOpenUpload(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  const handleCloseopenUploadsheets = () => {
    setOpenUploadsheets(false);
    setUploadOption(null);
  };

  const handleCloseRemoveConfirm = async () => {
    try {
      let deleteRoutes = await deleteRoute(filteredDataRoutes[routrForDelete].id);

      if (deleteRoutes.status === 200) {
        // alert(props.language ? 'המחיקה בוצעה בהצלחה!' : 'The deletion was successful!');
        showNotification('success', props.language ? 'המחיקה בוצעה בהצלחה!' : 'The deletion was successful!');
        const newRoutes = [...filteredDataRoutes];
        newRoutes.splice(routrForDelete, 1); // remove one element at index x
        setFilteredDataRoutes(newRoutes);
      }

      setOpenRemove(false);
      setOpenThreeDotsVertical(-1);
      setRouteForDelete(-1);
      setRequestForEditing('');
    } catch (error) {
      console.error(error);
      showNotification('error', props.language ? 'המחיקה נכשלה!' : 'Deletion failed!');
    }
  };
  const [pastelColors, setPastelColors] = useState([
    '#91D3A8', //
    '#F2B965', //
    '#F07F85', //
    '#9EA8EF', //
    '#DEBCF0', //
    '#F49AC2', //(pale pink)
    '#77DD77', //(pastel green)
    '#FFB347', //(pastel orange)
    '#B39EB5', //(lavender)
    '#FF6961', //(salmon)
    '#CB99C9', //(pastel purple)
    '#87CEFA', //(light blue)
    '#FDFD96', //(pastel yellow)
    '#F5A9A9', //(light coral)
    '#ADD8E6', //(light cyan)
    '#D9B611', //(pastel gold)
    '#A8D8EA', //(light sky blue)
    '#F4C2C2', //(light salmon)
    '#93A8A8', //(light gray-green)
    '#E8E3E3', //(light gray)

    '#F5A9E1', //(light pink)
    '#F5D0A9', //(light tan)
    '#F5A9BB', //
    '#A9F5A9', //(pastel green)
    '#F5A9F2', //(light lavender pink)
    '#F5E6CB', //(light yellow)
    '#F5D7CB', //(light apricot)
    '#F5CBDC', //(light lavender)
    '#C9F5CB', //(light green)
    '#CBF5E6', //(light blue-green)
    '#CBE6F5', //(light periwinkle)
    '#CBD7F5', //(light blue)
    '#C9CBF5', //(light purple)
    '#E6CBF5', //(light magenta)
  ]);

  let inputHandlerRoutes = (e) => {
    //convert input text to lower case
    setInputTextRouts((inputTextRouts = e.target.value.toLowerCase()));
    searchRoute();
  };
  const fetchALLData = async () => {
    try {
      setLoading(true);
      setAllTasks(await getingData_Tasks()); //get request for tasks
      setAllRoutes(await getingData_Routes()); //get request for routes
      setOnlyAllStation(await getingDataStation()); //get request for station
      setAllUsers(await getingData_Users()); //get request for Users
    } catch (error) {
      console.error(error.message);
    }
    finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchALLData();
  }, []);

  useEffect(() => {
    let user;
    if (allUsers !== undefined) {
      user = allUsers.find(
        (user) =>
          user.name.toLowerCase() === sessionStorage.userName.toLowerCase()
      );
    }
  }, [allUsers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // setLogged_in(sessionStorage.getItem('logged_in'));
        await getData();
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchData();
  }, []);

  const getData = async () => {
    try {

      if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
        allPlaces = await getingData_Places(); //get request for places
      } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "EDITOR") {
        const Editors = await getingData_Editors()
        const uniqueSiteIds = new Set();
        const uniqueSites = [];

        Editors.forEach(Editor => {
          console.log(Editor.id === JSON.parse(sessionStorage.getItem('jwt')).id);
          if (Editor.id === JSON.parse(sessionStorage.getItem('jwt')).id) {
            Editor.sites.forEach(site => {
              console.log("site", site);
              if (!uniqueSiteIds.has(site.id)) {
                console.log("site.id", site.id);
                uniqueSiteIds.add(site.id);
                uniqueSites.push(site);
              }
            });
          }
        });


        console.log(uniqueSiteIds);
        console.log(uniqueSites);
        allPlaces = uniqueSites

        // const routes = await getingData_Routes()
        // console.log(JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id);
        // const filterroutesbycoachId = routes.filter(route =>
        //   route.students.some(student => student.coachId === JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id)
        // );

        // console.log(filterroutesbycoachId);
        // const uniqueSiteIds = new Set();
        // const uniqueSites = [];

        // filterroutesbycoachId.forEach(route => {
        //   route.sites.forEach(site => {
        //     if (!uniqueSiteIds.has(site.id)) {
        //       uniqueSiteIds.add(site.id);
        //       uniqueSites.push(site);
        //     }
        //   });
        // });

        // console.log(uniqueSiteIds);
        // console.log(uniqueSites);
        // allPlaces = uniqueSites

      } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "STUDENT") {

        const Editors = await getingData_Editors()
        const uniqueSiteIds = new Set();
        const uniqueSites = [];

        Editors.forEach(Editor => {
          console.log(Editor.id === JSON.parse(sessionStorage.getItem('jwt')).id);
          if (Editor.id === JSON.parse(sessionStorage.getItem('jwt')).id) {
            Editor.sites.forEach(site => {
              console.log("site", site);
              if (!uniqueSiteIds.has(site.id)) {
                console.log("site.id", site.id);
                uniqueSiteIds.add(site.id);
                uniqueSites.push(site);
              }
            });
          }
        });


        console.log(uniqueSiteIds);
        console.log(uniqueSites);
        allPlaces = uniqueSites

        // const routes = await getingData_Routes()
        // const filterroutesbycoachId = routes.filter(route =>
        //   route.students.some(student => student.id === JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id)
        // );

        // console.log(filterroutesbycoachId);
        // const uniqueSiteIds = new Set();
        // const uniqueSites = [];

        // filterroutesbycoachId.forEach(route => {
        //   route.sites.forEach(site => {
        //     if (!uniqueSiteIds.has(site.id)) {
        //       uniqueSiteIds.add(site.id);
        //       uniqueSites.push(site);
        //     }
        //   });
        // });

        // console.log(uniqueSiteIds);
        // console.log(uniqueSites);
        // allPlaces = uniqueSites
      }
      // allPlaces = await getingData_Places(); //get request for places
    } catch (error) {
      console.error(error.message);
    }

    // setPlaces(allPlaces); //(places = allPlaces.filter((item) => item.parent === 0))); //parent === 0 means site and not station

    // setOnlyAllStation(
    //   (onlyAllStation = allPlaces.filter((item) => item.parent > 0)) //parent > 0 means station
    // );

    Places_and_their_stations = allPlaces.map((element) => {
      return {
        parent: element,
        related: allPlaces.filter((r) => r.parent === element.id),
      };
    });

    setDone(true);
  };

  useEffect(() => {
    if (flagRoute && replaceRouteFlag) {
      setRouteFlags(false);
      setReplaceRouteFlag(false);
      setOpenModalRouteChosen(false);
      localStorage.setItem('changetasksRoutes', false);
    }
  }, [flagRoute, openModalSiteChosen, replaceRouteFlag]);

  useEffect(() => {
    if (!replaceRouteFlag && Object.keys(replaceRoute).length > 0) {
      DisplayTasks(replaceRoute);
    }
  }, [replaceRouteFlag]);

  const DisplayTasks = (e) => {
    // Check if another route is already selected
    if (!flagRoute) {
      setProgressBarFlag(true);
      setPercentProgressBar(6);
      setRouteFlags(true);

      tasksOfRoutes = e;

      tasksOfRoutes.name = tasksOfRoutes.name
        .replace('&#8211;', '-')
        .replace('&#8217;', "'"); //replace gebrish for - or '

      let firstStation;

      if (tasksOfRoutes.tasks && tasksOfRoutes.tasks.length > 0) {
        firstStation = allTasks.find((obj) => {
          return obj.id === tasksOfRoutes.tasks[0].taskId;
        });
      } else {
        setProgressBarFlag(false);
      }

      let theStation;
      let stationName;
      if (firstStation !== undefined) {
        firstStation.stations.forEach((station) => {
          if (station.parentSiteId === mySite.id) {
            theStation = station;
            stationName = station.title;
          }
        });
        setFirstStationName(stationName);

        //
      } else setFirstStationName(undefined);

      let prevStation = '';

      let percentTemp = 50 / tasksOfRoutes?.tasks?.length;
      // console.log('tasksOfRoutes', tasksOfRoutes);
      setBoardArrayDND(
        tasksOfRoutes?.tasks?.map((element) => {
          setPercentProgressBar(
            (percentProgressBar) => percentProgressBar + percentTemp
          );
          //allTasksOfTheSite
          let taskTemp = allTasksOfTheSite?.find(
            (item) => item.id === element.taskId
          );

          //allTasksOfTheSite - allTasksOfTheSite
          // let taskTemp = allTasks?.find((item) => item.id === element.taskId);
          // console.log('e',e);
          // console.log('firstStation',firstStation);
          // console.log('allTasksOfTheSite',allTasksOfTheSite);
          // console.log('taskTemp',taskTemp);
          if (taskTemp === undefined) {
            return {
              id: element.taskId,
              title:
                element.taskId +
                ' לא משוייך'.replace('&#8211;', '-').replace('&#8217;', "' "),
              mySite: mySite,
              myStation: 'לא משוייך',
              data: stationArray,
              nameStation: 'לא משוייך',
              width: '-13px',
              borderLeft: '2px solid #c2bfbf',
              height: '70px',
              kavTaskTopMarginTop: '-7px',
              bottom: '-27px',
              kavTopWidth: '25px',
              newkavTaskTop: '100px',
              dataImg: '',
              color: 'black',
            };
          }

          let color;
          let stationID = taskTemp.stations.find(
            (station) => {
              if (station.parentSiteId === mySite.id) return true;
            }
            // isStationOfMySite(item).includes(true)
          );

          if (stationID !== undefined) {
            stationName = stationID.title;
            theStation = stationID;
            color = stationArray.find((item) => item.id === stationID.id).color;
          } else {
            // stationName = "כללי";
            // color = stationArray.find((item) => item.id === 0).color;
          }

          // let color = stationArray.find(item => item.id === stationID).color
          let width = '-13px';
          let height = '70px';
          let nameStation = '14px';
          let bottom = '-27px';
          let kavTopWidth = '25px';
          let newkavTaskTop = '100px';
          let kavTaskTopMarginTop = '-7px';
          let borderLeft = '2px solid #c2bfbf';

          if (prevStation === stationName) {
            // sameStation
            width = '-84px';
            borderLeft = '2x solid #c2bfbf';
            height = '86px';
            bottom = '45px';
            kavTopWidth = '0px';
            newkavTaskTop = '100px';
            nameStation = '';
            kavTaskTopMarginTop = '-27px';
          } else {
            borderLeft = '0x solid #c2bfbf';
            width = '-13px';
            height = '70px';
            bottom = '-27px';
            kavTopWidth = '25px';
            newkavTaskTop = '0px';
            nameStation = stationName;
            kavTaskTopMarginTop = '-7px';
          }

          prevStation = stationName;

          return {
            id: taskTemp.id,
            title: taskTemp.title
              .replace('&#8211;', '-')
              .replace('&#8217;', "' "),
            subtitle: taskTemp.subtitle,
            audio_url: taskTemp.audio_url,
            picture_url: taskTemp.picture_url,
            estimatedTimeSeconds: taskTemp.estimatedTimeSeconds,
            myStation: stationName,
            data: stationArray,
            mySite,
            theStation,
            nameStation,
            width,
            borderLeft,
            height,
            kavTaskTopMarginTop,
            bottom,
            kavTopWidth,
            newkavTaskTop,
            color,
          };
        })
      );
      // let TasksOfChosenStationtemp = onlyAllStation.find((station) => station?.id === theStation?.id)?.tasks ? onlyAllStation.find((station) => station.id === theStation.id).tasks : []
      // setTasksOfChosenStation(TasksOfChosenStationtemp);
    } else {
      setReplaceRoute(e);
      setOpenModalRouteChosen(true);
    }
  };

  const isStationOfMySite = (stationId) => {
    return stationArray.map((item) => {
      if (item.id === stationId) {
        return true;
      } else {
        return false;
      }
    });
  };

  const handleSiteReplacement = useCallback(() => {
    setSelectedSite(tempSelectedSite);
    setReplaceSiteFlag(true);
    setOpenModalSiteChosen(false);
  }, [tempSelectedSite]);

  const closeSiteSelectionModal = useCallback(() => {
    setOpenModalSiteChosen(false);
    setTempSelectedSite(null);
  }, []);

  useEffect(() => {
    // debugger;
    if (selectedSite && Object.keys(selectedSite).length > 0) {
      console.log('selectedSite: ', selectedSite);

      // Filter routes containing the selected site
      const workers = allRoutes
        .filter((route) => route.sites.some((site) => site.id === selectedSite.id))
        .flatMap((route) => route.students); // Collect and flatten students

      console.log('workers: ', workers);

      // Optionally remove duplicates if necessary
      const uniqueWorkers = Array.from(
        new Set(workers.map((worker) => worker.id)) // Use IDs for uniqueness
      ).map((id) => workers.find((worker) => worker.id === id)); // Re-map to full objects

      console.log('uniqueWorkers: ', uniqueWorkers);

      setAllWorkersForSite(uniqueWorkers); // Update state with unique workers
    }
  }, [allRoutes, selectedSite]);

  const handleSiteSelectChange = useCallback(
    (event) => {
      const selectedSiteValue = JSON.parse(event.target.value);
      setTempSelectedSite(selectedSiteValue);

      if (!siteSelected && !replaceSiteFlag) {
        tasksOfRoutes = {};
        setTasksOfChosenStation([]);
        setReplaceSite(selectedSiteValue);
        Display_The_Stations(selectedSiteValue);
        setSiteSelected(true);
        setReplaceSiteFlag(true);
        setOpenModalSiteChosen(false);
        setSelectedSite(selectedSiteValue);
      } else {
        setReplaceSiteFlag(false);
        setOpenModalSiteChosen(true);
        setRouteFlags(false);
      }
    },
    [allRoutes, siteSelected, replaceSiteFlag]
  );

  const handleWorkerSelectChange = (event) => {
    const answer = window.confirm(props.language !== "English" ? "האם ברצונך לבצע פעולה זו?" : "Are you sure you want to do this?");

    const selectedWorkerValue = allWorkersForSite[event.target.selectedIndex - 1];

    if (answer === true) {
      setAllTasksOfTheSite([]);
      setTasksOfChosenStation([]);
      setTasksLength(0);
      // setRouteFlags(false);
      // setReplaceSiteFlag(false);

      console.log('selectedWorkerValue: ', selectedWorkerValue);
      console.log('allTasksOfTheSite: ', allTasksOfTheSite);
      console.log('selectedSite stations : ', selectedSite.stations);

      if (selectedWorkerValue === undefined) {
        Display_The_Stations(selectedSite.stations);
        setSelectedWorker(null);
      }


      if (event.target.value === 'כללי' || selectedWorkerValue === undefined) {
        Display_The_Stations(selectedSite);
        setSelectedWorker(null);
      } else {
        displayRoutesFromSelectedWorker(selectedWorkerValue);
        setSelectedWorker(selectedWorkerValue);
      }
    }
  };

  useEffect(() => {
    if (!openModalSiteChosen && replaceSiteFlag) {
      setReplaceSite(selectedSite);
      Display_The_Stations(selectedSite);
      setTasksLength(0);
      setTasksOfChosenStation([]);
      setSelectedSite(tempSelectedSite);
      setSelectedWorker(null);
      // setOpenModalRouteChosen(true);
      // setReplaceRouteFlag(true);
    }
  }, [openModalSiteChosen, replaceSiteFlag, selectedSite, tempSelectedSite]);

  const Display_The_Stations = async (selectedValue) => {
    const newallRoutes = await getingData_Routes();
    const onlyAllStation = await getingDataStation();
    
    setThisIdTask((thisIdTask = selectedValue.id));

    if (stationArray.length > 0) setStationArray([]);

    mySite.name = selectedValue.name;
    mySite.id = selectedValue.id;
    mySite.nameInEnglish = selectedValue.nameInEnglish;

    const tasksOfTheSite = allTasks.filter((task) =>
      task.sites.find((site) => site.id === mySite.id)
    );

    setTasksLength(tasksOfTheSite.length);
    setAllTasksOfTheSite((prev) => [...prev, ...tasksOfTheSite]);

    localStorage.setItem('MySite', JSON.stringify(mySite));

    setStationArray(
      onlyAllStation
        .filter((item) => item.parentSiteId === selectedValue.id)
        .map((item, index) => ({
          ...item,
          color: pastelColors[index % pastelColors.length],
        }))
    );
    //myRoutes saves only the routes that belong to the site that choosen
    if (myRoutes.length > 0) setRoutes([]);
    setRoutes(
      newallRoutes.filter((route) =>
        route.sites.some((site) => site.id === mySite.id)
      )
    );
  };

  const displayRoutesFromSelectedWorker = async (selectedWorker) => {
    // Step 1: Filter routes containing the selected worker
    const routes = allRoutes.filter((route) =>
      route.students.some((student) => student.id === selectedWorker.id && route.sites.some((site) => site.id === selectedSite.id))
    );

    // Step 2: Find the first matched site (handle undefined cases)
    const matchedSite = routes
      .flatMap((route) => route.sites) // Flatten all sites in the routes
      .find((site) => site?.id === selectedSite?.id);

    if (!matchedSite) {
      showNotification("warning", props.language ? 'לא נמצאו מקומות שונים!' : 'No different sites found!');
      console.warn("No matched site found.");
      return;
    }

    // Step 3: Filter stations under the matched site
    const stationsArray = onlyAllStation.filter(
      (station) => station.parentSiteId === matchedSite.id
    );

    // Step 4: Filter tasks assigned to the worker
    const tasksOfTheWorker = allTasks.filter((task) =>
      routes.some((route) =>
        route.tasks.some((routeTask) => routeTask.taskId === task.id)
      )
    );

    // Step 5: Match stations to worker tasks
    const matchedStations = stationsArray.filter((station) =>
      tasksOfTheWorker.some((task) =>
        task.stations.some((taskStation) => taskStation.id === station.id)
      )
    );

    // Step 6: Prepare station data with tasks and colors
    const stationsWithDetails = matchedStations.map((station, index) => ({
      ...station,
      tasks: station.tasks.filter((task) =>
        tasksOfTheWorker.some((t) => task.id === t.id)
      ),
      color: pastelColors[index % pastelColors.length] || "#CCCCCC", // Fallback color
    }));

    // Step 7: Update state
    setTasksLength(tasksOfTheWorker.length);
    setAllTasksOfTheSite(tasksOfTheWorker);
    setStationArray(stationsWithDetails);

    if (myRoutes.length > 0) setRoutes([]); // Clear `myRoutes` if not empty
    setRoutes(routes); // Update routes
    console.log('routes', routes);

  };

  const displayStationsFromSelectedRoute = async (selectedRoute) => {
    setAllTasksOfTheSite([]);
    setTasksOfChosenStation([]);
    setTasksLength(0);

    // Step 1: Filter stations under the selected route
    const stationsArray = onlyAllStation?.filter(
      (station) => station.parentSiteId === selectedRoute.sites[0].id
    );

    // Step 2: Filter tasks assigned to the selected route
    const tasksOfTheRoute = allTasks.filter((task) =>
      selectedRoute.tasks.some((routeTask) => routeTask.taskId === task.id)
    );

    // Step 3: Match stations to route tasks
    const matchedStations = stationsArray.filter((station) =>
      tasksOfTheRoute.some((task) =>
        task.stations.some((taskStation) => taskStation.id === station.id)
      )
    );

    // Step 4: Prepare station data with tasks and colors
    const stationsWithDetails = matchedStations.map((station, index) => ({
      ...station,
      tasks: station.tasks.filter((task) =>
        tasksOfTheRoute.some((t) => task.id === t.id)
      ),
      color: pastelColors[index % pastelColors.length] || "#CCCCCC", // Fallback color
    }));

    // Step 5: Update state
    setTasksLength(tasksOfTheRoute.length);
    setAllTasksOfTheSite(tasksOfTheRoute);
    setStationArray(stationsWithDetails);
  };

  useEffect(() => {
    if (allTasksOfTheSite.length > 0) {
      let tasksWithoutStation = allTasksOfTheSite.filter((task) => {
        if (task.stations.length === 0) return task;
      });
      const generalStation = stationArray.find(
        (zeroStation) => zeroStation.id === 0
      );
      if (generalStation === undefined) {
        setStationArray((prev) => [
          ...prev,
          // {
          //   id: 0,
          //   color: pastelColors[stationArray.length],
          //   parent: mySite.id,
          //   title: 'כללי',
          //   tasks: tasksWithoutStation,
          // },
        ]);
      } else {
        generalStation.tasks = tasksWithoutStation;
      }

      if (tasksLength < allTasksOfTheSite.length) {
        let newTask = allTasksOfTheSite[allTasksOfTheSite.length - 1];
        let indexStation = stationArray.findIndex(
          (station) => station.id === chosenStation.id
        );

        allTasksOfTheSite[allTasksOfTheSite.length - 1].stations.forEach(
          (newTaskStation) => {
            let station = stationArray.find(
              (stationTemp) => stationTemp.id === newTaskStation.id
            );

            if (station && indexStation !== -1) {
              let existingTaskIndex = station.tasks.findIndex(
                (task) => task.id === newTask.id
              );

              if (existingTaskIndex === -1) {
                station.tasks.push({
                  id: newTask.id,
                  title: newTask.title,
                  subtitle: newTask.subtitle,
                  estimatedTimeSeconds: newTask.estimatedTimeSeconds,
                  picture_url: newTask.picture_url,
                  audio_url: newTask.audio_url,
                  multi_language_description:
                    newTask.multi_language_description,
                });
              } else {
                station.tasks[existingTaskIndex] = {
                  id: newTask.id,
                  title: newTask.title,
                  subtitle: newTask.subtitle,
                  estimatedTimeSeconds: newTask.estimatedTimeSeconds,
                  picture_url: newTask.picture_url,
                  audio_url: newTask.audio_url,
                  multi_language_description:
                    newTask.multi_language_description,
                };
              }
              stationArray[indexStation].tasks = station.tasks;
            }
          }
        );
      }
    }
  }, [allTasksOfTheSite]);

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  useEffect(() => {
    //after adding new routes
    let route = filteredDataRoutes.find((route) => route.id === newRoute.id);
    if (Object.keys(newRoute)?.length > 0) {
      // filteredDataRoutes.push(newRoute);
      if (route !== undefined) {
        route.name = newRoute.name;
      } else {
        setFilteredDataRoutes((temp) => [...temp, newRoute]);
        let uuidRoute = newRoute.id;

        setTimeout(() => {
          try {
            updateRoute(uuidRoute, { siteIds: mySite.id });
            showNotification("success", props.language === "English" ? "Route Updated Successfully" : "המסלול עודכן בהצלחה");
          } catch (error) {
            console.error(error);
            showNotification("error", props.language === "English" ? "Error Updating Route" : "שגיאה בעדכון המסלול");
          }
        }, 60000);
      }
      setNewRoute([]);
    }
  }, [newRoute]);

  // handle search word in "searce route"
  const searchRoute = () => {
    setFilteredDataRoutes(
      myRoutes.filter((el) => {
        if (inputTextRouts === '') {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.name.toLowerCase().includes(inputTextRouts);
        }
      })
    );
  };
  const [taskcolor, settaskcolor] = useState('');
  const handleColor = (color) => {
    settaskcolor(color);
  };

  useEffect(() => {
    searchRoute();
  }, [myRoutes]);

  // const DisplayTasksfordragStation = (stationId) => {
  //   const station = stationArray.find((station) => station.id === stationId);

  //   station.title = station.title
  //       .replace('&#8211;', '-')
  //       .replace('&#8217;', "'"); //replace gebrish for - or '

  //     let firstStation;

  //     if (station.tasks && station.tasks.length > 0) {
  //       firstStation = allTasks.find((obj) => {
  //         return obj.id === station.tasks[0].id;
  //       });
  //     }

  //     let theStation;
  //     let stationName;
  //     if (firstStation !== undefined) {
  //       firstStation.stations.forEach((station) => {
  //         if (station.parentSiteId === mySite.id) {
  //           theStation = station;
  //           stationName = station.title;
  //         }
  //       });
  //       setFirstStationName(stationName);

  //       //
  //     } else setFirstStationName(undefined);

  //     let prevStation = '';
  //     setBoardArrayDND(
  //       station?.tasks?.map((element) => {

  //         //allTasksOfTheSite
  //         let taskTemp = allTasksOfTheSite?.find(
  //           (item) => item.id === element.taskId
  //         );

  //         //allTasksOfTheSite - allTasksOfTheSite
  //         // let taskTemp = allTasks?.find((item) => item.id === element.taskId);
  //         // console.log('e',e);
  //         // console.log('firstStation',firstStation);
  //         // console.log('allTasksOfTheSite',allTasksOfTheSite);
  //         // console.log('taskTemp',taskTemp);
  //         if (taskTemp === undefined) {
  //           return {
  //             id: element.taskId,
  //             title:
  //               element.taskId +
  //               ' לא משוייך'.replace('&#8211;', '-').replace('&#8217;', "' "),
  //             mySite: mySite,
  //             myStation: 'לא משוייך',
  //             data: stationArray,
  //             nameStation: 'לא משוייך',
  //             width: '-13px',
  //             borderLeft: '2px solid #c2bfbf',
  //             height: '70px',
  //             kavTaskTopMarginTop: '-7px',
  //             bottom: '-27px',
  //             kavTopWidth: '25px',
  //             newkavTaskTop: '100px',
  //             dataImg: '',
  //             color: 'black',
  //           };
  //         }

  //         let color;
  //         let stationID = taskTemp.stations.find(
  //           (station) => {
  //             if (station.parentSiteId === mySite.id) return true;
  //           }
  //           // isStationOfMySite(item).includes(true)
  //         );

  //         if (stationID !== undefined) {
  //           stationName = stationID.title;
  //           theStation = stationID;
  //           color = stationArray.find((item) => item.id === stationID.id).color;
  //         } else {
  //           // stationName = "כללי";
  //           // color = stationArray.find((item) => item.id === 0).color;
  //         }

  //         // let color = stationArray.find(item => item.id === stationID).color
  //         let width = '-13px';
  //         let height = '70px';
  //         let nameStation = '14px';
  //         let bottom = '-27px';
  //         let kavTopWidth = '25px';
  //         let newkavTaskTop = '100px';
  //         let kavTaskTopMarginTop = '-7px';
  //         let borderLeft = '2px solid #c2bfbf';

  //         if (prevStation === stationName) {
  //           // sameStation
  //           width = '-84px';
  //           borderLeft = '2x solid #c2bfbf';
  //           height = '86px';
  //           bottom = '45px';
  //           kavTopWidth = '0px';
  //           newkavTaskTop = '100px';
  //           nameStation = '';
  //           kavTaskTopMarginTop = '-27px';
  //         } else {
  //           borderLeft = '0x solid #c2bfbf';
  //           width = '-13px';
  //           height = '70px';
  //           bottom = '-27px';
  //           kavTopWidth = '25px';
  //           newkavTaskTop = '0px';
  //           nameStation = stationName;
  //           kavTaskTopMarginTop = '-7px';
  //         }

  //         prevStation = stationName;

  //         return {
  //           id: taskTemp.id,
  //           title: taskTemp.title
  //             .replace('&#8211;', '-')
  //             .replace('&#8217;', "' "),
  //           subtitle: taskTemp.subtitle,
  //           audio_url: taskTemp.audio_url,
  //           picture_url: taskTemp.picture_url,
  //           estimatedTimeSeconds: taskTemp.estimatedTimeSeconds,
  //           myStation: stationName,
  //           data: stationArray,
  //           mySite,
  //           theStation,
  //           nameStation,
  //           width,
  //           borderLeft,
  //           height,
  //           kavTaskTopMarginTop,
  //           bottom,
  //           kavTopWidth,
  //           newkavTaskTop,
  //           color,
  //         };
  //       })
  //     );
  //     // let TasksOfChosenStationtemp = onlyAllStation.find((station) => station?.id === theStation?.id)?.tasks ? onlyAllStation.find((station) => station.id === theStation.id).tasks : []
  //     // setTasksOfChosenStation(TasksOfChosenStationtemp);

  // };

  function handleDragEnd(result) {
    if (result.source.droppableId == "tasks-droppable") {
      setDropToBoard(result);
    }

    if (result.source.droppableId == "stationArray") {
      setDropToBoard(result);
      const stationId = result.draggableId;
      const station = stationArray.find((station) => station.id === stationId);
      setTasksOfChosenStation(station.tasks);
      // DisplayTasksfordragStation(result.draggableId);
    }
  }

  const handleDeselectRoute = () => {
    setAllTasksOfTheSite([]);
    setTasksOfChosenStation([]);
    setTasksLength(0);
    setSelectedWorker(null);
    Display_The_Stations(selectedSite);
  };

  const handleSelectOption = (option) => {
    setUploadOption(option);
  };
  //----------------------------------------------------------------------
  return (
    <>
      <div>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={Loading}
        >
          <CircularProgress size="10rem" color="info" />
        </Backdrop>
      </div>

      <div
        className={`Places ${props.language !== 'English' ? 'english' : ''}`}
      >
        <div>
          <div className='placesTitle'>{props.siteQuestionLanguage}</div>
          <select
            className='selectPlace'
            onChange={handleSiteSelectChange}
            value={selectedSite ? JSON.stringify(selectedSite) : 'DEFAULT'}
          >
            <option value='DEFAULT' disabled>
              {props.siteLanguage}
            </option>

            {allPlaces.map((place, index) => {
              return (
                <option key={index} value={JSON.stringify(place)}>
                  {place.name}
                </option>
              );
            })}
          </select>
        </div>
        <div
          style={{ margin: '20px' }}
          className={
            siteSelected === true && allWorkersForSite.length > 0
              ? ''
              : 'disabledWorker'
          }
        >
          <div className='placesTitle'>
            {props.language !== 'english'
              ? props.SiteStudentQuestionLanguage
              : props.SiteStudentQuestionLanguage}
          </div>
          <select
            className='selectPlace'
            onChange={handleWorkerSelectChange}
            value={selectedWorker ? selectedWorker.name : 'DEFAULT'}
          >
            <option defaultValue='DEFAULT'>{props.workerLanguage}</option>
            {allWorkersForSite.map((user, index) => (
              <option key={index} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{ margin: '20px' }}
          className={siteSelected === true ? '' : 'disabledWorker'}
        >
          <div className='placesTitle'>
            <DescriptionIcon />
            {props.language !== 'English' ? "Upload sheet" : " העלה גיליון"}
          </div>
          <button className="deselect-button" style={{ backgroundColor: "green" }} onClick={() => setOpenUploadsheets(true)}>
            {props.language !== 'English' ? "upload sheet" : " העלה גיליון"}
          </button>
        </div>
      </div>
      <div
        className={`mainRectangles ${props.language !== 'English' ? 'english' : ''
          }`}
      >
        {/* routes */}

        {/* modal for adding new route */}
        {modalOpen && (
          <Modal
            routeName={routeName}
            requestForEditing={requestForEditing}
            setNewTitleForRoute={setNewTitleForRoute}
            setNewRoute={setNewRoute}
            setOpenModal={setModalOpen}
            setFlagStudent={setFlagStudent}
            flagTest={flagTest}
            siteSelected={siteSelected}
            language={props.language}
            routeUUID={routeUUID}
          />
        )}
        <div className='Cover_Places'>
          <>
            <div className='TitlePlacesCover'>
              <div className='TitlePlaces'>
                <div
                  className={`MyTitle text ${props.language !== 'English' ? 'english' : ''
                    }`}
                >
                  {props.language === 'English' ? 'מסלולים' : 'Routes'}
                </div>
              </div>
            </div>
          </>

          <div
            className='search'
            style={{
              backgroundColor: '#F5F5F5',
              // borderStyle: "none none solid none",
              // borderColor: "#fff",
              // borderWidth: "5px",
            }}
          >
            <input
              className={`searchButton ${props.language !== 'English' ? 'english' : ''}`}
              dir='rtl'
              placeholder={
                props.language === 'English' ? 'חפש מסלול' : 'search route'
              }
              label={
                <CgSearch
                  style={{ fontSize: 'x-large', textAlign: '-webkit-center' }}
                />
              }
              onChange={inputHandlerRoutes}
            ></input>
          </div>
          <div
            className='search'
            style={{
              backgroundColor: '#F5F5F5',
              // borderStyle: "none none solid none",
              // borderColor: "#fff",
              // borderWidth: "5px",
            }}
          >
            <button
              className="deselect-button"
              onClick={handleDeselectRoute}
            >
              {props.language === "English" ? "הצג את כל התחנות" : "show all Stations"}
            </button>
          </div>
          <div className='routs'>
            {filteredDataRoutes.length === 0 ? (
              <div
                className={`textBeforeStation ${props.language !== 'English' ? 'english' : ''}`}
                style={{ backgroundImage: `url(${textArea})` }}
              >
                <div
                  className={`textBeforeStationtext ${props.language !== 'English' ? 'english' : ''}`}>
                  {props.routesBeforeChoosingSite}
                </div>
              </div>

            ) : (
              filteredDataRoutes.filter((route) => route.id).map((route, index) => {
                return (
                  <div
                    className='buttons'
                    style={{
                      border:
                        route.id === tasksOfRoutes.id
                          ? '1px solid #256fa1'
                          : '',
                      flexDirection:
                        props.language === 'English' ? 'row' : 'row-reverse',
                      textAlignLast:
                        props.language === 'English' ? 'end' : 'left',
                    }}
                    key={index}
                  >
                    <div className='dropdownThreeDots'>
                      <button
                        className='threeDotsVerticalEng'
                        onClick={() => {
                          clickOnhreeDotsVerticaIcont(index)
                          setSelectedRoute(route);
                        }}
                      >
                        <BsThreeDotsVertical />
                      </button>

                      {openThreeDotsVertical === index ? (
                        // <div ref={menuRef}>
                        <ModalDropdown
                          language={props.language}
                          setRequestForEditing={setRequestForEditing}
                          setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                          editable={true}
                          Reproducible={true}
                          details={true}
                          erasable={true}
                          uploadfromsheet={true}
                        />
                      ) : (
                        // </div>
                        <></>
                      )}
                    </div>

                    <button
                      className='nameOfButton'
                      onClick={
                        () => {
                          setSelectedRoute(route);
                          // console.log(selectedRoute === null , selectedRoute.id !== route.id);
                          // console.log(selectedRoute , selectedRoute.id , route.id);

                          if (selectedRoute === null || selectedRoute.id !== route.id) {
                            displayStationsFromSelectedRoute(route);
                            DisplayTasks(route);
                          }
                        } //הצגת המסלול
                      }
                    >
                      {route.name
                        .replace('&#8211;', '-')
                        .replace('&#8217;', "'")}
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className='addPlaceCover'>
            <button
              className='AddButton'
              onClick={() => {
                setModalOpen(true);
                setFlagStudent(true);
                setClickAddRoute((clickAddRoute = true));
              }}
            >
              <AiOutlinePlus className='plus' />
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Stations
            setDropToBoard={setDropToBoard}
            dropToBoard={dropToBoard}
            setAllTasksOfTheSite={setAllTasksOfTheSite}
            percentProgressBar={percentProgressBar}
            setPercentProgressBar={setPercentProgressBar}
            progressBarFlag={progressBarFlag}
            setProgressBarFlag={setProgressBarFlag}
            replaceRouteFlag={replaceRouteFlag}
            replaceSiteFlag={replaceSiteFlag}
            firstStationName={firstStationName}
            boardArrayDND={boardArrayDND}
            stationArray={stationArray}
            setStationArray={setStationArray}
            idTask={thisIdTask}
            allStations={onlyAllStation}
            setOnlyAllStation={setOnlyAllStation}
            language={props.language}
            stationsName={props.stations}
            myTasks={props.myTasks}
            drag={props.drag}
            addStation={props.addStation}
            addMyTask={props.addMyTask}
            titleStationCss={props.titleStationCss}
            titleTaskCss={props.titleTaskCss}
            mySite={mySite}
            flagHebrew={props.flagHebrew}
            tasksOfRoutes={tasksOfRoutes}
            clickAddRoute={clickAddRoute}
            saveButton={props.saveButton}
            siteQuestionLanguage={props.siteQuestionLanguage}
            stationsBeforeChoosingSite={props.stationsBeforeChoosingSite}
            tasksBeforeChoosingSite={props.tasksBeforeChoosingSite}
            allTasks={allTasks}
            allTasksOfTheSite={allTasksOfTheSite}
            pastelColors={pastelColors}
            hebrew={props.hebrew}
            english={props.english}
            Hebrew={props.Hebrew}
            setTasksOfChosenStation={setTasksOfChosenStation}
            tasksOfChosenStation={tasksOfChosenStation}
            setChosenStation={setChosenStation}
            chosenStation={chosenStation}
            settaskcolor={handleColor}
          />
          <Tasks
            allUsers={allUsers}
            boardArrayDND={boardArrayDND}
            setBoardArrayDND={setBoardArrayDND}
            allTasks={allTasks}
            setAllTasks={setAllTasks}
            setDropToBoard={setDropToBoard}
            dropToBoard={dropToBoard}
            allTasksOfTheSite={allTasksOfTheSite}
            setAllTasksOfTheSite={setAllTasksOfTheSite}
            setTasksOfChosenStation={setTasksOfChosenStation}
            tasksOfChosenStation={tasksOfChosenStation}
            myTasks={props.myTasks}
            onlyAllStation={onlyAllStation}
            language={props.language}
            tasksBeforeChoosingSite={props.tasksBeforeChoosingSite}
            chosenStation={chosenStation}
            stationArray={stationArray}
            mySite={mySite}
            color={taskcolor}
          />
        </DragDropContext>
      </div>
      {openModalRouteChosen ? (
        <>
          <ModalRouteChosen
            language={props.language}
            setReplaceRouteFlag={setReplaceRouteFlag}
            setOpenModalRouteChosen={setOpenModalRouteChosen}
          ></ModalRouteChosen>
        </>
      ) : (
        <></>
      )}
      {openModalSiteChosen ? (
        <>
          <ModalSiteChosen
            language={props.language}
            setReplaceSiteFlag={setReplaceSiteFlag}
            setOpenModalSiteChosen={setOpenModalSiteChosen}
          ></ModalSiteChosen>
          <div className='modal_route_chosen'>
            <div className='stopIconContainer'>
              <img src={stopIcon} alt='logo'></img>
            </div>
            <div
              className='body'
              style={{ textAlign: 'center', direction: 'rtl' }}
            >
              <h4>{props.language !== 'English' ? 'Chose another site' : 'בחרת כבר באתר אחר, ברצונך להחליף?'}</h4>
              <div>{props.language !== 'English' ? 'Changing site will delete the changes you made on the current site' : 'החלפת אתר תמחק את השינויים שביצעת באתר הנוכחי'}</div>
            </div>
            <div className='footer' style={{ display: 'flex' }}>
              <button className='cancelBtn' onClick={closeSiteSelectionModal}>
                {props.language !== 'English' ? 'Cancel' : 'ביטול'}
              </button>
              <button className='cancelBtn' onClick={handleSiteReplacement}>
                {props.language !== 'English' ? 'Replace' : 'החלף אתר'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      {/* <div className="colors">
        {pastelColors.map((color) => {
          return (
            <div style={{ background: color, height: "100px", width: "100px" }}>{color}</div>
          )
        }
        )

        }
        
     {/* sure for Remove */}
      <Dialog
        open={openRemove}
        onClose={handleCloseRemove}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'מחיקת מסלול'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {props.language === 'English' ? 'האם אתה בטוח במחיקת המסלול?' : 'Are you sure you want to delete the route?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemove}>{props.language === 'English' ? 'ביטול' : 'Cancel'}</Button>
          <Button onClick={handleCloseRemoveConfirm} autoFocus>
            {props.language === 'English' ? 'מחיקה' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* </div> */}
      <Dialog
        open={openUpload}
        onClose={handleCloseopenUpload}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <CsvtojsonRouteAdd selectedSite={selectedSite} setSelectedRoute={setSelectedRoute} selectedRoute={selectedRoute} language={props.language} handleCloseopenUpload={handleCloseopenUpload} reloadData={fetchALLData} handleDeselectRoute={handleDeselectRoute} setLoading={setLoading} />
      </Dialog>
      {/* </div> */}
      <Dialog
  open={openUploadsheets}
  onClose={handleCloseopenUploadsheets}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  {!uploadOption ? (
    <DialogContent>
<DialogContentText 
  id="alert-dialog-description" 
  style={{ textAlign: 'center' }}
>
  {props.language === "English"
    ? "בחר אפשרות להעלאת גיליון"
    : "Choose an option to upload a sheet"}
</DialogContentText>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleSelectOption("CsvtojsonAddFullRoute")}
        >
          {props.language === "English"
            ? "העלה מסלול עם תחנות ומשימות"
            : "Upload Route with Stations and Tasks"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleSelectOption("ButtonToRunScript")}
        >
          {props.language === "English"
            ? "העלאת תחנות ומשימות"
            : "Upload Stations and Tasks"}
        </Button>
      </DialogActions>
      <div style={{ margin: "20px", display: "flex", gap: "10px" }}>
        <Button
          variant="contained"
          color="success"
          size="small"
          href="/SpreadsheetTemplate/EN-Fill-In-Spreadsheet-Template.csv"
          download="EN-Fill-In-Spreadsheet-Template.csv"
        >
          {props.language !== "English"
            ? "Download English Template"
            : "הורד תבנית באנגלית"}
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          href="/SpreadsheetTemplate/HE-Fill-In-Spreadsheet-Template.csv"
          download="HE-Fill-In-Spreadsheet-Template.csv"
        >
          {props.language !== "English"
            ? "Download Hebrew Template"
            : "הורד תבנית בעברית"}
        </Button>
      </div>
    </DialogContent>
  ) : uploadOption === "CsvtojsonAddFullRoute" ? (
    <CsvtojsonAddFullRoute
      selectedSite={selectedSite}
      language={props.language}
      handleCloseopenUpload={handleCloseopenUploadsheets}
      reloadData={fetchALLData}
      handleDeselectRoute={handleDeselectRoute}
      setLoading={setLoading}
    />
  ) : (
    <ButtonToRunScript
      selectedSite={selectedSite}
      language={props.language}
      handleCloseopenUpload={handleCloseopenUploadsheets}
      reloadData={fetchALLData}
      handleDeselectRoute={handleDeselectRoute}
      setLoading={setLoading}
    />
  )}
</Dialog>
    </>
  );
};
export default Places;

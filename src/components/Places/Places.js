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
  insertRoute,
  getingData_Packs,
  insertPack,
  deletePack
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
import PlacesDropdown from "./PlacesDropdown"
import { useTranslator } from '../../Utility/TranslationProvider';
import Sheettodata from '../csvtojson/sheettodata';
import BorderedTreeView from './BorderedTreeView';

import ModalPack from '../Modal/ModalPack';

let tasksOfRoutes = {};
// let allRoutes = [];
let allPlaces = [];
// let places [];
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
  const [translateData, setTranslateData] = useState('original'); // 'original', 'translated', 'Mixed'
  const { translate } = useTranslator();
  const [openThreeDots, setOpenThreeDots] = useState(-1);

  const [allPacks, setallPacks] = useState([]); // All packs
  const [selectedPack, setSelectedPack] = useState(null); // Currently selected pack
  const [filteredpacksbysite, setFilteredPacksBySite] = useState([]); // Routes for selected pack

  const [modalOpenPack, setModalOpenPack] = useState(false);
  const [packName, setPackName] = useState('');
  const [packUUID, setPackUUID] = useState('');
  const [newPack, setNewPack] = useState({});
  const [newTitleForPack, setNewTitleForPack] = useState({});

  // Add this near your other state declarations
  const [openThreeDotsVerticalPacks, setOpenThreeDotsVerticalPacks] = useState(-1);
  const [allEditors, setAllEditors] = useState([]); // All editors

  // Filter packs by selected site
  useEffect(() => {
    if (selectedSite && allPacks && allPacks.length > 0) { // Added null check for allPacks
      setFilteredPacksBySite(
        allPacks.filter(pack =>
          pack && pack.sites && pack.sites.some(site => site && site.id === selectedSite.id)
        )
      );
    } else {
      setFilteredPacksBySite([]);
    }
  }, [selectedSite, allPacks]);

  // When a pack is selected, filter routes by pack and update filteredDataRoutes
  useEffect(() => {
    if (selectedPack && allRoutes.length > 0) {
      // Extract route IDs from the selected pack
      const packRouteIds = selectedPack.routes.map(routeItem => routeItem.routeId);

      // Filter all routes to only show those that belong to the selected pack
      setFilteredDataRoutes(
        allRoutes.filter(route => packRouteIds.includes(route.id))
      );
    }
  }, [selectedPack, allRoutes]);

  // Handler for selecting a pack
  const handleSelectPack = (pack) => {
    setSelectedPack(pack);

    // If there are routes in the pack, display them in the board
    if (pack && pack.routes && pack.routes.length > 0) {
      // Create a representation of pack routes for the board view
      const packRouteItems = pack.routes.map(packRoute => {
        const route = allRoutes.find(r => r.id === packRoute.routeId);
        if (route) {
          return {
            id: route.id,
            title: route.name.replace('&#8211;', '-').replace('&#8217;', "' "),
            itemType: 'route',
            mySite: mySite,
            myStation: 'Pack Route',
            nameStation: `${pack.name}`,
            color: '#256FA1', // Use pack color
            width: '-13px',
            height: '70px',
            bottom: '-27px',
            kavTopWidth: '25px',
            newkavTaskTop: '0px',
            kavTaskTopMarginTop: '-7px',
            borderLeft: '0x solid #c2bfbf'
          };
        }
        return null;
      }).filter(item => item !== null);

      // Update the board with these routes
      setBoardArrayDND(packRouteItems);

      // Set a flag to indicate we're showing routes from a pack
      localStorage.setItem('showingPackRoutes', 'true');
    }
  };

  // This existing code in Places.js will handle adding the new pack to the list
  useEffect(() => {
    //after adding new packs
    if (Object.keys(newPack)?.length > 0) {
      // If the pack exists in filteredPacksBySite, update it
      const packIndex = filteredpacksbysite.findIndex(pack => pack.id === newPack.id);
      if (packIndex !== -1) {
        const updatedPacks = [...filteredpacksbysite];
        updatedPacks[packIndex] = newPack;
        setFilteredPacksBySite(updatedPacks);
      } else {
        // Otherwise add it
        setFilteredPacksBySite([...filteredpacksbysite, newPack]);
      }
      setNewPack({});
    }
  }, [newPack]);

  // Add this handler for the Add Pack button
  const handleAddPack = () => {
    if (!siteSelected) {
      showNotification("error", props.language === "English" ? "יש לבחור אתר תחילה" : "Please select a site first");
      return;
    }
    setRequestForEditing('');
    setPackName('');
    setPackUUID('');
    setModalOpenPack(true);
    setFlagStudent(true);
  };

  // Add handler for edit pack
  const handleEditPack = (pack) => {
    setRequestForEditing('edit');
    setPackName(pack.name);
    setPackUUID(pack.id);
    setModalOpenPack(true);
  };

  const translateRouteName = async (routeName) => {
    try {
      return await translate(routeName, props.language);
    } catch (error) {
      console.error('Translation error:', error);
      return routeName; // Fallback to the original name in case of an error
    }
  };

  // Add a state to store translated route names
  const [translatedRoutes, setTranslatedRoutes] = useState({});

  // Translate route names when `filteredDataRoutes` changes
  useEffect(() => {
    const translateRoutes = async () => {
      setLoading(true);
      console.log(translateData);

      const translations = {};
      for (const route of filteredDataRoutes) {
        const translatedName = await translateRouteName(route.name.replace('&#8211;', '-').replace('&#8217;', "'"));
        translations[route.id] = translatedName;
      }
      setTranslatedRoutes(translations);
      setLoading(false);
    };
    if (translateData === 'translated' || translateData === 'Mixed') {
      translateRoutes();
    }
  }, [filteredDataRoutes, translateData]);

  useEffect(() => {
    console.log("Request for editing:", requestForEditing);


    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      // If we're dealing with a pack edit
      if (selectedPack && openThreeDotsVerticalPacks >= 0 && openThreeDotsVerticalPacks < filteredpacksbysite.length) {
        setModalOpenPack(true);
        setPackName(filteredpacksbysite[openThreeDotsVerticalPacks].name);
        setPackUUID(filteredpacksbysite[openThreeDotsVerticalPacks].id);
      }
      // Existing route editing code
      else if (openThreeDotsVertical >= 0 && openThreeDotsVertical < filteredDataRoutes.length) {
        setModalOpen(true);
        setRouteName(filteredDataRoutes[openThreeDotsVertical].name);
        setRouteUUID(filteredDataRoutes[openThreeDotsVertical].id);
      }
    } else if (requestForEditing == 'duplication') {
      // Handle pack duplication if needed
      if (selectedPack && openThreeDotsVerticalPacks >= 0 && openThreeDotsVerticalPacks < filteredpacksbysite.length) {
        let newPack = filteredpacksbysite[openThreeDotsVerticalPacks];
        let today = new Date();

        let newPackObj = {
          name: newPack.name + "-" + (Math.floor((Math.random() * 100000))) + "-" + today.toLocaleDateString("en-US"),
          siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
        };

        try {
          setLoading(true); // Start loading
          insertPack(newPackObj).then(async (newaddedpack) => {
            setOpenThreeDotsVertical(-1);
            setOpenThreeDots(-1);
            setRequestForEditing('');
            let newadded = await getingData_Packs().then(data => {
              return data.find(pack => pack.id === newaddedpack.id);
            });
            console.log(newadded);

            const newPacks = [...filteredpacksbysite];
            newPacks.push(newadded);
            setFilteredPacksBySite(newPacks);
            showNotification("success", props.language === "English" ? "האריזה הועתקה בהצלחה!" : "The pack was copied successfully!");
          });
        } catch (error) {
          console.log(error);
          showNotification("error", props.language === "English" ? "האריזה לא הועתקה!" : "The pack was not copied!");
        } finally {
          setLoading(false); // Stop loading
        }
      }
      // Existing route duplication code
      else if (requestForEditing == 'duplication') {
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
          // parentRouteId: newRoute.id
        };

        // delete newRouteObj.students;
        // delete newRouteObj.tasks;
        // delete newRouteObj.sites;

        // console.log(newRouteObj);
        try {
          setLoading(true);
          insertRoute(newRouteObj).then(async (newaddedroute) => {
            // alert(props.language ? 'ההוראה הועתקה בהצלחה!' : 'The instruction was copied successfully!');
            setOpenThreeDotsVertical(-1);
            setOpenThreeDots(-1);
            setRequestForEditing('');
            let newadded = await getingData_Routes().then(data => {
              return data.find(route => route.id === newaddedroute.id);
            })
            console.log(newadded);

            const newRoutes = [...filteredDataRoutes];
            newRoutes.push(newadded);
            setFilteredDataRoutes(newRoutes);
            showNotification("success", props.language === "English" ? "ההוראה הועתקה בהצלחה!" : "The instruction was copied successfully!");
          })
        } catch (error) {
          console.log(error);
          showNotification("error", props.language === "English" ? "ההוראה לא הועתקה!" : "The instruction was not copied!");
        } finally {
          setLoading(false); // Stop loading
        }


      }
    } else if (requestForEditing === 'delete') {
      // Handle pack deletion if needed
      console.log(filteredDataRoutes[openThreeDotsVertical]);
      if (selectedPack) {
        setOpenRemove(true);
        setRouteForDelete(filteredpacksbysite[openThreeDotsVerticalPacks].id);
      } else {

        console.log(filteredDataRoutes[openThreeDotsVertical]);
        setOpenRemove(true);
        setRouteForDelete(openThreeDotsVertical);
      }
    }
    // Other existing conditions...
  }, [requestForEditing]);

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setOpenThreeDots(-1);
    setRequestForEditing('');
  };
  const handleCloseopenUpload = () => {
    setOpenUpload(false);
    setOpenThreeDotsVertical(-1);
    setOpenThreeDots(-1);
    setRequestForEditing('');
  };

  const handleCloseopenUploadsheets = () => {
    setOpenUploadsheets(false);
    setUploadOption(null);
  };

  const handleCloseRemoveConfirm = async () => {
    try {
      // Handle pack deletion
      setLoading(true);
      if (selectedPack) {
        let deletePacks = await deletePack(routrForDelete);

        if (deletePacks.status === 200) {
          showNotification('success', props.language === "English" ? 'המחיקה בוצעה בהצלחה!' : 'The deletion was successful!');
          const newPacks = filteredpacksbysite.filter(
            (pack, index) => index !== routrForDelete
          );
          setFilteredPacksBySite([...newPacks]); // Ensure a new reference
        }
      }
      // Handle route deletion (existing code)
      else {
        let deleteRoutes = await deleteRoute(filteredDataRoutes[routrForDelete].id);

        if (deleteRoutes.status === 200) {
          showNotification('success', props.language === "English" ? 'המחיקה בוצעה בהצלחה!' : 'The deletion was successful!');
          const newRoutes = [...filteredDataRoutes];
          newRoutes.splice(routrForDelete, 1); // remove one element at index x
          setFilteredDataRoutes(newRoutes);
        }
      }

      setOpenRemove(false);
      setOpenThreeDotsVertical(-1);
      setOpenThreeDotsVerticalPacks(-1); // Reset both dropdown states
      setRouteForDelete(-1);
      setRequestForEditing('');
    } catch (error) {
      console.error(error);
      showNotification('error', props.language === "English" ? 'המחיקה נכשלה!' : 'Deletion failed!');
    } finally {
      setLoading(false); // Stop loading
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
      setallPacks(await getingData_Packs());
      setAllEditors(await getingData_Editors()); //get request for Editors
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
      // console.log('allWorkersForSite: ', allWorkersForSite);
    }
  }, [allRoutes, selectedSite]);
  const handleSiteSelect = useCallback(async (selectedSiteValue) => {
    setLoading(true);
    try {
      // Set the site in state
      setTempSelectedSite(selectedSiteValue);

      if (!siteSelected && !replaceSiteFlag) {
        // First time selection or clean selection
        tasksOfRoutes = {};
        setTasksOfChosenStation([]);
        setReplaceSite(selectedSiteValue);
        setSiteSelected(true);
        setReplaceSiteFlag(true);
        setOpenModalSiteChosen(false);
        setSelectedSite(selectedSiteValue);

        // Load all data for this site in parallel
        await Promise.all([
          // 1. Load station data
          loadStationsForSite(selectedSiteValue),

          // 2. Load workers for the site
          loadWorkersForSite(selectedSiteValue),

          // 3. Load packs for the site
          loadPacksForSite(selectedSiteValue),

          // 4. Load routes for the site
          loadRoutesForSite(selectedSiteValue)
        ]);

      } else {
        // User is trying to change sites
        setReplaceSiteFlag(false);
        setOpenModalSiteChosen(true);
        setRouteFlags(false);
      }
    } catch (error) {
      console.error("Error loading site data:", error);
      showNotification("error", props.language === "English" ?
        "שגיאה בטעינת נתונים" : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, [siteSelected, replaceSiteFlag]);

  const handleSiteSelectChange = useCallback((event) => {
    try {
      const selectedSiteValue = JSON.parse(event.target.value);
      handleSiteSelect(selectedSiteValue);
    } catch (error) {
      console.error("Error parsing site selection:", error);
      showNotification("error", props.language === "English" ?
        "שגיאה בבחירת אתר" : "Error selecting site");
    }
  }, [handleSiteSelect]);



  // Load stations for a site
  const loadStationsForSite = async (site) => {
    try {
      // Set site data
      mySite.name = site.name;
      mySite.id = site.id;
      mySite.nameInEnglish = site.nameInEnglish;

      // Get stations for the site
      const stations = onlyAllStation.filter(item => item.parentSiteId === site.id);

      // Add colors to stations
      const stationsWithColors = stations.map((item, index) => ({
        ...item,
        color: pastelColors[index % pastelColors.length]
      }));

      setStationArray(stationsWithColors);

      // Get tasks for the site
      const tasksOfTheSite = allTasks.filter(task =>
        task.sites.find(siteItem => siteItem.id === site.id)
      );

      setTasksLength(tasksOfTheSite.length);
      setAllTasksOfTheSite(tasksOfTheSite);

      // Save site in local storage
      localStorage.setItem('MySite', JSON.stringify(mySite));

      return stationsWithColors;
    } catch (error) {
      console.error("Error loading stations:", error);
      throw error;
    }
  };

  // Load workers for a site
  const loadWorkersForSite = async (site) => {
    try {
      const workers = allRoutes
        .filter(route => route.sites.some(siteItem => siteItem.id === site.id))
        .flatMap(route => route.students);

      // Remove duplicates
      const uniqueWorkers = Array.from(
        new Set(workers.map(worker => worker.id))
      ).map(id => workers.find(worker => worker.id === id));

      setAllWorkersForSite(uniqueWorkers);
      return uniqueWorkers;
    } catch (error) {
      console.error("Error loading workers:", error);
      throw error;
    }
  };

  // Load packs for a site
  const loadPacksForSite = async (site) => {
    try {
      if (allPacks && allPacks.length > 0) {
        const filteredPacks = allPacks.filter(pack =>
          pack && pack.sites && pack.sites.some(packSite =>
            packSite && packSite.id === site.id
          )
        );

        setFilteredPacksBySite(filteredPacks);
        return filteredPacks;
      } else {
        setFilteredPacksBySite([]);
        return [];
      }
    } catch (error) {
      console.error("Error loading packs:", error);
      throw error;
    }
  };

  // Load routes for a site
  const loadRoutesForSite = async (site) => {
    try {
      const filteredRoutes = allRoutes.filter(route =>
        route.sites.some(routeSite => routeSite.id === site.id)
      );

      setRoutes(filteredRoutes);
      setFilteredDataRoutes(filteredRoutes);
      return filteredRoutes;
    } catch (error) {
      console.error("Error loading routes:", error);
      throw error;
    }
  };

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
      // User confirmed site change
      setLoading(true);
      try {
        // Apply the new site
        const newSite = tempSelectedSite;

        // Reset current state
        setReplaceSite(selectedSite);
        setTasksLength(0);
        setTasksOfChosenStation([]);
        setSelectedWorker(null);
        setSelectedPack(null);

        // Load all data for the new site
        Promise.all([
          loadStationsForSite(newSite),
          loadWorkersForSite(newSite),
          loadPacksForSite(newSite),
          loadRoutesForSite(newSite)
        ]).then(() => {
          // Update the selected site last to trigger any dependent effects
          setSelectedSite(newSite);
          Display_The_Stations(newSite);
        }).catch(error => {
          console.error("Error during site replacement:", error);
        }).finally(() => {
          setLoading(false);
        });
      } catch (error) {
        console.error("Error in site replacement:", error);
        setLoading(false);
      }
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
      showNotification("warning", props.language === "English" ? 'לא נמצאו מקומות שונים!' : 'No different sites found!');
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

  // const clickOnhreeDotsVerticaIcont = (value) => {
  const clickOnThreeDotsVerticalIcon = (value, type) => {
    if (type === 'pack') {
      if (openThreeDotsVerticalPacks === value)
        setOpenThreeDotsVerticalPacks(-1);
      else
        setOpenThreeDotsVerticalPacks(value);
    } else {
      if (openThreeDotsVertical === value)
        setOpenThreeDotsVertical(-1);
      else
        setOpenThreeDotsVertical(value);
    }
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
            setLoading(true); // Start loading
            updateRoute(uuidRoute, { siteIds: mySite.id });
            showNotification("success", props.language === "English" ? "Route Updated Successfully" : "המסלול עודכן בהצלחה");
          } catch (error) {
            console.error(error);
            showNotification("error", props.language === "English" ? "Error Updating Route" : "שגיאה בעדכון המסלול");
          } finally {
            setLoading(false); // Stop loading
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
    const { source, destination, draggableId } = result;

    // Return early if there's no destination
    if (!destination) return;

    // Handle tasks being dragged
    if (source.droppableId === "tasks-droppable") {
      setDropToBoard(result);
    }

    // Handle stations being dragged
    if (source.droppableId === "stationArray") {
      setDropToBoard(result);
      const stationId = result.draggableId;
      const station = stationArray.find((station) => station.id === stationId);
      setTasksOfChosenStation(station.tasks);
    }

    // Handle routes being dragged
    if (source.droppableId === "routes-droppable") {
      // Set the drop to board result so the board component can handle it
      setDropToBoard(result);

      // You might want to select the route that was dragged
      const route = filteredDataRoutes.find(r => r.id === draggableId);
      if (route) {
        setSelectedRoute(route);
        // Only display tasks/stations if desired when dragging
        // displayStationsFromSelectedRoute(route);
        // DisplayTasks(route);
      }
    }
  }

  const handleDeselectRoute = () => {
    setLoading(true); // Start loading
    setAllTasksOfTheSite([]);
    setTasksOfChosenStation([]);
    setTasksLength(0);
    setSelectedWorker(null);
    // setSelectedPack(null);
    Display_The_Stations(selectedSite).finally(() => {
      setLoading(false); // Stop loading after the operation is complete
    });
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
        {/* <div>
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
        </div> */}
        <PlacesDropdown
          currentLanguage={props.language !== 'English' ? 'EN' : 'HE'}
          allPlaces={allPlaces}
          siteQuestionLanguage={props.siteQuestionLanguage}
          siteLanguage={props.siteLanguage}
          handleSiteSelectChange={handleSiteSelectChange}
          showDataTranslate={translateData} // props.showDataTranslate ||original - translated - Mixed
          selectedValuewithjsons={true}
          selectedSite={selectedSite}
          value={selectedSite ? JSON.stringify(selectedSite) : 'DEFAULT'}
        />
        <div
          style={{ margin: '20px' }}
          className={
            siteSelected === true && allWorkersForSite.length > 0
              ? ''
              : 'disabledWorker'
          }
        >
          {/* <div className='placesTitle'>
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
          </select> */}
          <PlacesDropdown
            currentLanguage={props.language !== 'English' ? 'EN' : 'HE'}
            allPlaces={allWorkersForSite}
            siteQuestionLanguage={props.SiteStudentQuestionLanguage}
            siteLanguage={props.siteLanguage}
            handleSiteSelectChange={handleWorkerSelectChange}
            showDataTranslate={translateData} // props.showDataTranslate ||original - translated - Mixed
            selectedValuewithjsons={false}
            selectedSite={selectedWorker}
            value={selectedWorker ? selectedWorker.name : 'DEFAULT'}
          />
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
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* routes */}

          {/* modal for adding new route */}
          {modalOpen && ( ///
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
              setFilteredDataRoutes={setFilteredDataRoutes}
              filteredDataRoutes={filteredDataRoutes}
              setRequestForEditing={setRequestForEditing}
            />
          )}
          {/* // In the JSX part, add the ModalPack component just after the existing Modal component: */}
          {modalOpenPack && (
            <ModalPack
              packName={packName}
              requestForEditing={requestForEditing}
              setNewTitleForPack={setNewTitleForPack}
              setNewPack={setNewPack}
              setOpenModalPack={setModalOpenPack}
              setFlagStudent={setFlagStudent}
              flagTest={flagTest}
              siteSelected={siteSelected}
              language={props.language}
              packUUID={packUUID}
              setFilteredPacksBySite={setFilteredPacksBySite}
              filteredPacksBysite={filteredpacksbysite}
              setRequestForEditing={setRequestForEditing}
              allroutes={allRoutes}
              alleditors={allEditors}
              allUsers={allWorkersForSite}
            />
          )}
          {/* //////////////////////////////////////////////////////////////////////////////////////////// */}
          <div className='Cover_Places'>
            <>
              <div className='TitlePlacesCover' style={{ backgroundColor: '#ba11b0' }}>
                <div className='TitlePlaces'>
                  <div
                    className={`MyTitle text ${props.language !== 'English' ? 'english' : ''
                      }`}
                  >
                    {props.language === 'English' ? 'אריזות' : 'Packs'}
                  </div>
                </div>
              </div>
            </>

            <div
              className='search'
              style={{
                backgroundColor: '#F5F5F5',
              }}
            >
              <input
                className={`searchButton  ${props.language !== 'English' ? 'english' : 'routes'}`}
                dir='rtl'
                placeholder={
                  props.language === 'English' ? 'חפש אריזות' : 'search packs'
                }
                label={
                  <CgSearch
                    style={{ fontSize: 'x-large', textAlign: '-webkit-center' }}
                  />
                }
              // onChange={inputHandlerPacks}
              ></input>
            </div>
            {/* <div
            className='search'
            style={{
              backgroundColor: '#F5F5F5',
            }}
          >
            <button
              className="deselect-button"
              onClick={handleDeselectRoute}
            >
              {props.language === "English" ? "הצג את כל התחנות" : "show all Stations"}
            </button>
          </div> */}
            <div className='routs'>
              {filteredpacksbysite.length === 0 ? (
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
                filteredpacksbysite.map((pack, index) => (
                  <div
                    className='buttons'
                    style={{
                      border:
                        pack.id === selectedPack?.id
                          ? '1px solid rgb(173, 16, 212)'
                          : '',
                      flexDirection: props.language === 'English' ? 'row' : 'row-reverse',
                      textAlignLast:
                        props.language === 'English' ? 'end' : 'left',
                    }}
                    key={index}
                  >
                    <div className='dropdownThreeDots'>
                      <button
                        className='threeDotsVerticalEng'
                        onClick={() => {
                          // Find the actual index of the pack in filteredpacksbysite
                          const actualIndex = filteredpacksbysite.findIndex(
                            (r) => r.id === pack.id
                          );
                          console.log('actualIndex', actualIndex);
                          console.log('openThreeDotsVerticalPacks', openThreeDotsVerticalPacks);
                          clickOnThreeDotsVerticalIcon(actualIndex, 'pack'); // Pass the correct index and type
                          setSelectedPack(pack);
                          setRequestForEditing('');
                        }}
                      >
                        <BsThreeDotsVertical />
                      </button>

                      {openThreeDotsVerticalPacks === filteredpacksbysite.findIndex((r) => r.id === pack.id) ? (
                        <ModalDropdown
                          language={props.language}
                          setRequestForEditing={setRequestForEditing}
                          setOpenThreeDotsVertical={setOpenThreeDotsVerticalPacks} // Use the pack-specific setter
                          editable={true}
                          Reproducible={true}
                          details={false}
                          erasable={true}
                          uploadfromsheet={false}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                    <button
                      className="nameOfButton"
                      onClick={() => {
                        setSelectedPack(pack);
                        console.log('pack', pack);

                        // Call the function to handle pack selection and display routes
                        handleSelectPack(pack);

                        // Create a simulated drop event to make the board view show pack routes
                        const simulatedDropEvent = {
                          source: { droppableId: 'Packs' },
                          destination: { droppableId: 'board-droppable' },
                          draggableId: pack.id
                        };
                        setDropToBoard(simulatedDropEvent);
                      }}
                    >
                      {translateData === 'translated'
                        ? translatedRoutes[pack.id] ||
                        pack.name.replace('&#8211;', '-').replace('&#8217;', "'")
                        : translateData === 'Mixed'
                          ? `${pack.name
                            .replace('&#8211;', '-')
                            .replace('&#8217;', "'")} (${translatedRoutes[pack.id] ||
                            pack.name.replace('&#8211;', '-').replace('&#8217;', "'")})`
                          : pack.name.replace('&#8211;', '-').replace('&#8217;', "'")}
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className='addPlaceCover'>
              <button
                className='AddButton'
                onClick={handleAddPack}
              >
                <AiOutlinePlus className='plus' />
              </button>
            </div>
          </div>
          {/* //////////////////////////////////////////////////////////////////////////////////////////// */}
          <div className='Cover_Places'>
            <>
              <div className='TitlePlacesCover'>
                <div className='TitlePlaces'>
                  <div
                    className={`MyTitle text ${props.language !== 'English' ? 'english' : ''}`}
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
              }}
            >
              <input
                className={`searchButton  ${props.language !== 'English' ? 'english' : 'routes'}`}
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
              }}
            >
              <button
                className="deselect-button"
                onClick={handleDeselectRoute}
              >
                {props.language === "English" ? "הצג את כל התחנות" : "show all Stations"}
              </button>
            </div>

            <Droppable droppableId="routes-droppable">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className='routs'
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? '#eeeee4' : '#F5F5F5',
                  }}
                >
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
                    <BorderedTreeView
                      direction={props.language !== 'English' ? 'ltr' : 'rtl'}
                      filteredDataRoutes={filteredDataRoutes}
                      renderRoute={(route, index) => (
                        <Draggable key={route.id} draggableId={route.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className='buttons'
                              style={{
                                ...provided.draggableProps.style,
                                border: route.id === tasksOfRoutes.id ? '1px solid #256fa1' : '',
                                flexDirection: 'row-reverse',
                                textAlignLast: props.language === 'English' ? 'end' : 'left',
                              }}
                              onClick={() => {
                                setSelectedRoute(route);
                                if (selectedRoute === null || selectedRoute.id !== route.id) {
                                  displayStationsFromSelectedRoute(route);
                                  DisplayTasks(route);
                                }
                              }}
                            >
                              <div className='dropdownThreeDots'>
                                <button
                                  className='threeDotsVerticalEng'
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent drag from starting
                                    // Find the actual index of the route in filteredDataRoutes
                                    const actualIndex = filteredDataRoutes.findIndex(
                                      (r) => r.id === route.id
                                    );
                                    console.log('actualIndex', actualIndex);
                                    console.log('openThreeDotsVertical', openThreeDotsVertical);
                                    clickOnThreeDotsVerticalIcon(actualIndex, 'route');
                                    setSelectedRoute(route);
                                  }}
                                >
                                  <BsThreeDotsVertical />
                                </button>

                                {selectedRoute?.id === route.id && openThreeDotsVertical === filteredDataRoutes.findIndex((r) => r.id === route.id) ? (
                                  <ModalDropdown
                                    language={props.language}
                                    setRequestForEditing={setRequestForEditing}
                                    setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                                    editable={false}
                                    Reproducible={true}
                                    details={false}
                                    erasable={true}
                                    uploadfromsheet={false}
                                  />
                                ) : (
                                  <></>
                                )}
                              </div>
                              <div
                                className="nameOfButton"
                                onClick={() => {
                                  setSelectedRoute(route);
                                  if (selectedRoute === null || selectedRoute.id !== route.id) {
                                    displayStationsFromSelectedRoute(route);
                                    DisplayTasks(route);
                                  }
                                }}
                              >
                                {translateData === 'translated'
                                  ? translatedRoutes[route.id] ||
                                  route.name.replace('&#8211;', '-').replace('&#8217;', "'")
                                  : translateData === 'Mixed'
                                    ? `${route.name
                                      .replace('&#8211;', '-')
                                      .replace('&#8217;', "'")} (${translatedRoutes[route.id] ||
                                      route.name.replace('&#8211;', '-').replace('&#8217;', "'")})`
                                    : route.name.replace('&#8211;', '-').replace('&#8217;', "'")}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )}
                    />
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <div className='addPlaceCover'>
              <button
                className='AddButton'
                onClick={() => {
                  console.log('clicked', modalOpen);
                  setModalOpen(true);
                  setFlagStudent(true);
                  setClickAddRoute((clickAddRoute = true));
                }}
              >
                <AiOutlinePlus className='plus' />
              </button>
            </div>
          </div>
          {/* //////////////////////////////////////////////////////////////////////////////////////////// */}
          <Stations
            filteredDataRoutes={filteredDataRoutes}
            setFilteredDataRoutes={setFilteredDataRoutes}
            setTranslateData={setTranslateData}
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
            Packs={filteredpacksbysite}  // Make sure to pass the packs data 
            selectedPack={selectedPack}
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
        PaperProps={uploadOption === "CsvtojsonAddFullRoute" ? {
          className: 'fullScreenDialogPaper'
        } : {}}
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
              {/* <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleSelectOption("ButtonToRunScript")}
              >
                {props.language === "English"
                  ? "העלאת תחנות ומשימות"
                  : "Upload Stations and Tasks"}
              </Button> */}
            </DialogActions>
            <div style={{ margin: "20px", display: "flex", gap: "10px" }}>
              <Button
                variant="contained"
                color="success"
                size="small"
                href="/SpreadsheetTemplate/EN-Fill-In-Spreadsheet-Template.xlsx"
                download="EN-Fill-In-Spreadsheet-Template.xlsx"
              >
                {props.language !== "English"
                  ? "Download English Template"
                  : "הורד תבנית באנגלית"}
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                href="/SpreadsheetTemplate/HE-Fill-In-Spreadsheet-Template.xlsx"
                download="HE-Fill-In-Spreadsheet-Template.xlsx"
              >
                {props.language !== "English"
                  ? "Download Hebrew Template"
                  : "הורד תבנית בעברית"}
              </Button>
            </div>
          </DialogContent>
        ) : uploadOption === "CsvtojsonAddFullRoute" ? (
          <Sheettodata
            selectedSite={selectedSite}
            language={props.language}
            handleCloseopenUpload={handleCloseopenUploadsheets}
            reloadData={fetchALLData}
            handleDeselectRoute={handleDeselectRoute}
            setLoading={setLoading}
          />
        ) : (
          <></>
          // <ButtonToRunScript
          //   selectedSite={selectedSite}
          //   language={props.language}
          //   handleCloseopenUpload={handleCloseopenUploadsheets}
          //   reloadData={fetchALLData}
          //   handleDeselectRoute={handleDeselectRoute}
          //   setLoading={setLoading}
          // />
        )}
      </Dialog>
    </>
  );
};
export default Places;

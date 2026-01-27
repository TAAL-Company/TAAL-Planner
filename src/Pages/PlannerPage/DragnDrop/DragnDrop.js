import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Tag from '../Tag/Tag.js';
import ModalTasks from '../Modal/Modal_Tasks';
import Modal from '../Modal/Modal';
import Phone from '../Phone/Phone';
import Tablet from '../Tablet/Tablet';
import ReorderBoard from '../ReorderBoard/ReorderBoard';
import ProgressBar from '../ProgressBar/ProgressBar';
import ModalDelete from '../Modal/Modal_Delete';
import { deleteTask, updatePack } from '../../../api/api.js';
import { Droppable } from 'react-beautiful-dnd';
import './style.css';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ViewRoutesModal from './ViewRoutesModal.js';
import { useNotification } from "../../../components/Notification/NotificationProvider.js";

let Route = [];
let dndArray = [];
let saveProps = [];
let thisIdArray = [];
let helpFlag = false;
let count = 0;
let width = '-13px';
let height = '70px';
let bottom = '-27px';
let kavTopWidth = '25px';
let saveTag = {};
let kavTaskTopMarginTop = '-7px';
let borderLeft = '2px solid #c2bfbf';
let flagPhone = false;
let flagPhoneOne = false;
let flagStress = false;
let modalFlagTablet = false;
let myStation = '';
let countTemp = 0;
//-------------------------
function DragnDrop(props) {
  const { t } = useTranslation();
  // const [props.board, props.setBoard] = useState([]);
  const [, setReorderBoardFlag] = useState(true);
  const [openRemove, setOpenRemove] = useState(false);
  const [, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenAddRoute, setModalOpenAddRoute] = useState(false);
  const [modalOpenAddPack, setModalOpenAddPack] = useState(false);
  const [, setModalFlagTablet] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [, setCount] = useState(0);
  const [get_Name] = useState(null); // for TextView
  const [flagTree, setFlagTree] = useState(false);
  const [, setFlagPhone] = useState(false);
  const [, setFlagPhoneOne] = useState(false);
  const [, setWidth] = useState('-13px');
  const [, setHeight] = useState('70px');
  const [, setNameStation] = useState('');
  const [, setBottom] = useState('-27px');
  const [, setKavTopWidth] = useState('25px');
  const [newkavTaskTop, setNewkavTaskTop] = useState('100px');
  const [, setKavTaskTopMarginTop] = useState('-7px');
  const [, setBorderLeft] = useState('2px solid #c2bfbf');
  const [, setFlagStress] = useState(false);
  const [activeButton, setActiveButton] = useState('tree');//reorder -- tree
  const [siteSelected, setSiteSelected] = useState(false);
  const [boardArrayDND, setBoardArrayDND] = useState([]);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [, setRequestForEditingBoard] = useState('');
  const [taskUuidForEdit, setTaskUuidForEdit] = useState('');
  const [taskForEdit, setTaskForEdit] = useState('');
  const [openThreeDotsVerticalBoard, setOpenThreeDotsVerticalBoard] = useState(-1);
  const [location, setLocation] = useState(-1);
  const [alignment, setAlignment] = useState('original');
  const [modalOpenViewRoutes, setModalOpenViewRoutes] = useState(false);
  const { showNotification } = useNotification();


  const handleChange = (event, newAlignment) => {
    console.log("newAlignment", newAlignment);
    props.setTranslateData(newAlignment);

    setAlignment(newAlignment);
  };

  useEffect(() => {
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setTaskUuidForEdit(openThreeDotsVerticalBoard);
      setModalOpen(true);
    } else if (requestForEditing === 'duplication') {
    } else if (requestForEditing === 'delete') setOpenRemove(true);
  }, [openThreeDotsVerticalBoard, requestForEditing]);

  useEffect(() => {
    if (props.boardArrayDND && props.boardArrayDND.length > 0) {
      setBoardArrayDND(props.boardArrayDND);
    }

    if (props.board.length > 0 && boardName !== '') {
      let taskMap;
      // Create a map for faster lookup
      if (boardName === 'routes') {
        taskMap = new Map(props.boardArrayDND.map((task) => [task.id, task]));
      } else if (boardName === 'tasks') {
        taskMap = new Map(
          props.tasksOfChosenStation.map((task) => [task.id, task])
        );
      }

      for (let index = 0; index < props.board.length; index++) {
        const updatedTask = taskMap.get(props.board[index].id);

        if (updatedTask) {
          Object.assign(props.board[index], {
            title: updatedTask.title,
            subtitle: updatedTask.subtitle,
            estimatedTimeSeconds: updatedTask.estimatedTimeSeconds,
            picture_url: updatedTask.picture_url,
            audio_url: updatedTask.audio_url,
          });
        }
      }
    }

    if (taskForEdit !== '') {
      editTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.board,
    boardName,
    props.boardArrayDND,
    props.tasksOfChosenStation,
    taskForEdit,
  ]);

  const getTheStation = () => {
    if (props.myStation.data.length > 0 && openThreeDotsVerticalBoard !== -1) {
      return props.myStation;
    } else if (boardArrayDND.length > 0 && openThreeDotsVerticalBoard !== -1) {
      const foundDND = boardArrayDND.find(
        (dnd) => dnd.id === openThreeDotsVerticalBoard
      );
      if (foundDND) {
        return foundDND.theStation;
      }
    }
    return ''; // Return a default value if no match is found.
  };

  const updateTask = (taskForEdit, tasks) => {
    return tasks.map((task) =>
      task.id === taskForEdit.id ? taskForEdit : task
    );
  };

  const updateTaskDetails = (updatedTasks, board) => {
    return board
      .filter((t) =>
        updatedTasks.some((updatedTask) => updatedTask.id === t.id)
      )
      .map((task) => {
        const matchingUpdatedTask = updatedTasks.find(
          (updatedTask) => updatedTask.id === task.id
        );
        if (matchingUpdatedTask) {
          task.title = matchingUpdatedTask.title;
          task.subtitle = matchingUpdatedTask.subtitle;
          task.estimatedTimeSeconds = matchingUpdatedTask.estimatedTimeSeconds;
          task.picture_url = matchingUpdatedTask.picture_url;
          task.audio_url = matchingUpdatedTask.audio_url;
        }
        return task;
      });
  };

  const editTask = () => {
    let updatedTask;

    const updatedTasks = updateTask(taskForEdit, props.allTasksOfTheSite);
    props.setAllTasksOfTheSite(updatedTasks);

    if (boardName === 'routes') {
      let indexStation = props.allStations.findIndex(
        (station) =>
          station.id ===
          props.board.find((b) => b.id === taskForEdit.id).theStation.id
      );
      const updatedTasksBoardArrayDND = updateTask(taskForEdit, boardArrayDND);
      const newTasksBoardArrayDND = updateTaskDetails(
        updatedTasksBoardArrayDND,
        props.board
      );
      setBoardArrayDND(updatedTasksBoardArrayDND);

      const taskToUpdate = updatedTasksBoardArrayDND.find(
        (t) => t.id === taskForEdit.id
      );
      if (taskToUpdate) {
        const index = props.allStations[indexStation].tasks.findIndex(
          (task) => task.id === taskToUpdate.id
        );

        if (index !== -1) {
          (() => {
            props.allStations[indexStation].tasks[index] = taskToUpdate;
            // props.setTasksOfChosenStation(props.allStations[indexStation].tasks);
          })();
        }
      }

      // props.setTasksOfChosenStation(updatedTasksOfChosenStation);
      updatedTask = newTasksBoardArrayDND.find(
        (task) => task.id === taskForEdit.id
      );
    } else if (boardName === 'tasks') {
      let indexStation = props.allStations.findIndex(
        (station) => station.id === props.chosenStation.id
      );
      const updatedTasksOfChosenStation = updateTask(
        taskForEdit,
        props.tasksOfChosenStation
      );
      const newBoard = updateTaskDetails(updatedTasksOfChosenStation, props.board);
      (() => {
        // props.setTasksOfChosenStation(updatedTasksOfChosenStation);
        props.allStations[indexStation].tasks = updatedTasksOfChosenStation;
      })();
      updatedTask = newBoard.find((task) => task.id === taskForEdit.id);
    }

    // updatedTask = updateTask(taskForEdit, props.board)
    // updatedTask = updateTaskDetails(updatedTask, props.board)

    if (updatedTask) {
      let existingTaskIndex = props.board.findIndex(
        (task) => task.id === updatedTask.id
      );
      if (existingTaskIndex !== -1) {
        props.board[existingTaskIndex] = updatedTask;
      }
    }
    setTaskForEdit('');
  };

  const handleCloseRemove = () => {
    setOpenThreeDotsVertical(-1);
    setOpenThreeDotsVerticalBoard(-1);
    setRequestForEditing('');
    setOpenRemove(false);
  };
  const handleCloseRemoveConfirm = async () => {
    // props.board={props.board}
    // props.setBoard={props.setBoard}

    // console.log("props.board", props.board);
    // console.log("openThreeDotsVerticalBoard", openThreeDotsVerticalBoard);
    // console.log("location", location);

    const items = Array.from(props.board);
    const filteredItems = items.filter((item, index) => index !== parseInt(location, 10));
    // console.log('filteredItems', filteredItems);
    props.setBoard(filteredItems);



    // let deleteTaskTemp = await deleteTask(openThreeDotsVerticalBoard);

    // if (deleteTaskTemp !== undefined) {
    //   alert('המחיקה בוצעה בהצלחה!');
    //   const newTasks = [...props.tasksOfChosenStation];
    //   let indexaTask = props.tasksOfChosenStation.findIndex(
    //     (task) => task.id === openThreeDotsVerticalBoard
    //   );
    //   newTasks.splice(indexaTask, 1); // remove one element at index x
    //   props.setTasksOfChosenStation(newTasks);

    //   // const indexBoardTask = props.board.findIndex(
    //   //   (task) => task.id === openThreeDotsVerticalBoard
    //   // );
    //   // props.board.splice(indexBoardTask, 1); // remove one element at index x

    //   let indexStation = props.stationArray.findIndex(
    //     (station) => station.id === props.myStation.id
    //   );

    //   props.stationArray[indexStation].tasks = newTasks;
    // }
    handleCloseRemove();
  };

  let prevStation = '';
  useEffect(() => { }, [props.percentProgressBar]);

  useEffect(() => {
    if (!props.replaceRouteFlag) return;

    treeFunction({ currentTarget: { className: 'tree' } });

    if (typeof props.setReplaceRouteFlag === 'function') {
      props.setReplaceRouteFlag(false);
    }
    if (props.replaceRouteFlag) {
      props.setBoard([]);
    }
  }, [props.replaceRouteFlag]);

  useEffect(() => {
    if (props.replaceSiteFlag) {
      props.setBoard([]);
      dndArray = [];
    }
  }, [props.replaceSiteFlag]);

  useEffect(() => {
    if (props.mySite.name !== '') {
      setSiteSelected(true);
    }
  }, [props.mySite.name]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);
  saveProps = props;

  useEffect(() => {
    if (props.tasksOfRoutes && props.tasksOfRoutes.tasks) {
      countTemp = 50 / props.tasksOfRoutes.tasks.length;
      // props.setProgressBarFlag(true)
      if (
        props.tasksOfRoutes.tasks.length > 0 &&
        Array.isArray(props.boardArrayDND) && props.boardArrayDND.length > 0
      ) {
        props.tasksOfRoutes.tasks.forEach(async (element) => {
          await addImageToBoard(element.taskId, 'routes');
          setBoardName('routes');
          props.setPercentProgressBar(
            (percentProgressBar) => percentProgressBar + countTemp
          );
        });
      }
      // props.setProgressBarFlag(false)
    }
  }, [props.tasksOfRoutes]);

  useEffect(() => { }, [props.progressBarFlag]);

  let nameStation = props.myStation.name;

  const mapTask = (task) => {
    return {
      id: task.id,
      title: task.title.replace('&#8211;', '-').replace('&#8217;', "' "),
      subtitle: task.subtitle,
      estimatedTimeSeconds: task.estimatedTimeSeconds,
      picture_url: task.picture_url,
      audio_url: task.audio_url,
      mySite: props.mySite,
      myStation: props.myStation.name,
      theStation: props.myStation,
      data: props.myStation.data,
      nameStation: nameStation,
      color: props.stationColor,
      newKavTaskTop: newkavTaskTop,
      width,
      height,
      bottom,
      borderLeft,
      kavTaskTopMarginTop,
      kavTopWidth,
    };
  };
  useEffect(() => {
    dndArray = props.tasksOfChosenStation.map(mapTask);
  }, [props.tasksOfChosenStation]);

  // ---------------------------------------------------------
  // const [{ isOver }, drop] = useDrop(() => ({
  //   accept: "image",
  //   drop(item, monitor) {
  //     const itemData = monitor.getItem();
  //     // const props.board = itemData.boardName
  //     // const id = itemData.id
  //     addImageToBoard(itemData.id, itemData.boardName);
  //   },
  //   collect: (monitor) => ({
  //     isOver: !!monitor.isOver(),
  //   }),
  // }));

  //---------------------------------------------------------
  const addImageToBoard = async (id, boardName) => {
    if (boardName !== 'border') {
      if (saveTag.props !== undefined) {
        if (saveTag.props.myLastStation === saveTag.props.myStation) {
          //same station
          setFlagPhoneOne((flagPhoneOne = true));
          setWidth((width = '-84px'));
          setBorderLeft((borderLeft = '2x solid #c2bfbf'));
          setHeight((height = '86px'));
          setBottom((bottom = '45px'));
          setKavTopWidth((kavTopWidth = '0px'));
          setNewkavTaskTop('100px');
          setNameStation((nameStation = ''));
          setKavTaskTopMarginTop((kavTaskTopMarginTop = '-27px'));
        } else {
          setFlagPhoneOne((flagPhoneOne = false));
          setBorderLeft((borderLeft = '0x solid #c2bfbf'));
          setWidth((width = '-13px'));
          setHeight((height = '70px'));
          setBottom((bottom = '-27px'));
          setKavTopWidth((kavTopWidth = '25px'));
          setNewkavTaskTop('0px');
          setNameStation((nameStation = props.myStation.name));
          setKavTaskTopMarginTop((kavTaskTopMarginTop = '-7px'));
        }
      }

      setCount(count++);
      // setFlagFirst(flagFirst = false)
      if (boardName === 'routes' && props.boardArrayDND.length > 0) {
        Route = await props.boardArrayDND?.find((tag) => id === tag.id);

        props.setBoard((board) => [...board, Route]);
        setFlagTree(true);
      } else {
        Route = await dndArray?.find((tag) => id === tag.id);

        props.setBoard((board) => [...board, Route]);
        setFlagTree(true);
      }
      thisIdArray.push(Route.id);

      prevStation = myStation;
      localStorage.setItem('New_Routes', '{"routenotempty":"routenotempty"}');
    }
  };

  const getValueForProperty = (property, fallbackValue) => {
    if (openThreeDotsVerticalBoard !== -1) {
      if (props.board.length > 0) {
        const task = props.board.find(
          (task) => task.id === openThreeDotsVerticalBoard
        );
        if (task && task[property] !== undefined) {
          return task[property];
        }
      }
    }
    return fallbackValue;
  };

  useEffect(() => {//
    if (Object.keys(props.dropToBoard).length > 0) {
      if (
        props.dropToBoard.destination !== undefined &&
        props.dropToBoard.destination !== null &&
        props.dropToBoard.destination.droppableId === 'board-droppable'
      ) {
        // Handle tasks dragged from tasks list
        if (props.dropToBoard.source.droppableId === 'tasks-droppable') {
          addImageToBoard(props.dropToBoard.draggableId, 'tasks');
          setBoardName('tasks');
          localStorage.setItem('changetasksRoutes', true);
        }
        // Handle stations dragged from station list
        else if (props.dropToBoard.source.droppableId === "stationArray") {
          const stationId = props.dropToBoard.draggableId;
          const station = props.stationArray?.find((station) => station.id === stationId);

          if (station) {
            dndArray.forEach(async (task) => {
              task.color = station.color;
              task.data = station.data;
              task.myStation = station.title;
              task.nameStation = station.title;
              task.theStation = station;
            });

            const tasks = dndArray;
            tasks.forEach(async (task) => {
              await addImageToBoard(task.id, 'tasks');
              setBoardName('tasks');
              localStorage.setItem('changetasksRoutes', true);
            });
            localStorage.setItem('changetasksRoutes', true);
          }
        }
        // Handle routes dragged from routes list
        else if (props.dropToBoard.source.droppableId === 'routes-droppable') {
          const routeId = props.dropToBoard.draggableId;
          const route = props.filteredDataRoutes?.find(route => route.id === routeId);

          if (route) {
            // Create a representation of the route in the props.board
            const routeItem = {
              id: route.id,
              title: route.name.replace('&#8211;', '-').replace('&#8217;', "' "),
              itemType: 'route',
              mySite: props.mySite,
              myStation: 'Route',
              nameStation: `${route.name}`,
              color: '#256FA1', // Set a distinct color for routes
              width: '-13px',
              height: '70px',
              bottom: '-27px',
              kavTopWidth: '25px',
              newkavTaskTop: '0px',
              kavTaskTopMarginTop: '-7px',
              borderLeft: '0x solid #c2bfbf'
            };

            props.setBoard(currentBoard => [...currentBoard, routeItem]);
            setFlagTree(true);
            localStorage.setItem('changetasksRoutes', true);
          }
        }
        // Handle packs dragged from packs list
        else if (props.dropToBoard.source.droppableId === 'Packs') {
          try {
            const packId = props.dropToBoard.draggableId;

            // Safely check if props.Packs exists and is an array
            if (!props.Packs || !Array.isArray(props.Packs)) {
              console.error("props.Packs is undefined or not an array");
              return;
            }

            const pack = props.Packs.find(pack => pack.id === packId);

            if (pack && pack.routes && Array.isArray(pack.routes) && pack.routes.length > 0) {
              // Clear the current props.board to show only this pack's routes
              props.setBoard([]);

              // Find all routes in this pack and add them to the props.board
              pack.routes.forEach(packRoute => {
                // Safely check if props.filteredDataRoutes exists
                if (!props.filteredDataRoutes || !Array.isArray(props.filteredDataRoutes)) {
                  console.error("props.filteredDataRoutes is undefined or not an array");
                  return;
                }

                const route = props.filteredDataRoutes.find(r => r.id === packRoute.routeId);
                if (route) {
                  const routeItem = {
                    id: route.id,
                    title: route.name.replace('&#8211;', '-').replace('&#8217;', "' "),
                    itemType: 'route',
                    mySite: props.mySite,
                    myStation: 'Route',
                    nameStation: `${route.name}`,
                    color: '#256FA1', // Use pack color
                    width: '-13px',
                    height: '70px',
                    bottom: '-27px',
                    kavTopWidth: '25px',
                    newkavTaskTop: '0px',
                    kavTaskTopMarginTop: '-7px',
                    borderLeft: '0x solid #c2bfbf',
                    pack: pack.name // Include pack information
                  };

                  props.setBoard(currentBoard => [...currentBoard, routeItem]);
                }
              });

              setFlagTree(true);
              localStorage.setItem('changetasksRoutes', true);
            } else if (pack) {
              // // If the pack has no routes, show a message
              // const emptyPackItem = {
              //   id: `pack-${pack.id}`,
              //   title: `${pack.name} (No routes)`,
              //   itemType: 'pack',
              //   mySite: props.mySite,
              //   myStation: 'Pack',
              //   nameStation: pack.name,
              //   color: '#ba11b0',
              //   width: '-13px',
              //   height: '70px',
              //   bottom: '-27px',
              //   kavTopWidth: '25px',
              //   newkavTaskTop: '0px',
              //   kavTaskTopMarginTop: '-7px',
              //   borderLeft: '0x solid #c2bfbf'
              // };

              // props.setBoard(currentBoard => [...currentBoard, emptyPackItem]);
              // setFlagTree(true);
            } else {
              console.error("Pack not found with ID:", packId);
            }
          } catch (error) {
            console.error("Error handling pack drop:", error);
          }
        }
      }
    }
  }, [props.dropToBoard]);

  const treeFunction = (e) => {
    setFlagPhone((flagPhone = false));
    setModalFlagTablet((modalFlagTablet = false));
    setFlagTree(true);
    setReorderBoardFlag(false);
    setActiveButton(e.currentTarget.className);
  };
  const stressFun = () => {
    setFlagStress((flagStress = true));
  };
  const watchFunction = (e) => {
    setFlagTree(false);
    // setFlagTablet(flagTablet = false);
    setModalFlagTablet((modalFlagTablet = false));
    setReorderBoardFlag(false);
    setFlagPhone((flagPhone = false));
    setActiveButton(e.currentTarget.className);
  };
  const phoneFunction = (e) => {
    setFlagTree(false);
    setFlagPhone((flagPhone = true));
    setReorderBoardFlag(false);
    setModalFlagTablet((modalFlagTablet = false));
    setActiveButton(e.currentTarget.className);
  };
  const tabletFunction = (e) => {
    setFlagTree(false);
    setFlagPhone((flagPhone = false));
    setModalFlagTablet((modalFlagTablet = true));
    setReorderBoardFlag(false);

    setActiveButton(e.currentTarget.className);
  };
  const computerFunction = (e) => {
    // setFlagTree(false);
    // alert("computer")
    setActiveButton(e.currentTarget.className);
  };
  const reorderFunction = (e) => {
    setFlagTree(false);
    setFlagPhone((flagPhone = false));
    setModalFlagTablet((modalFlagTablet = false));
    setReorderBoardFlag(true);
    setActiveButton(e.currentTarget.className);
  };
  useEffect(() => {
    if (flagTree && props.board) {
      for (let i = 0; i < props.board.length; i++) {
        if (props.board[i].nameStation === '') {
          if (i === 0) {
            props.board[i].nameStation = props.board[i].myStation;
            props.board[i].borderLeft = '0x solid #c2bfbf';
            props.board[i].width = '-13px';
            props.board[i].height = '70px';
            props.board[i].bottom = '-27px';
            props.board[i].kavTopWidth = '25px';
            props.board[i].newkavTaskTop = '0px';
            props.board[i].kavTaskTopMarginTop = '-7px';
          } else if (props.board[i].myStation !== props.board[i - 1].myStation) {
            props.board[i].nameStation = props.board[i].myStation;
            props.board[i].borderLeft = '0x solid #c2bfbf';
            props.board[i].width = '-13px';
            props.board[i].height = '70px';
            props.board[i].bottom = '-27px';
            props.board[i].kavTopWidth = '25px';
            props.board[i].newkavTaskTop = '0px';
            props.board[i].kavTaskTopMarginTop = '-7px';
          }
        } else {
          if (i !== 0 && props.board[i].myStation === props.board[i - 1].myStation) {
            props.board[i].nameStation = '';
            props.board[i].width = '-84px';
            props.board[i].borderLeft = '2x solid #c2bfbf';
            props.board[i].height = '86px';
            props.board[i].bottom = '45px';
            props.board[i].kavTopWidth = '0px';
            props.board[i].newkavTaskTop = '100px';
            props.board[i].kavTaskTopMarginTop = '-27px';
          }
        }
      }
    }
  }, [props.board, flagTree]);

  const myTasksContainer = document.querySelector('.MyTasks');

  function scrollToBottom() {
    myTasksContainer.scrollTop = myTasksContainer.scrollHeight;
  }

  useEffect(() => {
    if (myTasksContainer) {
      const observer = new MutationObserver(scrollToBottom);
      observer.observe(myTasksContainer, { childList: true });

      return () => {
        observer.disconnect(); // Cleanup the observer when the component unmounts
      };
    }
  }, [myTasksContainer]);


  const handleSaveRoutesForPack = async () => {
    if (!props.selectedPack) {
      // showNotification("error", props.language === "English" ? "No pack selected!" : "לא נבחרה חבילה!");
      console.log("No pack selected!");

      return;
    }

    try {
      const packRoutes = props.board.map(route => ({
        routeId: route.id,
        name: route.title,
      }));


      const updatedPack = {
        ...props.selectedPack,
        routeIds: packRoutes.map(route => route.routeId),
        siteIds: props.selectedPack.sites.map(site => site.id),
        editorIds: props.selectedPack.editors.map(editor => editor.id),
        userIds: props.selectedPack.students.map(student => student.id),
      };
      delete updatedPack.routes; // Remove the old routes array if it exists
      delete updatedPack.sites; // Remove the old sites array if it exists
      delete updatedPack.editors; // Remove the old editors array if it exists
      delete updatedPack.students; // Remove the old students array if it exists
      delete updatedPack.id; // Remove the old id to avoid conflicts
      delete updatedPack.createdAt; // Remove the createdAt field if it exists
      delete updatedPack.updatedAt; // Remove the updatedAt field if it exists
      delete updatedPack.picture_url; // Remove the picture_url field if it exists
      delete updatedPack.name; // Remove the name field if it exists
      delete updatedPack.description; // Remove the description field if it exists
      // delete updatedPack.routeIds; // Remove the routeIds field if it exists
      delete updatedPack.siteIds; // Remove the siteIds field if it exists
      delete updatedPack.editorIds; // Remove the editorIds field if it exists
      delete updatedPack.userIds; // Remove the userIds field if it exists

      console.log("Updated Pack:", updatedPack);

      await updatePack(props.selectedPack.id, updatedPack);
      showNotification("success", t("plannerPage.Routes_saved_successfully_for_the_pack") );
    } catch (error) {
      console.error("Error saving routes for pack:", error);
      showNotification("error", t("plannerPage.Error_saving_routes_for_the_pack_Please_try_again") );
    }
  };
  //---------------------------------------------------------
  return (
    <>
      {modalOpenAddRoute && (
        <Modal
          siteSelected={siteSelected}
          language={props.language}
          setOpenModal={setModalOpenAddRoute}
          setText={get_Name}
          routeName={props.tasksOfRoutes.name}
          routeUUID={props.tasksOfRoutes.id}
          tasksForNewRoute={props.board}
          setFilteredDataRoutes={props.setFilteredDataRoutes}
          filteredDataRoutes={props.filteredDataRoutes}
          setRequestForEditing={setRequestForEditing}
        />
      )}

      {modalOpenViewRoutes && (
        <ViewRoutesModal
          open={modalOpenViewRoutes}
          onClose={() => setModalOpenViewRoutes(false)}
          routes={props.board.map(route => ({
            routeId: route.id,
            name: route.title,
          }))}
          onSave={handleSaveRoutesForPack}
        />)}
      <>
        <div
          className={`Board ${props.language !== 'English' ? 'english' : ''}`}
        // ref={drop}
        >
          <div className='topButtons'>
            <button
              className='AddRoute'
              type='submit'
              onClick={() => {
                setModalOpenAddRoute(true);
              }}
            >
              {props.saveButton}
            </button>

            <button
              className='AddPack'
              type='submit'
              onClick={() => setModalOpenViewRoutes(true)}
            >
              {t('plannerPage.Add_Pack')}
            </button>
            {/* כפתור שפות */}
            {/* <button
              className='language'
              // style={{ marginLeft: marginHebrew, marginTop: "22px" }}
              onClick={() => {
                if (props.Hebrew !== false) props.hebrew();
                else props.english();
              }}
            >
              {props.language}
            </button> */}

            <ToggleButtonGroup
              className='language'
              color="warning"
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton value="original"><TextSnippetIcon /></ToggleButton>
              <ToggleButton value="translated"><GTranslateIcon /></ToggleButton>
              <ToggleButton value="Mixed">Mixed</ToggleButton>
            </ToggleButtonGroup>

          </div>
          <div
            className={`txt ${props.language !== 'English' ? 'english' : ''}`}
          >
            {' '}
            {props.drag}&nbsp;&nbsp;
            <div style={{ fontSize: '20px', left: '185px' }}></div>
          </div>
          <div
            className={`my_Buttons_icons ${props.language !== 'English' ? 'english' : ''
              }`}
          >
            <button
              className={
                'reorder' + (activeButton === 'reorder' ? ' active' : '')
              }
              onClick={reorderFunction}
            ></button>
            <button
              className={'tree' + (activeButton === 'tree' ? ' active' : '')}
              onClick={treeFunction}
            ></button>

            <button
              className={'phone' + (activeButton === 'phone' ? ' active' : '')}
              onClick={phoneFunction}
            ></button>
            <button
              className={
                'tablet' + (activeButton === 'tablet' ? ' active' : '')
              }
              onClick={tabletFunction}
            ></button>
            <button
              className={'watch' + (activeButton === 'watch' ? ' active' : '')}
              onClick={watchFunction}
            ></button>
            {/* <button
                  className={'computer' + (activeButton === 'computer' ? ' active' : '')}
                  onClick={
                    computerFunction}>
                </button> */}
          </div>
          <Droppable droppableId='board-droppable'>
            {(provided) => (
              <div
                className='MyTasks'
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {props.progressBarFlag ? (
                  <ProgressBar
                    setProgressBarFlag={props.setProgressBarFlag}
                    percent={Math.ceil(props.percentProgressBar)}
                  ></ProgressBar>
                ) : (
                  <></>
                )}
                {/* flagTree   */}
                {flagTree ? (
                  <>
                    {props.board[0] !== undefined && props.board.length !== 0 ? (
                      <>
                        <div
                          className={`kavT ${props.language !== 'English' ? 'english' : ''
                            }`}
                        ></div>
                        <div
                          className={`mySiteChois ${props.language !== 'English' ? 'english' : ''
                            }`}
                        >
                          {/* Show pack name if showing pack routes */}
                          {props.board[0].itemType === 'route' ? (
                            <span style={{ color: '#ba11b0' }}>
                              {props.board[0].pack ? props.board[0].pack : 'Pack Routes'}
                            </span>
                          ) : props.tasksOfRoutes && props.tasksOfRoutes.name ? (
                            props.tasksOfRoutes.name
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                    {props.board[0] === undefined && props.board.length === 0 ? (
                      <div></div>
                    ) : (
                      props.board.map((tag, keyCount) => {
                        if (tag !== undefined) {
                          // console.log("data",keyCount, tag);
                          const stationdata = props.stationArray.find((station) => station?.id === tag?.theStation?.id);
                          // {console.log("Station data", tag?.data,tag?.theStation)}
                          // {console.log("Station loops",  stationdata)}
                          return (saveTag = (
                            <Tag
                              selectedRoute={props.selectedRoute}
                              Station={stationdata}
                              keyCount={keyCount}
                              setLocation={setLocation}
                              location={location}
                              taskButtonColor={tag.color}
                              modalFlagTablet={modalFlagTablet}
                              title={tag.title}
                              subtitle={tag.subtitle}
                              id={tag.id}
                              data={tag.data}
                              picture_url={tag.picture_url}
                              audio_url={tag.audio_url}
                              key={keyCount}
                              flagBoard={true}
                              myLastStation={props.myStation.name}
                              myStation={tag.myStation}
                              myMarginTop={'-68px'}
                              count={count}
                              flag={tag.flag}
                              width={tag.width}
                              borderLeft={tag.borderLeft}
                              height={tag.height}
                              setKavTaskTopMarginTop={
                                tag.setKavTaskTopMarginTop
                              }
                              bottom={tag.bottom}
                              kavTopWidth={tag.kavTopWidth}
                              newkavTaskTop={tag.newkavTaskTop}
                              nameStation={tag.nameStation}
                              flagPhone={flagPhone}
                              flagTree={flagTree}
                              dragFromCover={'border'}
                              language={props.language}
                              openThreeDotsVertical={openThreeDotsVertical}
                              setOpenThreeDotsVertical={
                                setOpenThreeDotsVertical
                              }
                              openThreeDotsVerticalBoard={
                                openThreeDotsVerticalBoard
                              }
                              setOpenThreeDotsVerticalBoard={
                                setOpenThreeDotsVerticalBoard
                              }
                              requestForEditing={requestForEditing}
                              setRequestForEditing={setRequestForEditing}
                              requestForEditingBoard={requestForEditing}
                              setRequestForEditingBoard={
                                setRequestForEditingBoard
                              }
                            />
                          ));
                        }
                      })
                    )}
                    {flagPhoneOne ? (
                      <>
                        <div className='kavB'></div>
                      </>
                    ) : (
                      <>{/* <div className="kavBOne"></div> */}</>
                    )}
                  </>
                ) : (
                  <>
                    {/* flagPhone */}
                    {flagPhone ? (
                      <>
                        <Phone
                          modalFlagTablet={modalFlagTablet}
                          flagPhone={flagPhone}
                          board={props.board}
                          saveTag={saveTag}
                          count={count}
                          myStation={props.myStation}
                          flagTree={flagTree}
                          flagStress={flagStress}
                          mySite={props.mySite}
                          language={props.language}
                        />
                      </>
                    ) : (
                      <>
                        {modalFlagTablet ? (
                          <>
                            <Tablet
                              modalFlagTablet={modalFlagTablet}
                              flagPhone={flagPhone}
                              board={props.board}
                              saveTag={saveTag}
                              count={count}
                              myStation={props.myStation}
                              flagTree={flagTree}
                              flagStress={flagStress}
                              mySite={props.mySite}
                              language={props.language}
                            />
                          </>
                        ) : (
                          // (props.board[0] !== undefined) ? (<>

                          <ReorderBoard
                            board={props.board}
                            setBoard={props.setBoard}
                            language={props.language}
                          />
                          // </>) : <>error</>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </>

      {modalOpen ? (
        <ModalTasks
          setTaskForEdit={setTaskForEdit}
          uuid={taskUuidForEdit}
          requestForEditing={requestForEditing}
          handleClose={handleCloseRemove}
          language={props.language}
          setModalOpen={setModalOpen}
          setAllTasksOfTheSite={props.setAllTasksOfTheSite}
          setMyStation={props.setMyStation}
          myStation={getTheStation()}
          // setModalOpenNoSiteSelected={setModalOpenNoSiteSelected}
          allStations={props.stationArray}
          siteSelected={siteSelected}
          mySite={props.mySite}
          help={helpFlag}
          tasksOfChosenStation={props.tasksOfChosenStation}
          setTasksOfChosenStation={props.setTasksOfChosenStation}
          // title={getValueForProperty('title', '')}
          // subtitle={getValueForProperty('subtitle', '')}
          // stationOfTask={
          //   openThreeDotsVerticalBoard !== -1
          //     ? props.allTasks.find(
          //       (task) => task.id === openThreeDotsVerticalBoard
          //     ).stations
          //     : []
          // }
          // multi_language_description={props.multi_language_description}
          // estimatedTimeSeconds={getValueForProperty('estimatedTimeSeconds', 20)}
          // picture={getValueForProperty('picture_url', null)}
          // audio={getValueForProperty('audio_url', null)}
          title={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).title
              : ''
          }
          subtitle={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).subtitle
              : ''
          }
          estimatedTimeSeconds={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).estimatedTimeSeconds
              : 0
          }
          picture={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).picture_url
              : null
          }
          dataEntryLabel={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).dataEntryLabel
              : null
          }
          dataEntryValidation={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).dataEntryValidation
              : null
          }
          dataEntryType={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).dataEntryType
              : null
          }
          taskType={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).taskType
              : null
          }
          audio={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).audio_url
              : null
          }
          stationOfTask={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find((task) => task.id === openThreeDotsVerticalBoard)
                .stations
              : []
          }
          multi_language_description={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).multi_language_description
              : "{}"
          }
        />
      ) : (
        <></>
      )}

      <ModalDelete
        language={props.language}
        openRemove={openRemove}
        handleCloseRemove={handleCloseRemove}
        DialogTitle={t('plannerPage.Delete_Task')}
        DialogContent={t('plannerPage.Are_you_sure_you_want_to_delete_this_task')}
        handleCloseRemoveConfirm={handleCloseRemoveConfirm}
      />
    </>
  );
}
export default DragnDrop;

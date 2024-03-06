import React, { useState, useEffect } from 'react';
import Tag from '../Tag/Tag.js';
import ModalTasks from '../Modal/Modal_Tasks';
import Modal from '../Modal/Modal';
import Phone from '../Phone/Phone';
import Tablet from '../Tablet/Tablet';
import ReorderBoard from '../ReorderBoard/ReorderBoard';
import ProgressBar from '../ProgressBar/ProgressBar';
import ModalDelete from '../Modal/Modal_Delete';
import { deleteTask } from '../../api/api.js';
import { Droppable } from 'react-beautiful-dnd';
import './style.css';

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
  const [board, setBoard] = useState([]);
  const [, setReorderBoardFlag] = useState(true);
  const [openRemove, setOpenRemove] = useState(false);
  const [, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenAddRoute, setModalOpenAddRoute] = useState(false);
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
  const [activeButton, setActiveButton] = useState('tree');
  const [siteSelected, setSiteSelected] = useState(false);
  const [boardArrayDND, setBoardArrayDND] = useState([]);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [, setRequestForEditingBoard] = useState('');
  const [taskUuidForEdit, setTaskUuidForEdit] = useState('');
  const [taskForEdit, setTaskForEdit] = useState('');
  const [openThreeDotsVerticalBoard, setOpenThreeDotsVerticalBoard] = useState(-1);
  const [location, setLocation] = useState(-1);

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

    if (board.length > 0 && boardName !== '') {
      let taskMap;
      // Create a map for faster lookup
      if (boardName === 'routes') {
        taskMap = new Map(props.boardArrayDND.map((task) => [task.id, task]));
      } else if (boardName === 'tasks') {
        taskMap = new Map(
          props.tasksOfChosenStation.map((task) => [task.id, task])
        );
      }

      for (let index = 0; index < board.length; index++) {
        const updatedTask = taskMap.get(board[index].id);

        if (updatedTask) {
          Object.assign(board[index], {
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
    board,
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
          board.find((b) => b.id === taskForEdit.id).theStation.id
      );
      const updatedTasksBoardArrayDND = updateTask(taskForEdit, boardArrayDND);
      const newTasksBoardArrayDND = updateTaskDetails(
        updatedTasksBoardArrayDND,
        board
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
      const newBoard = updateTaskDetails(updatedTasksOfChosenStation, board);
      (() => {
        // props.setTasksOfChosenStation(updatedTasksOfChosenStation);
        props.allStations[indexStation].tasks = updatedTasksOfChosenStation;
      })();
      updatedTask = newBoard.find((task) => task.id === taskForEdit.id);
    }

    // updatedTask = updateTask(taskForEdit, board)
    // updatedTask = updateTaskDetails(updatedTask, board)

    if (updatedTask) {
      let existingTaskIndex = board.findIndex(
        (task) => task.id === updatedTask.id
      );
      if (existingTaskIndex !== -1) {
        board[existingTaskIndex] = updatedTask;
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
    let deleteTaskTemp = await deleteTask(openThreeDotsVerticalBoard);

    if (deleteTaskTemp !== undefined) {
      alert('המחיקה בוצעה בהצלחה!');
      const newTasks = [...props.tasksOfChosenStation];
      let indexaTask = props.tasksOfChosenStation.findIndex(
        (task) => task.id === openThreeDotsVerticalBoard
      );
      newTasks.splice(indexaTask, 1); // remove one element at index x
      props.setTasksOfChosenStation(newTasks);

      // const indexBoardTask = board.findIndex(
      //   (task) => task.id === openThreeDotsVerticalBoard
      // );
      // board.splice(indexBoardTask, 1); // remove one element at index x

      let indexStation = props.stationArray.findIndex(
        (station) => station.id === props.myStation.id
      );

      props.stationArray[indexStation].tasks = newTasks;
    }
    handleCloseRemove();
  };

  let prevStation = '';
  useEffect(() => { }, [props.percentProgressBar]);

  useEffect(() => {
    if (props.replaceRouteFlag) {
      setBoard([]);
    }
  }, [props.replaceRouteFlag]);

  useEffect(() => {
    if (props.replaceSiteFlag) {
      setBoard([]);
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
        props.boardArrayDND.length > 0
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

  //---------------------------------------------------------
  // const [{ isOver }, drop] = useDrop(() => ({
  //   accept: "image",
  //   drop(item, monitor) {
  //     const itemData = monitor.getItem();
  //     // const board = itemData.boardName
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

        setBoard((board) => [...board, Route]);
        setFlagTree(true);
      } else {
        Route = await dndArray?.find((tag) => id === tag.id);

        setBoard((board) => [...board, Route]);
        setFlagTree(true);
      }
      thisIdArray.push(Route.id);

      prevStation = myStation;
      localStorage.setItem('New_Routes', JSON.stringify(thisIdArray));
    }
  };

  const getValueForProperty = (property, fallbackValue) => {
    if (openThreeDotsVerticalBoard !== -1) {
      if (board.length > 0) {
        const task = board.find(
          (task) => task.id === openThreeDotsVerticalBoard
        );
        if (task && task[property] !== undefined) {
          return task[property];
        }
      }
    }
    return fallbackValue;
  };

  useEffect(() => {
    if (Object.keys(props.dropToBoard).length > 0) {
      if (
        props.dropToBoard.destination !== undefined &&
        props.dropToBoard.destination !== null &&
        props.dropToBoard.destination.droppableId === 'board-droppable'
      ) {
        addImageToBoard(props.dropToBoard.draggableId, 'tasks');
        setBoardName('tasks');
      }
      // props.setDropToBoard({});
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
    if (flagTree && board) {
      for (let i = 0; i < board.length; i++) {
        if (board[i].nameStation === '') {
          if (i === 0) {
            board[i].nameStation = board[i].myStation;
            board[i].borderLeft = '0x solid #c2bfbf';
            board[i].width = '-13px';
            board[i].height = '70px';
            board[i].bottom = '-27px';
            board[i].kavTopWidth = '25px';
            board[i].newkavTaskTop = '0px';
            board[i].kavTaskTopMarginTop = '-7px';
          } else if (board[i].myStation !== board[i - 1].myStation) {
            board[i].nameStation = board[i].myStation;
            board[i].borderLeft = '0x solid #c2bfbf';
            board[i].width = '-13px';
            board[i].height = '70px';
            board[i].bottom = '-27px';
            board[i].kavTopWidth = '25px';
            board[i].newkavTaskTop = '0px';
            board[i].kavTaskTopMarginTop = '-7px';
          }
        } else {
          if (i !== 0 && board[i].myStation === board[i - 1].myStation) {
            board[i].nameStation = '';
            board[i].width = '-84px';
            board[i].borderLeft = '2x solid #c2bfbf';
            board[i].height = '86px';
            board[i].bottom = '45px';
            board[i].kavTopWidth = '0px';
            board[i].newkavTaskTop = '100px';
            board[i].kavTaskTopMarginTop = '-27px';
          }
        }
      }
    }
  }, [board, flagTree]);

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
          tasksForNewRoute={board}
        />
      )}
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
            {/* כפתור שפות */}
            <button
              className='language'
              // style={{ marginLeft: marginHebrew, marginTop: "22px" }}
              onClick={() => {
                if (props.Hebrew !== false) props.hebrew();
                else props.english();
              }}
            >
              {props.language}
            </button>
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
                    {board[0] !== undefined && board.length !== 0 ? (
                      <>
                        <div
                          className={`kavT ${props.language !== 'English' ? 'english' : ''
                            }`}
                        ></div>
                        <div
                          className={`mySiteChois ${props.language !== 'English' ? 'english' : ''
                            }`}
                        >
                          {props.tasksOfRoutes && props.tasksOfRoutes.name ? (
                            props.tasksOfRoutes.name
                          ) : (
                            <></>
                          )}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                    {board[0] === undefined && board.length === 0 ? (
                      <div></div>
                    ) : (
                      board.map((tag, keyCount) => {
                        if (tag !== undefined) {
                          // console.log(keyCount, tag);
                          return (saveTag = (
                            <Tag
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
                          board={board}
                          saveTag={saveTag}
                          count={count}
                          myStation={props.myStation}
                          flagTree={flagTree}
                          flagStress={flagStress}
                          mySite={props.mySite}
                        />
                      </>
                    ) : (
                      <>
                        {modalFlagTablet ? (
                          <>
                            <Tablet
                              modalFlagTablet={modalFlagTablet}
                              flagPhone={flagPhone}
                              board={board}
                              saveTag={saveTag}
                              count={count}
                              myStation={props.myStation}
                              flagTree={flagTree}
                              flagStress={flagStress}
                              mySite={props.mySite}
                            />
                          </>
                        ) : (
                          // (board[0] !== undefined) ? (<>

                          <ReorderBoard
                            board={board}
                            setBoard={setBoard}
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
          title={getValueForProperty('title', '')}
          subtitle={getValueForProperty('subtitle', '')}
          stationOfTask={
            openThreeDotsVerticalBoard !== -1
              ? props.allTasks.find(
                (task) => task.id === openThreeDotsVerticalBoard
              ).stations
              : []
          }
          estimatedTimeSeconds={getValueForProperty('estimatedTimeSeconds', 20)}
          picture={getValueForProperty('picture_url', null)}
          audio={getValueForProperty('audio_url', null)}
        />
      ) : (
        <></>
      )}

      <ModalDelete
        openRemove={openRemove}
        handleCloseRemove={handleCloseRemove}
        DialogTitle={'מחיקת משימה'}
        DialogContent={'האם אתה בטוח במחיקת המשימה?'}
        handleCloseRemoveConfirm={handleCloseRemoveConfirm}
      />
    </>
  );
}
export default DragnDrop;

import React, { useState, useEffect } from 'react';
import Tag from '../Tag/Tag.js';
// import { useDrop } from "react-dnd";
import './style.css';
import ModalTasks from '../Modal/Modal_Tasks';
import Modal from '../Modal/Modal';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';
import { AiFillCheckCircle } from 'react-icons/ai';
import Phone from '../Phone/Phone';
import Tablet from '../Tablet/Tablet';
import ReorderBoard from '../ReorderBoard/ReorderBoard';
import Dot from '../Dot/Dot';
import Clock from '../Clock/Clock';
import textArea from '../../Pictures/textArea.svg';
import ProgressBar from '../ProgressBar/ProgressBar';
import Modal_Delete from '../Modal/Modal_Delete';
import { deleteTask } from '../../api/api.js';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

let Route = [];
let newBoard = [];
let dndArray = [];
let saveProps = [];
let thisId = '';
let thisIdArray = [];
let myTask = {};
let helpFlag = false;
let count = 0;
let width = '-13px';
let height = '70px';
let nameStation = '14px';
let bottom = '-27px';
let kavTopWidth = '25px';
// let newkavTaskTop = '100px';
let saveTag = {};
let count1 = 0;
let kavTaskTopMarginTop = '-7px';
let borderLeft = '2px solid #c2bfbf';
let flagPhone = false;
// let flagTablet = false;
let flagPhoneOne = false;
let flagStress = false;
let modalFlagTablet = false;
let myStation = '';
let currentIndex = 0;
let countTemp = 0;
//-------------------------
function DragnDrop(props) {
  console.log(' props.allTasksOfTheSiteeee drag ', props.allTasksOfTheSite);
  console.log(' props.allTasks 1: ', props.allTasksOfTheSite);

  const [board, setBoard] = useState([]);
  const [newboard, setnewBoard] = useState([]);
  const [reorderBoardFlag, setReorderBoardFlag] = useState(true);
  const [openRemove, setOpenRemove] = React.useState(false);

  console.log('props mySite:', props.mySite);
  console.log('props dragFrom:', props.dragFrom);
  console.log('props.myStation:', props.myStation);

  // console.log("JSON.parse(localStorage.getItem('New_Routes')):", JSON.parse(localStorage.getItem('New_Routes')))
  console.log('propsDataTask:', props.tasksOfChosenStation);
  // nameStation = props.myStation.name
  // const [, setFlagFirst] = useState(true)
  const [, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenNoSiteSelected, setModalOpenNoSiteSelected] = useState(false);
  const [modalOpenAddRoute, setModalOpenAddRoute] = useState(false);
  const [, setModalFlagTablet] = useState(false);

  // const [, setHelpFlag] = useState(false);

  const [, setCount] = useState(0);
  const [get_Name] = useState(null); // for TextView
  const [flagTree, setFlagTree] = useState(false);
  const [, setFlagPhone] = useState(false);
  // const [, setFlagTablet] = useState(false);
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
  // const [prevStation,setPrevStation] = useState("test");
  console.log(' props.boardArrayDND1 ', props.boardArrayDND);
  const [boardArrayDND, setboardArrayDND] = useState(props.boardArrayDND);

  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');

  const [openThreeDotsVerticalBoard, setOpenThreeDotsVerticalBoard] =
    useState(-1);
  const [requestForEditingBoard, setRequestForEditingBoard] = useState('');
  const [taskUuidForEdit, setTaskUuidForEdit] = useState('');
  const [taskForEdit, setTaskForEdit] = useState('');

  useEffect(() => {
    console.log('stations requestForEditing: ', requestForEditing);
    console.log('stations openThreeDotsVertical: ', openThreeDotsVertical);

    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      console.log('openThreeDotsVertical', openThreeDotsVertical);
      setTaskUuidForEdit(openThreeDotsVertical);
      setModalOpen(true);
    } else if (requestForEditing === 'duplication') {
      console.log('openThreeDotsVertical', openThreeDotsVertical);
    } else if (requestForEditing === 'delete') {
      setOpenRemove(true);
      //Modal_Delete
    }
  }, [requestForEditing]);

  useEffect(() => {
    if (taskForEdit !== '') {
      console.log('task for edit', taskForEdit);
      editTask();
    }
  }, [taskForEdit]);

  const editTask = () => {
    const updatedTasks = props.allTasksOfTheSite.map((task) => {
      if (task.id === taskForEdit.id) {
        return taskForEdit;
      }
      return task;
    });

    console.log('task: ', updatedTasks);

    props.setAllTasksOfTheSite(updatedTasks);
    // setTaskForEdit("");
  };

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };
  const handleCloseRemoveConfirm = async () => {
    console.log('DELETE:'); //, stationArray[openThreeDotsVertical].id);

    let deleteTaskTemp = await deleteTask(openThreeDotsVertical);

    console.log('deleteTaskTemp:', deleteTaskTemp);
    console.log(' props.tasksOfChosenStation:', props.tasksOfChosenStation);
    console.log(' props.tasksOfChosenStation:', props.tasksOfChosenStation);

    if (deleteTaskTemp !== undefined) {
      alert('המחיקה בוצעה בהצלחה!');
      const newTasks = [...props.tasksOfChosenStation];
      let indexaTask = props.tasksOfChosenStation.findIndex(
        (task) => task.id === openThreeDotsVertical
      );
      newTasks.splice(indexaTask, 1); // remove one element at index x
      props.setTasksOfChosenStation(newTasks);

      let indexStation = props.stationArray.findIndex(
        (station) => station.id === props.myStation.id
      );
      console.log('indexStation 123', indexStation);

      props.stationArray[indexStation].tasks = newTasks;
      console.log('newTasks 123', newTasks);
      console.log('dndArray 123', dndArray);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  let prevStation = '';
  useEffect(() => {
    console.log('percent: ', props.percentProgressBar);
  }, [props.percentProgressBar]);

  useEffect(() => {
    if (props.replaceRouteFlag) {
      setBoard([]);
    }
  }, [props.replaceRouteFlag]);

  useEffect(() => {
    console.log('Replace ***', props.replaceSiteFlag);
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
    console.log('props.tasksOfRoutes ', props.tasksOfRoutes);
    setBoard([]);
    if (props.tasksOfRoutes && props.tasksOfRoutes.tasks) {
      console.log('props.tasksOfRoutes ', props.tasksOfRoutes);
      countTemp = 50 / props.tasksOfRoutes.tasks.length;
      // props.setProgressBarFlag(true)
      if (props.tasksOfRoutes.tasks) {
        props.tasksOfRoutes.tasks.forEach((element, index) => {
          addImageToBoard(element.taskId, 'routes');
          props.setPercentProgressBar(
            (percentProgressBar) => percentProgressBar + countTemp
          );
        });
      }
      // props.setProgressBarFlag(false)
    }
  }, [props.tasksOfRoutes]);

  useEffect(() => {
    console.log('props.progressBarFlag: ', props.progressBarFlag);
  }, [props.progressBarFlag]);

  // dndArray = props.tasksOfChosenStation.map((element) => {
  //   // let color = stationArray.find(item => item.id === stationID).color

  //   if (count1 === 0) {
  //     nameStation = props.myStation.name;
  //     count1++;
  //   }
  //   return {
  //     id: element.id,
  //     title: element.title.replace('&#8211;', '-').replace('&#8217;', "' "),
  //     mySite: props.mySite,
  //     myStation: props.myStation.name,
  //     data: props.myStation.data,
  //     nameStation: nameStation,
  //     width: width,
  //     borderLeft: borderLeft,
  //     height: height,
  //     kavTaskTopMarginTop: kavTaskTopMarginTop,
  //     bottom: bottom,
  //     kavTopWidth: kavTopWidth,
  //     newkavTaskTop: newkavTaskTop,
  //     // idImg: thisId,
  //     dataImg: element.picture_url,
  //     color: element.color,
  //   };
  // });

  // Set the nameStation value outside the map function
  let nameStation = props.myStation.name;

  const mapTask = (element) => {
    console.log(`mnmn: ${element.subtitle}`);
    return {
      id: element.id,
      title: element.title.replace('&#8211;', '-').replace('&#8217;', "' "),
      desc: element.subtitle,
      mySite: props.mySite,
      myStation: props.myStation.name,
      data: props.myStation.data,
      nameStation: nameStation,
      width: width,
      borderLeft: borderLeft,
      height: height,
      kavTaskTopMarginTop: kavTaskTopMarginTop,
      bottom: bottom,
      kavTopWidth: kavTopWidth,
      newKavTaskTop: newkavTaskTop,
      dataImg: element.picture_url,
      color: props.stationColor,
    };
  };

  let dndArray = props.tasksOfChosenStation.map(mapTask);

  console.log('dndArray check:', dndArray);
  //---------------------------------------------------------
  // const [{ isOver }, drop] = useDrop(() => ({
  //   accept: "image",
  //   drop(item, monitor) {
  //     const itemData = monitor.getItem();
  //     // const board = itemData.boardName
  //     // const id = itemData.id
  //     console.log("item.board: ", itemData.boardName);
  //     addImageToBoard(itemData.id, itemData.boardName);
  //   },
  //   collect: (monitor) => ({
  //     isOver: !!monitor.isOver(),
  //   }),
  // }));

  useEffect(() => {
    console.log('board111: ', board);
  }, [board]);
  
  // useEffect(() => {
  //   setnewBoard(board)
  //   console.log('k- Route: ', Route);
  //   console.log('k- newboard: ', newboard);
  //   //  setBoard(props.boardArrayDND);
  //   // thisIdArray=[];
  // }, [Route]);
  //---------------------------------------------------------
  const addImageToBoard = (id, boardName) => {
    console.log('id alltasks: ', id);
    console.log('boardName alltasks: ', boardName);

    if (boardName !== 'border') {
      if (saveTag.props !== undefined) {
        console.log('saveTag.props.myStation DND', saveTag);
        console.log(
          'saveTag.props.myLastStation dnd',
          saveTag.props.myLastStation
        );

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
      // console.log(
      //   " props.allTasks ",
      //   props.allTasksOfTheSite.find((task) => task.id === id)
      // );

      setCount(count++);
      // alert(count)
      // setFlagFirst(flagFirst = false)
      if (boardName === 'routes') {
        console.log('khalid id boardArrayDND: ', id);

        Route = props.boardArrayDND.find((tag) => id === tag.id);

        console.log('khalid Route boardArrayDND: ', Route);

        // newBoard = board.slice();
        newBoard.unshift(Route);

        setBoard(newBoard);
        //setBoard(board => [...board, newBoard]);

        // setBoard(props.boardArrayDND)
        setFlagTree(true);
      } else {
        Route = dndArray.find((tag) => id === tag.id);
        // newBoard = board.slice();
        newBoard.unshift(Route);

        setBoard(newBoard);
        // setBoard(board => [...board, newBoard]);

        // setBoard(props.boardArrayDND)
        setFlagTree(true);
      }
      // if (props.boardArrayDND.length > 0) {
      //   console.log("id boardArrayDND: ", id);

      //   Route = await props.boardArrayDND.filter((tag) => id === tag.id);

      //   console.log("Route boardArrayDND: ", Route);

      //   await setBoard((board) => [...board, Route[0]]);
      // } else {
      //   Route = await dndArray.filter((tag) => id === tag.id);
      //   await setBoard((board) => [...board, Route[0]]);
      // }

      console.log('khalid dnd Route: ', Route);

      // setBoard((board) => [...board, Route[0]]);

      console.log('khalid dnd setBoard: ', board);
      // thisIdArray.push(thisId);
      //myTask = saveProps.tasksOfChosenStation.find((item) => item.id === id);
      // console.log("myTAsk:", myTask[0])
      //thisIdArray.push(myTask[0]);
      thisIdArray.push(Route.id);

      prevStation = myStation;
      console.log("thisIdArray:", thisIdArray)
      // console.log("dndArray:", dndArray)
      localStorage.setItem('New_Routes', JSON.stringify(thisIdArray));
      // localStorage.setItem("MySite", JSON.stringify(props.mySite));
    }
  };

  useEffect(() => {
    if (Object.keys(props.dropToBoard).length > 0) {
      console.log('result: ', props.dropToBoard);
      if (
        props.dropToBoard.destination !== undefined &&
        props.dropToBoard.destination !== null &&
        props.dropToBoard.destination.droppableId === 'board-droppable'
      )
        addImageToBoard(props.dropToBoard.draggableId, 'tasks');
      // props.setDropToBoard({});
    }
  }, [props.dropToBoard]);

  const treeFunction = (e) => {
    setFlagPhone((flagPhone = false));
    // setFlagTablet(flagTablet = false)
    setModalFlagTablet((modalFlagTablet = false));
    setFlagTree(true);
    setReorderBoardFlag(false);
    // alert("tree")
    // alert(flagPhone)
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

            {/* <div className='my_Buttons_icons'>
                                <button className='tree'></button>
                                <div className='kavIconsTree'></div>
                                <button className='watch'></button>
                                <div className='kavIconsWatch'></div>
                                <button className='phone'></button>
                                <div className='kavIconsPhone'></div>
                                <button className='tablet'></button>
                                <div className='kavIconsTablet'></div>
                                <button className='computer'></button>
                            </div> */}
            <div
              className={`my_Buttons_icons ${
                props.language !== 'English' ? 'english' : ''
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
                className={
                  'phone' + (activeButton === 'phone' ? ' active' : '')
                }
                onClick={phoneFunction}
              ></button>
              <button
                className={
                  'tablet' + (activeButton === 'tablet' ? ' active' : '')
                }
                onClick={tabletFunction}
              ></button>
              <button
                className={
                  'watch' + (activeButton === 'watch' ? ' active' : '')
                }
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
                      {board !== undefined && board.length !== 0 ? (
                        <>
                          <div
                            className={`kavT ${
                              props.language !== 'English' ? 'english' : ''
                            }`}
                          ></div>
                          <div
                            className={`mySiteChois ${
                              props.language !== 'English' ? 'english' : ''
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
                      {board === undefined && board.length === 0 ? (
                        <div></div>
                      ) : (

                        board.map((tag, keyCount) => {
                          console.log("khalid board : " + board);
                          console.log('khalid tag.id: ', tag.id);
                          return (saveTag = (
                            <Tag
                              taskButtonColor={tag.color}
                              modalFlagTablet={modalFlagTablet}
                              title={tag.title}
                              desc={tag.desc}
                              id={tag.id}
                              data={tag.data}
                              // idImg={tag.id}
                              dataImg={tag.dataImg}
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

                          {/* --------------------------------------------------- */}

                          {/* --------------------------------------------------- */}
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
                            <>
                              <ReorderBoard
                                board={board}
                                setBoard={setBoard}
                                language={props.language}
                              />
                            </>
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
        {/* // )} */}
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
          myStation={props.myStation}
          // setModalOpenNoSiteSelected={setModalOpenNoSiteSelected}
          allStations={props.stationArray}
          siteSelected={siteSelected}
          mySite={props.mySite}
          help={helpFlag}
          title={
            openThreeDotsVertical !== -1
              ? dndArray.find((task) => task.id === openThreeDotsVertical).title
              : ''
          }
          subtitle={
            openThreeDotsVertical !== -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).subtitle
              : ''
          }
          stationOfTask={
            openThreeDotsVertical !== -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).stations
              : ''
          }
        />
      ) : (
        <></>
      )}

      <Modal_Delete
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

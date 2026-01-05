import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getingDataTasks, deleteStation, insertLoop,updateLoop } from '../../../api/api';
import './style.css';
import ModalStations from '../Modal/Modal_Stations';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';
import '@fontsource/assistant';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import textArea from '../../../Pictures/textArea.svg';
import Modal_dropdown from '../Modal/Modal_dropdown';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Modal_Delete from '../Modal/Modal_Delete';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import DragnDrop from '../DragnDrop/DragnDrop';
import { useNotification } from "../../../components/Notification/NotificationProvider";
import LoopPopUpInput from './../../../components/LoopPopUpInputs/LoopPopUpInput';

//-----------------------
// let allTasks = [];
let tasks = [];
let filteredData = [];
let inputText = '';
let flagFirstTime = true;
let myStation = { name: '', id: '', flag: true, data: [] };
let myCategory = 'stationCategory';
//-----------------------
const Stations = (props) => {
  const { t } = useTranslation();
  const [, setStateTask] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [, setFilteredData] = useState([]);
  const [, setInputText] = useState('');
  const [, setFlagFirstTime] = useState(false);
  const [, setMyStation] = useState(null);
  const [modalIconsOpen, setModalIconsOpen] = useState(false);
  const [myRouteClick, setMyRouteClick] = useState(0);
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openRemove, setOpenRemove] = React.useState(false);
  // const [tasksOfChosenStation, setTasksOfChosenStation] = useState([]);
  const [stationForDelete, setStationForDelete] = useState('');
  const [stationForEdit, setStationForEdit] = useState('');
  const [dpcolor, setdpcolor] = useState('');
  const [isLoopPopupOpen, setIsLoopPopupOpen] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    // console.log('Opening loop popup for station index:', openThreeDotsVertical);
    // console.log('Station details:', requestForEditing);
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setStationForEdit(openThreeDotsVertical);
      setModalOpen(true);
    } else if (requestForEditing === 'duplication') {
      setStationForEdit(openThreeDotsVertical);
      setModalOpen(true);
    } else if (requestForEditing === 'delete') {
      setStationForDelete(openThreeDotsVertical);
      setOpenRemove(true);
    }
    else if (requestForEditing === 'loop') {
      // console.log('Opening loop popup for station index:', openThreeDotsVertical);
      // console.log('Station details:', requestForEditing);

      setStationForEdit(openThreeDotsVertical);
      setIsLoopPopupOpen(true);
    }
  }, [requestForEditing]);

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };
  const handleCloseRemoveConfirm = async () => {
    try {
      let deleteStationTemp = await deleteStation(
        props.stationArray[stationForDelete].id
      );

      if (deleteStationTemp.status === 200) {
        // alert('המחיקה בוצעה בהצלחה!');
        showNotification('success', t('plannerPage.Station_deleted_successfully'));
        const newStations = [...props.stationArray];
        newStations.splice(stationForDelete, 1);
        props.setStationArray(newStations);
      }

      setOpenRemove(false);
      setOpenThreeDotsVertical(-1);
      setRequestForEditing('');
    } catch (error) {
      console.error(error);
      showNotification('error', t('plannerPage.Error_deleting_station') + error);
    }
  };

  //changing the order of the stations
  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(props.stationArray);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    props.setStationArray(items);
  }

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  if (flagFirstTime === true) {
    filteredData = props.stationArray;
  }

  // handle search station name
  let inputHandler = (e) => {
    setInputText((inputText = e.target.value.toLowerCase()));
    setFlagFirstTime((flagFirstTime = false));
    //convert input text to lower case
    // setFilteredData(filteredData = [])
    setFilteredData(
      (filteredData = props.stationArray.filter((el) => {
        if (inputText === '') {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.title.toLowerCase().includes(inputText);
        }
      }))
    );
  };

  const Display_The_Tasks = (e, n) => {
    // if (myStation.id === e) {
    //   setMyStation((myStation.flag = false));
    // } else {
    //   setMyStation((myStation.flag = true));
    // }
    if (props.tasksOfChosenStation.length === 0 || typeof e !== 'string') {
      props.setTasksOfChosenStation([]);
      setMyStation((myStation.data = []));
      setStateTask({ data: [] });
    }

    if (typeof e === 'string')
      setMyStation((myStation.data = props.stationArray));

    setMyStation((myStation.name = n));
    setMyStation((myStation.id = e));
    (() => {
      props.setChosenStation(myStation);
    })();

    let stationTemp = props.stationArray.find((station) => station.id === e);

    if (stationTemp) {
      props.setTasksOfChosenStation(stationTemp.tasks);
      // setTasksOfChosenStation(stationTemp.tasks);
    }

    // stationTemp.tasks.map((task) => tasksOfChosenStation.push(task));
    setFilteredData(
      (filteredData = props.stationArray.filter((el) => {
        if (inputText === '') {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.title.toLowerCase().includes(inputText);
        }
      }))
    );
    setStateTask({ data: props.tasksOfChosenStation }); //Updating the state
  };

  const handleLoopClick = () => {
    setIsLoopPopupOpen(true);
  };

  const handleCloseLoop = () => {
    setIsLoopPopupOpen(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
    setStationForEdit(-1);
  };
    // Add loop data to the station
    // const updatedStations = [...props.stationArray];
    // updatedStations[stationForEdit] = {
    //   ...updatedStations[stationForEdit],
    //   loops: updatedStations[stationForEdit].loops.map(loop => {
    //     if (loop.routeId === props.selectedRoute) {
    //       return {
    //         ...loop,
    //         duration: Number.parseInt(data.duration),
    //         endTime: data.endTime,//from string to date new Date
    //         iterations: Number.parseInt(data.iterations),
    //       };
    //     }
    //     return loop;
    //   })
    // };

    // // Update the station array
    // props.setStationArray(updatedStations);

    // // Update the board with the new station data
    // const updatedBoard = props.board.map(tag => {
    //   if (
    //     // tag.theStation.id === updatedStations[stationForEdit].id
    //     // &&
    //     tag.theStation.id === props.stationArray[stationForEdit].id
    //   ) {
    //     return {
    //       ...tag,
    //       theStation: {
    //         ...tag.theStation,
    //         loops: {
    //           duration: Number.parseInt(data.duration),
    //           endTime: data.endTime,
    //           iterations: Number.parseInt(data.iterations),
    //         }
    //       }
    //     };
    //   }
    //   return tag;
    // });
    // props.setBoard(updatedBoard);
  const handleLoopSubmit = async (data) => {
    // Update selectedRoute.loops immutably
    const stationId = props.stationArray[stationForEdit]?.id;

    if (props.selectedRoute && stationId) {
      // Absolute order across the entire board
      const globalOrder = (props.board ?? []).map(item => item?.id).filter(Boolean);

      const stationTasks = props.stationArray[stationForEdit]?.tasks ?? [];
      const getPos = (id) => {
        const idx = globalOrder.indexOf(id);
        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
      };

      // Order station tasks by absolute position on the board
      const orderedTaskIds = stationTasks
        .slice()
        .sort((a, b) => getPos(a.id ?? a.taskId) - getPos(b.id ?? b.taskId))
        .map(t => t.id ?? t.taskId)
        .filter(id => globalOrder.includes(id)); // only tasks that exist on the board

      // Compute start/end indices in props.board (0-based)
      let startingTaskIndex = 0;
      let endingTaskIndex = 0;

      if (orderedTaskIds.length > 0) {
        const firstIndices = orderedTaskIds.map(id => globalOrder.indexOf(id));
        startingTaskIndex = Math.min(...firstIndices);
        // defensive: if duplicates ever appear on the board
        endingTaskIndex = Math.max(...orderedTaskIds.map(id => globalOrder.lastIndexOf(id)));
      }

      const currentLoops = Array.isArray(props.selectedRoute.loops)
        ? [...props.selectedRoute.loops]
        : [];

      // Support both 'stationid' and 'stationId'
      const idx = currentLoops.findIndex(l => (l.stationid ?? l.stationId) === stationId);

      const newLoop = {
        routeId: props.selectedRoute.id,
        stationid: stationId, // keep local shape consistent with your UI usage
        loopDuration: parseInt(data.duration, 10),
        loopUntil: data.endTime,
        loopIteration: parseInt(data.iterations, 10),
        startingTaskIndex,
        endingTaskIndex,
      };

      const updatedLoops = idx >= 0
        ? currentLoops.map((l, i) => (i === idx ? { ...l, ...newLoop } : l))
        : [...currentLoops, newLoop];

      const updatedRoute = { ...props.selectedRoute, loops: updatedLoops };

      if (typeof props.setSelectedRoute === 'function') {
        props.setSelectedRoute(updatedRoute);
      }

      if (typeof props.setBoard === 'function') {
        props.setBoard(prev =>
          prev.map(tag => {
            const routeId = tag?.route?.id ?? tag?.routeId;
            return routeId === updatedRoute.id ? { ...tag, route: updatedRoute } : tag;
          })
        );
      }

      // Persist to server: insert or update
      try {
        const body = {
          routeId: props.selectedRoute?.id,
          stationId,
          taskIds: orderedTaskIds,
          loopIteration: parseInt(data?.iterations, 10),
          loopUntil: data?.endTime,
          loopDuration: parseInt(data?.duration, 10),
          startingTaskIndex,
          endingTaskIndex,
        };

        let res;
        // Try to get an existing loop id (could be 'id' or 'loopId')
        const existingLoopId = idx >= 0 ? (currentLoops[idx]?.id ?? currentLoops[idx]?.loopId) : undefined;

        if (idx >= 0 && existingLoopId) {
          // Correct: updateLoop(loopId, loopData)
          res = await updateLoop(existingLoopId, body);
        } else {
          res = await insertLoop(body);
        }

        if (res?.status >= 200 && res?.status < 300) {
          showNotification(
            'success',
           t('plannerPage.Loop_settings_saved_successfully')
          );
        } else {
          throw new Error(`HTTP ${res?.status}`);
        }
      } catch (e) {
        console.error(e);
        showNotification(
          'error',
          t('plannerPage.Error_saving_loop_settings')
        );
      }
    }

    setIsLoopPopupOpen(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
    setStationForEdit(-1);
  };
  //----------------------------------------------------------
  return (
    <>
      {/* {loading && <div>Loading</div>} */}
      {!loading && (
        <>
          {modalOpen && (
            <ModalStations
              stationIndex={stationForEdit}
              setStationArray={props.setStationArray}
              stationArray={props.stationArray}
              setOpenModalPlaces={setModalOpen}
              idTasks={props.idTask}
              mySite={props.mySite}
              pastelColors={props.pastelColors}
              language={props.language}
              requestForEditing={requestForEditing}
              setRequestForEditing={setRequestForEditing}
              setOpenThreeDotsVertical={setOpenThreeDotsVertical}
            />
          )}

          <div className='Cover_Stations'>
            <>
              <div className='TitleStation'>
                <div
                  className={`MyTitle text ${props.language !== 'English' ? 'english' : ''
                    }`}
                >
                  {' '}
                  {props.stationsName}
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
                padding: '13px 0px 13px 0px',
              }}
            >
              <input
                className={`searchButton ${props.language !== 'English' ? 'english' : ''}`}
                dir='rtl'
                placeholder={
                  t('plannerPage.Search_station')
                }
                label={<CgSearch style={{ fontSize: 'x-large' }} />}
                onChange={inputHandler}
              ></input>
            </div>
            <div className='Stations'>
              {props.stationArray.length > 0 ? ( //DND
                <>
                  < >
                    <Droppable droppableId='stationArray'>
                      {(provided) => (
                        <ul
                          className='stationArray'
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {filteredData.map(({ id, title, color }, index) => {
                            let ID = '' + id;
                            return (
                              <Draggable
                                key={ID}
                                draggableId={ID}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    className='draggableItems'
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => {
                                      Display_The_Tasks(id, title);
                                      props.settaskcolor(color);
                                      setdpcolor(color);
                                    }}
                                  >
                                    <div
                                      className='buttons'
                                      style={{
                                        border:
                                          id === myStation.id
                                            ? '1px solid #cc0127'
                                            : '',
                                        background:
                                          props.language === 'English'
                                            ? `linear-gradient(270deg, ${color} 7%, #ffffff 1%)`
                                            : `linear-gradient(90deg, ${color} 7%, #ffffff 1%)`,
                                        flexDirection:
                                          props.language === 'English'
                                            ? 'row'
                                            : 'row-reverse',
                                        textAlignLast:
                                          props.language === 'English'
                                            ? 'end'
                                            : 'left',
                                      }}
                                      key={index}
                                    >
                                      <div className='dropdownThreeDots'>
                                        <button
                                          className='threeDotsVerticalEng'
                                          onClick={() =>
                                            clickOnhreeDotsVerticaIcont(index)
                                          }
                                        >
                                          {id !== 0 ? (
                                            <BsThreeDotsVertical />
                                          ) : (
                                            <></>
                                          )}
                                        </button>

                                        {openThreeDotsVertical === index ? (
                                          <Modal_dropdown
                                            language={props.language}
                                            setRequestForEditing={
                                              setRequestForEditing
                                            }
                                            setOpenThreeDotsVertical={
                                              setOpenThreeDotsVertical
                                            }
                                            editable={true}
                                            Reproducible={true}
                                            details={true}
                                            erasable={true}
                                            loop={true}
                                          />
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                      <button
                                        className='nameOfButton'

                                      >
                                        {title}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </>
                </>
              ) : (
                <div
                  className={`textBeforeStation ${props.language !== 'English' ? 'english' : ''}`}
                  style={{
                    backgroundImage: `url(${textArea})`,
                  }}
                >
                  <div
                    className={`textBeforeStationtext ${props.language !== 'English' ? 'english' : ''}`}>
                    {props.stationsBeforeChoosingSite}
                  </div>
                </div>
              )}
            </div>
            <div className='addStationCover'>
              <button
                className='AddButton'
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                <AiOutlinePlus className='plus' />
              </button>
            </div>
          </div>
          {/* <DndProvider backend={HTML5Backend}> */}
          <DragnDrop
            selectedRoute={props.selectedRoute}
            board={props.board}
            setBoard={props.setBoard}
            filteredDataRoutes={props.filteredDataRoutes}
            setFilteredDataRoutes={props.setFilteredDataRoutes}
            setTranslateData={props.setTranslateData}
            dropToBoard={props.dropToBoard}
            setDropToBoard={props.setDropToBoard}
            setStationArray={props.setStationArray}
            percentProgressBar={props.percentProgressBar}
            setPercentProgressBar={props.setPercentProgressBar}
            progressBarFlag={props.progressBarFlag}
            setProgressBarFlag={props.setProgressBarFlag}
            replaceRouteFlag={props.replaceRouteFlag}
            replaceSiteFlag={props.replaceSiteFlag}
            firstStationName={props.firstStationName}
            boardArrayDND={props.boardArrayDND}
            chosenStation={props.chosenStation}
            tasksOfChosenStation={props.tasksOfChosenStation}
            setTasksOfChosenStation={props.setTasksOfChosenStation}
            allStations={props.allStations}
            allTasks={props.allTasks}
            language={props.language}
            myTasks={props.myTasks}
            drag={props.drag}
            addMyTask={props.addMyTask}
            titleTaskCss={props.titleTaskCss}
            mySite={props.mySite}
            myStation={myStation}
            flagHebrew={props.flagHebrew}
            tasksOfRoutes={props.tasksOfRoutes}
            stationArray={props.stationArray}
            saveButton={props.saveButton}
            siteQuestionLanguage={props.siteQuestionLanguage}
            tasksBeforeChoosingSite={props.tasksBeforeChoosingSite}
            allTasksOfTheSite={props.allTasksOfTheSite}
            setAllTasksOfTheSite={props.setAllTasksOfTheSite}
            setMyStation={setMyStation}
            hebrew={props.hebrew}
            english={props.english}
            Hebrew={props.Hebrew}
            stationColor={dpcolor}
            Packs={props.Packs}  // Make sure this is passed
            selectedPack={props.selectedPack} // Make sure this is passed
          />
          {/* </DndProvider> */}
        </>
      )}

      <Modal_Delete
        language={props.language}
        openRemove={openRemove}
        handleCloseRemove={handleCloseRemove}
        DialogTitle={t('plannerPage.Delete_Station')}
        DialogContent={t('plannerPage.Are_you_sure_you_want_to_delete_this_station')}
        handleCloseRemoveConfirm={handleCloseRemoveConfirm}
      />
      <LoopPopUpInput
        isOpen={isLoopPopupOpen}
        onClose={handleCloseLoop}
        onSubmit={handleLoopSubmit}
        station={props.stationArray[stationForEdit]}
        selectedRoute={props.selectedRoute}
      />
    </>
  );
};
export default Stations;
//----------------------------------------

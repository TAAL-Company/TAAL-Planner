import React, { useState, useEffect } from 'react';
import { getingDataTasks, deleteStation } from '../../api/api';
import './style.css';
import ModalStations from '../Modal/Modal_Stations';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgSearch } from 'react-icons/cg';
import '@fontsource/assistant';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import textArea from '../../Pictures/textArea.svg';
import Modal_dropdown from '../Modal/Modal_dropdown';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Modal_Delete from '../Modal/Modal_Delete';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import DragnDrop from '../DragnDrop/DragnDrop';

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
  console.log('yyy props.allStations ', props.allStations);
  console.log('props.stationArray: ', props.stationArray);

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
  const [tasksOfChosenStation, setTasksOfChosenStation] = useState([]);
  const [stationForDelete, setStationForDelete] = useState('');
  const [stationForEdit, setStationForEdit] = useState('');
  const [dpcolor, setdpcolor] = useState('');

  useEffect(() => {
    console.log('stations requestForEditing: ', requestForEditing);
    if (requestForEditing === 'edit' || requestForEditing === 'details') {
      setStationForEdit(openThreeDotsVertical);
      console.log('openThreeDotsVertical', openThreeDotsVertical);
      setModalOpen(true);
    } else if (requestForEditing === 'duplication') {
      console.log('openThreeDotsVertical', openThreeDotsVertical);
    } else if (requestForEditing === 'delete') {
      setStationForDelete(openThreeDotsVertical);
      setOpenRemove(true);
      //Modal_Delete
    }
  }, [requestForEditing]);

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };
  const handleCloseRemoveConfirm = async () => {
    console.log('DELETE:', props.stationArray[stationForDelete].id);
    let deleteStationTemp = await deleteStation(
      props.stationArray[stationForDelete].id
    );

    console.log('deleteStation:', deleteStationTemp);
    if (deleteStationTemp.status === 200) {
      alert('המחיקה בוצעה בהצלחה!');
      const newStations = [...props.stationArray];
      newStations.splice(stationForDelete, 1);
      props.setStationArray(newStations);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  useEffect(() => {
    console.log('props.stationArray', props.stationArray);
    // updateStationArray(props.stationArray);
  }, [props.stationArray]);

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
    // console.log("filtered Data 2:", filteredData)
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
    // console.log("filtered Data 3:", filteredData)
  };
  useEffect(() => {
    console.log('inputText: ', inputText);
  }, [inputText]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       allTasks = await getingDataTasks();
  //     } catch (error) {
  //       console.error(error.message);
  //     }
  //     setLoading(false);
  //   };
  //   fetchData();
  // }, []);

  const Display_The_Tasks = (e, n) => {
    console.log('eeeeeeeeeeeeeeeeeee: ', e);
    console.log('eeeeeeeeeeeeeeeeeee myStation.id: ', myStation.id);

    // if (myStation.id === e) {
    //   setMyStation((myStation.flag = false));
    // } else {
    //   setMyStation((myStation.flag = true));
    // }
    if (tasksOfChosenStation.length === 0 || typeof e !== 'string') {
      setTasksOfChosenStation([]);
      setMyStation((myStation.data = []));
      setStateTask({ data: [] });
      props.setTasksOfChosenStation([]);
    }

    if (typeof e === 'string')
      setMyStation((myStation.data = props.stationArray));
    setMyStation((myStation.name = n));
    setMyStation((myStation.id = e));
    props.setChosenStation(myStation);

    console.log('console myStat myStation:', myStation);

    let stationTemp = props.stationArray.find((station) => station.id === e);

    if (stationTemp) {
      props.setTasksOfChosenStation(stationTemp.tasks);
      setTasksOfChosenStation(stationTemp.tasks);
    }

    // stationTemp.tasks.map((task) => tasksOfChosenStation.push(task));
    console.log('props.allTasks yyy', tasksOfChosenStation);
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
    // console.log("filteredData from st:", filteredData)
    setStateTask({ data: tasksOfChosenStation }); //Updating the state
  };

  useEffect(() => {
    console.log('onlyAllStation stations: ', props.onlyAllStation);
  }, [props.onlyAllStation]);

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
                className='searchButton'
                dir='rtl'
                placeholder={
                  props.language === 'English' ? 'חפש תחנה' : 'search station'
                }
                label={<CgSearch style={{ fontSize: 'x-large' }} />}
                onChange={inputHandler}
              ></input>
            </div>
            <div className='Stations'>
              {props.stationArray.length > 0 ? ( //DND
                <>
                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId='stationArray'>
                      {(provided) => (
                        <ul
                          className='stationArray'
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {filteredData.map(({ id, title, color }, index) => {
                            // props.settaskcolor(color)
                            // setdpcolor(color)
                            let ID = '' + id;
                            console.log('id: ', typeof ID);

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
                                            setRequestForEditing={
                                              setRequestForEditing
                                            }
                                            setOpenThreeDotsVertical={
                                              setOpenThreeDotsVertical
                                            }
                                            editable={true}
                                            Reproducible={false}
                                            details={true}
                                            erasable={true}
                                          />
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                      <button
                                        className='nameOfButton'
                                        onClick={() => {
                                          Display_The_Tasks(id, title)
                                          props.settaskcolor(color)
                                          setdpcolor(color)
                                        }

                                        }
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
                  </DragDropContext>
                </>
              ) : (
                <div
                  className='textBeforeStation'
                  style={{ backgroundImage: `url(${textArea})` }}
                >
                  {props.stationsBeforeChoosingSite}
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
            tasksOfChosenStation={tasksOfChosenStation}
            setTasksOfChosenStation={setTasksOfChosenStation}
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
          />
          {/* </DndProvider> */}
        </>
      )}

      <Modal_Delete
        openRemove={openRemove}
        handleCloseRemove={handleCloseRemove}
        DialogTitle={'מחיקת תחנה'}
        DialogContent={'האם אתה בטוח במחיקת התחנה?'}
        handleCloseRemoveConfirm={handleCloseRemoveConfirm}
      />
    </>
  );
};
export default Stations;
//----------------------------------------

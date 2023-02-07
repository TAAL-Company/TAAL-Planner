import React, { useState, useEffect } from "react";
import { getingDataTasks } from "../../api/api";
import "./style.css";
import TasksComp from "../Tasks_comp/Tasks_comp";
import ModalStations from "../Modal/Modal_Stations";
import { AiOutlinePlus } from "react-icons/ai";
// import { BsThreeDotsVertical } from "react-icons/bs";
import { CgSearch } from "react-icons/cg";
import "@fontsource/assistant";
import ModalIcons from "../Modal/Modal_Icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import textArea from '../../Pictures/textArea.svg'

//-----------------------
// let allTasks = [];
let tasks = [];
let filteredData = [];
let inputText = "";
let flagFirstTime = true;
let myStation = { name: "", id: "", flag: true, data: [] };
let myCategory = "stationCategory";
//-----------------------
const Stations = (props) => {

  console.log("yyy props.allStations ", props.allStations)
  console.log("props.stationArray: ", props.stationArray);
  console.log("propsDataStations:", props.propsData);
  const [, setStateTask] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [, setFilteredData] = useState([]);
  const [, setInputText] = useState("");
  const [, setFlagFirstTime] = useState(false);
  const [, setMyStation] = useState(null);
  const [modalIconsOpen, setModalIconsOpen] = useState(false);
  const [myRouteClick, setMyRouteClick] = useState(0);
  const [stationArray, updateStationArray] = useState(props.stationArray);

  useEffect(() => {
    updateStationArray(props.stationArray);
  }, [props.stationArray])


  //changing the order of the stations
  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(stationArray);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateStationArray(items);
  }


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
        if (inputText === "") {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.name.toLowerCase().includes(inputText);
        }
      }))
    );
    // console.log("filtered Data 3:", filteredData)
  };
  useEffect(() => {
    console.log("charactersss: ", props.boardArrayDND)
  }, [props.boardArrayDND]);

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
    console.log("eeeeeeeeeeeeeeeeeee: ", e);
    if (myStation.id === e) {
      setMyStation((myStation.flag = false));
    } else {
      setMyStation((myStation.flag = true));
    }
    if (e != 0)
      setMyStation((myStation.data = props.stationArray));
    setMyStation((myStation.name = n));
    setMyStation((myStation.id = e));
    // console.log("console myStat myStation:", myStation)
    if (tasks.length > 0) {
      tasks = [];
    }


    props.allTasksOfTheSite.forEach((element) => {
      let colorTemp = props.stationArray.find((item) => item.id === e).color;

      if (e === 0) {
        if (element.places.length == 1 && element.places.includes(props.mySite.id)) {
          element.color = colorTemp;
          tasks.push(element);
        }
      }
      else if (element.places.includes(e)) {
        element.color = colorTemp;
        tasks.push(element);
      }

    });

    console.log("props.allTasks yyy", tasks)
    setFilteredData(
      (filteredData = props.stationArray.filter((el) => {
        if (inputText === "") {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.name.toLowerCase().includes(inputText);
        }
      }))
    );
    // console.log("filteredData from st:", filteredData)
    setStateTask({ data: tasks }); //Updating the state
  };

  useEffect(() => {
    console.log("onlyAllStation stations: ", props.onlyAllStation)

  }, [props.onlyAllStation])
  //----------------------------------------------------------
  return (
    <>
      {/* {loading && <div>Loading</div>} */}
      {!loading && (
        <>
          {modalOpen && (
            <ModalStations
              stationArray={props.stationArray}
              setOpenModalPlaces={setModalOpen}
              idTasks={props.idTask}
              mySite={props.mySite}
              pastelColors={props.pastelColors}


            />
          )}

          <div className="Cover_Stations">

            <>
              <div
                className="TitleStation"

              >
                <div className={`MyTitle text ${props.language !== 'English' ? 'english' : ''}`}> {props.stationsName}</div>
              </div>
            </>

            <div
              className="search"
              style={{
                backgroundColor: "#F5F5F5",
                // borderStyle: "none none solid none",
                // borderColor: "#fff",
                // borderWidth: "5px",
                padding: "13px 0px 13px 0px"
              }}
            >
              <input
                className="searchButton"
                dir="rtl"
                placeholder={props.language === "English" ? "חפש תחנה" : "search station"}
                label={<CgSearch style={{ fontSize: "x-large" }} />}
                onChange={inputHandler}
              ></input>
            </div>
            <div className="Stations">
              {stationArray.length > 0 ? ( //DND
                <>
                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="stationArray">
                      {(provided) => (
                        <ul
                          className="stationArray"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {stationArray.map(({ id, name, color }, index) => {
                            let ID = "" + id;
                            console.log("id: ", typeof ID);

                            return (
                              <Draggable
                                key={ID}
                                draggableId={ID}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <div
                                      className="buttons"
                                      style={
                                        {
                                          border: (id === myStation.id) ? "1px solid #cc0127" : "",
                                          background: props.language === 'English' ?
                                            `linear-gradient(270deg, ${color} 7%, #F8F9F3 1%)`
                                            :
                                            `linear-gradient(90deg, ${color} 7%, #F8F9F3 1%)`
                                        }
                                      }

                                      onClick={() =>
                                        Display_The_Tasks(id, name)
                                      }
                                      key={index}
                                    >
                                      {/* <BsThreeDotsVertical
                                        className="threeDotsVerticalEng"
                                        onClick={() =>
                                          clickOnhreeDotsVerticaIcont(id, name)
                                        }
                                      /> */}
                                      {myRouteClick === id ? (
                                        <>
                                          {modalIconsOpen && (
                                            <ModalIcons
                                              setOpenModalPlaces={
                                                setModalIconsOpen
                                              }
                                              myCategory={myCategory}
                                            />
                                          )}
                                        </>
                                      ) : (
                                        <></>
                                      )}
                                      <h3 className="nameOfButton">{name}</h3>
                                      {/* <Dot color="#F2AE69" /> */}
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
                <div className="textBeforeStation" style={{ backgroundImage: `url(${textArea})` }}>{props.stationsBeforeChoosingSite}</div>
              )}
            </div>
            <div className="addStationCover">
              <button
                className="AddButton"
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                <AiOutlinePlus className="plus" />
              </button>
            </div>
          </div>
          <TasksComp
            firstStationName={props.firstStationName}
            boardArrayDND={props.boardArrayDND}
            propsDataTask={tasks}
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
            myStations={props.stationArray}
            saveButton={props.saveButton}
            siteQuestionLanguage={props.siteQuestionLanguage}
            tasksBeforeChoosingSite={props.tasksBeforeChoosingSite}
            allTasksOfTheSite={props.allTasksOfTheSite}
            setAllTasksOfTheSite={props.setAllTasksOfTheSite}


          />
        </>
      )
      }
    </>
  );
};
export default Stations;
//----------------------------------------

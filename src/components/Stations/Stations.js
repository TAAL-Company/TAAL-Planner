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

  console.log(" props.allTasksOfTheSite1 ", props.allTasksOfTheSite)
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
  const [characters, updateCharacters] = useState(props.propsData);

  //changing the order of the stations
  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(characters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateCharacters(items);
  }


  if (flagFirstTime === true) {
    filteredData = props.propsData;
  }
  // console.log("filtered Data 1:", filteredData)
  let inputHandler = (e) => {
    setInputText((inputText = e.target.value.toLowerCase()));
    setFlagFirstTime((flagFirstTime = false));
    //convert input text to lower case
    // setFilteredData(filteredData = [])
    // console.log("filtered Data 2:", filteredData)
    setFilteredData(
      (filteredData = props.propsData.filter((el) => {
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
    setMyStation((myStation.data = props.propsData));
    setMyStation((myStation.name = n));
    setMyStation((myStation.id = e));
    // console.log("console myStat myStation:", myStation)
    if (tasks.length > 0) {
      tasks = [];
    }
    props.allTasks.forEach((element) => {
      for (let i = 0; i < element.places.length; i++) {
        if (element.places[i] === e) {
          tasks.push(element);
        }
      }
      // console.log("Display_The_Tasks", tasks)
    });
    setFilteredData(
      (filteredData = props.propsData.filter((el) => {
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

  // const clickOnhreeDotsVerticaIcont = (value) => {
  //   setMyRouteClick(value.id);
  //   setModalIconsOpen(true);
  // };
  //----------------------------------------------------------
  return (
    <>
      {/* {loading && <div>Loading</div>} */}
      {!loading && (
        <>
          {modalOpen && (
            <ModalStations
              setOpenModalPlaces={setModalOpen}
              idTasks={props.idTask}
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
              {characters.length > 0 ? ( //DND
                <>
                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="characters">
                      {(provided) => (
                        <ul
                          className="characters"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {characters.map(({ id, name }, index) => {
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
            myStations={props.propsData}
            saveButton={props.saveButton}
            siteQuestionLanguage={props.siteQuestionLanguage}
            tasksBeforeChoosingSite={props.tasksBeforeChoosingSite}
            allTasksOfTheSite={props.allTasksOfTheSite}

          />
        </>
      )}
    </>
  );
};
export default Stations;
//----------------------------------------

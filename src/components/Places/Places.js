import React, { useState, useEffect } from "react";
import { get, getingDataRoutes, getingDataTasks, getingDataPlaces } from "../../api/api";
import "./style.css";
// import { MdOutlineAdsClick } from "react-icons/md";
// import { FcAddDatabase, FcSearch } from "react-icons/fc";
import Stations from "../Stations/Stations";
import ModalPlaces from "../Modal/Model_Places";
// import ModalLoading from '../Modal/Modal_Loading';
import Modal from "../Modal/Modal";
import ModalIcons from "../Modal/Modal_Icons";
// import TextField from "@mui/material/TextField";
import { baseUrl } from "../../config";
import { AiOutlinePlus } from "react-icons/ai";
// import Dot from "../Dot/Dot";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CgSearch } from "react-icons/cg";
import textArea from '../../Pictures/textArea.svg'
import Modal_route_chosen from "../Modal/Modal_route_chosen"
import { MdNoStroller } from "react-icons/md";


// const { baseUrl } = require
//-----------------------

let allRoutes = [];
let allPlaces = [];
let places = [];
let myRoutes = [];
let onlyAllStation = [];
let Places_and_their_stations = [];
let thisIdTask = 0;
let filteredData = [];
let filteredDataRoutes = [];
let inputText = "";
let inputTextRouts = "";
let mySite = { name: "", id: "" };
// let flagRoute = false;
// let flagButtonRoute = false;
let tasksOfRoutes = [];
let clickAddRoute = false;
let myCategory = false;
let flagTest = false;

//-----------------------
const Places = (props) => {
  // console.log("setFloatLan:", props.setFloatLang)
  const [done, setDone] = useState(false);
  const [, setLoading] = useState(false);
  const [, setStateStation] = useState([]);
  const [stationArray, setStationArray] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIconsOpen, setModalIconsOpen] = useState(false);
  const [myRouteClick, setMyRouteClick] = useState(0);
  const [, setClickAddRoute] = useState(false);
  const [, setFlagStudent] = useState(false);
  const [, setThisIdTask] = useState(0);
  const [, setOnlyAllStation] = useState([]);
  const [, setPlaces] = useState([]);
  const [, setRoutes] = useState([]);
  const [, setFilteredData] = useState([]);
  const [, setFilteredDataRoutes] = useState([]);
  const [, setInputText] = useState("");
  const [, setInputTextRouts] = useState("");
  const [, setMySite] = useState(null);
  // const [get_logged_in, setLogged_in] = useState(false);// for TextView
  const [, setFlagRoute] = useState(false);
  const [, setFlagButtonRoute] = useState(false);
  const [, setTasksOfRoutes] = useState([]);
  const [, setFlagTest] = useState(false);
  const [siteSelected, setSiteSelected] = useState(false);
  const [isFirstSelection, setIsFirstSelection] = useState(false);
  const [newTitleForRoute, setNewTitleForRoute] = useState({});
  const [flagRoute, setRouteFlags] = useState(false);
  const [openModalRouteChosen, setOpenModalRouteChosen] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [allTasksOfTheSite, setAllTasksOfTheSite] = useState([]);
  const [firstStationName, setFirstStationName] = useState("כללי")
  const [boardArrayDND, setBoardArrayDND] = useState([]);
  const [pastelColors, setPastelColors] = useState(
    [
      "#91D3A8", //
      "#F2B965", //
      "#F07F85", //
      "#9EA8EF", //
      "#DEBCF0", //
      "#F49AC2", //(pale pink)
      "#77DD77", //(pastel green)
      "#FFB347", //(pastel orange)
      "#B39EB5", //(lavender)
      "#FF6961", //(salmon)
      "#CB99C9", //(pastel purple)
      "#87CEFA", //(light blue)
      "#FDFD96", //(pastel yellow)
      "#F5A9A9", //(light coral)
      "#ADD8E6", //(light cyan)
      "#D9B611", //(pastel gold)
      "#A8D8EA", //(light sky blue)
      "#F4C2C2", //(light salmon)
      "#93A8A8", //(light gray-green)
      "#E8E3E3", //(light gray)

      "#F5A9E1", //(light pink)
      "#F5D0A9", //(light tan)
      "#F5A9BB", //
      "#A9F5A9", //(pastel green)
      "#F5A9F2", //(light lavender pink)
      "#F5E6CB", //(light yellow)
      "#F5D7CB", //(light apricot)
      "#F5CBDC", //(light lavender)
      "#C9F5CB", //(light green)
      "#CBF5E6", //(light blue-green)
      "#CBE6F5", //(light periwinkle)
      "#CBD7F5", //(light blue)
      "#C9CBF5", //(light purple)
      "#E6CBF5" //(light magenta)
    ]
  );


  let inputHandlerRoutes = (e) => {
    //convert input text to lower case
    setInputTextRouts((inputTextRouts = e.target.value.toLowerCase()));
    setFilteredDataRoutes(
      (filteredDataRoutes = myRoutes.filter((el) => {
        // setInputText(lowerCase);
        if (inputTextRouts === "") {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.title.rendered.toLowerCase().includes(inputTextRouts);
        }
      }))
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setAllTasks(await getingDataTasks()); //get request for tasks
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // setLogged_in(sessionStorage.getItem('logged_in'));
        getData();
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);


  const getData = async () => {

    try {
      allPlaces = await getingDataPlaces(); //get request for places
    } catch (error) {
      console.error(error.message);
    }


    console.log("res places: ", allPlaces);

    setPlaces((places = allPlaces.filter((item) => item.parent === 0))); //parent === 0 means site and not station

    setOnlyAllStation(
      (onlyAllStation = allPlaces.filter((item) => item.parent > 0)) //parent > 0 means station 
    );

    console.log("onlyAllStation: ", onlyAllStation);


    Places_and_their_stations = places.map((element) => {
      return {
        parent: element,
        related: allPlaces.filter((r) => r.parent === element.id),
      };
    });
    setFilteredData(
      (filteredData = places.filter((el) => {
        if (inputText === "") {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.name.toLowerCase().includes(inputText);
        }
      }))
    );


    setDone(true);
  };

  const DisplayTasks = async (e) => {

    // Check if another route is already selected
    if (!flagRoute) {
      console.log("flagRoute e", e);

      setRouteFlags(true)

      setTasksOfRoutes((tasksOfRoutes = e));

      tasksOfRoutes.title.rendered = tasksOfRoutes.title.rendered.replace("&#8211;", "-").replace("&#8217;", "'");  //replace gebrish for - or '

      let firstStationId = allTasks.find(obj => obj.id === tasksOfRoutes.acf.tasks[0].ID).places.find(item => item !== mySite.id);
      console.log("firstStationId:", firstStationId);

      let name = onlyAllStation.find(item => item.id === firstStationId);
      if (name != undefined) {
        setFirstStationName(
          onlyAllStation.find(item => item.id === firstStationId).name
        )
      }


      let prevStation = "";

      setBoardArrayDND(tasksOfRoutes.acf.tasks.map((element) => {

        let taskTemp = allTasksOfTheSite.find(item => item.id === element.ID)
        console.log("taskTemp: yyyyy", taskTemp)
        console.log("element.ID: yyyyy", element.ID)


        let color;
        let stationID = taskTemp.places.find(item => item !== mySite.id)
        let stationName = "";
        if (stationID != undefined) {
          stationName = onlyAllStation.find(item => item.id === stationID).name
          color = stationArray.find(item => item.id === stationID).color

        }
        else {
          stationName = "כללי"
          color = stationArray.find(item => item.id === 0).color
        }

        // let color = stationArray.find(item => item.id === stationID).color
        let width = "-13px";
        let height = "70px";
        let nameStation = "14px";
        let bottom = "-27px";
        let kavTopWidth = "25px";
        let newkavTaskTop = "100px";
        let kavTaskTopMarginTop = "-7px";
        let borderLeft = "2px solid #c2bfbf";

        console.log("stationName dnd new:", stationName)
        console.log("prevStation dnd new:", prevStation)

        if (prevStation === stationName) {  // sameStation

          console.log("same stationnnn", prevStation)
          width = "-84px";
          borderLeft = "2x solid #c2bfbf";
          height = "86px";
          bottom = "45px";
          kavTopWidth = "0px";
          newkavTaskTop = "100px";
          nameStation = "";
          kavTaskTopMarginTop = "-27px";
        } else {
          console.log("NOT same stationnnn", prevStation, stationName)

          borderLeft = "0x solid #c2bfbf";
          width = "-13px";
          height = "70px";
          bottom = "-27px";
          kavTopWidth = "25px";
          newkavTaskTop = "0px";
          nameStation = stationName;
          kavTaskTopMarginTop = "-7px";

        }


        prevStation = stationName;

        console.log("routeClicked nameStation: ", nameStation)

        return {
          id: taskTemp.id,
          title: taskTemp.title.rendered
            .replace("&#8211;", "-")
            .replace("&#8217;", "' "),
          mySite: mySite,
          myStation: stationName,
          data: stationArray,
          nameStation: nameStation,
          width: width,
          borderLeft: borderLeft,
          height: height,
          kavTaskTopMarginTop: kavTaskTopMarginTop,
          bottom: bottom,
          kavTopWidth: kavTopWidth,
          newkavTaskTop: newkavTaskTop,
          dataImg: taskTemp.acf.image.url,
          color: color
        };


      }

      )

      )

    }
    else {
      setOpenModalRouteChosen(true);

    }
  };

  useEffect(() => {
    console.log("onlyAllStation: ", onlyAllStation)

  }, [onlyAllStation])

  const handleSelectChange = (event) => {
    const selectedValue = JSON.parse(event.target.value);
    console.log("selectedValue: " + JSON.stringify(selectedValue))
    Display_The_Stations(selectedValue);
    setSiteSelected(true);
  }

  const Display_The_Stations = async (selectedValue) => {

    // const selectedValue = JSON.parse(event.target.value);

    // setRouteFlags(true)
    // setFlagRoute((flagRoute = true));
    setThisIdTask((thisIdTask = selectedValue.id));
    if (stationArray.length > 0) {
      stationArray = [];
    }
    setMySite((mySite.name = selectedValue.name));
    setMySite((mySite.id = selectedValue.id));

    localStorage.setItem("MySite", JSON.stringify(mySite));

    console.log("onlyAllStation:", onlyAllStation);

    let colorTemp = 0;

    setStationArray(onlyAllStation.filter((item) => {
      if (item.parent === selectedValue.id) {
        item.color = pastelColors[colorTemp];
        colorTemp++;
        return item;

      }
    })
    )
    setStationArray(prev => [...prev, { id: 0, color: pastelColors[colorTemp], parent: selectedValue.id, name: "כללי" }])

    // setStateStation({ data: stationArray });

    try {
      allRoutes = await getingDataRoutes();  //get request for routes
    } catch (error) {
      console.error(error.message);
    }

    //myRoutes saves only the routes that belong to the site that choosen
    setRoutes(
      (myRoutes = allRoutes.filter(
        (item) => (item.acf.my_site === String(mySite.id) || item.places.includes(mySite.id))
      ))
    );


    // handle search word in "searce route"
    setFilteredDataRoutes(
      (filteredDataRoutes = myRoutes.filter((el) => {
        if (inputTextRouts === "") {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.title.rendered.toLowerCase().includes(inputTextRouts);
        }
      }))
    );

    let temp = [];

    allTasks.map(task => {
      if (task.places.includes(mySite.id))
        setAllTasksOfTheSite(prev => [...prev, task])
      else {     //if there is station of my site
        console.log("NOT")
        let temp = task.places.find(element => places.find(item => (item.id === element && item.parent === mySite.id)));
        if (temp !== undefined)
          setAllTasksOfTheSite(prev => [...prev, task])
      }
    }
    )

  }
  useEffect(() => {
    console.log("allTasksOfTheSite dnd: ", allTasksOfTheSite)


  }, [allTasksOfTheSite])


  const clickOnhreeDotsVerticaIcont = (value) => {
    setMyRouteClick(value.id);
    setModalIconsOpen(true);
    setFlagTest((flagTest = true));
    setModalOpen(true);
  };

  useEffect(() => {
    console.log("filteredData: ", filteredData)
  }, [filteredData])

  useEffect(() => {  //after adding new routes
    console.log("newTitleForRoute: ", newTitleForRoute)

    console.log("filteredDataRoutes: ", filteredDataRoutes);

    if (Object.keys(newTitleForRoute).length > 0) {
      filteredDataRoutes.push(newTitleForRoute);
      setFilteredDataRoutes(filteredDataRoutes)
      console.log("HHII")
    }

  }, [newTitleForRoute])
  useEffect(() => {
    console.log("Places_and_their_stations: ", Places_and_their_stations);


  }, [Places_and_their_stations])

  //----------------------------------------------------------------------
  return (
    <> <div className={`Places ${props.language !== 'English' ? 'english' : ''}`}>
      <div className="placesTitle">
        {props.siteQuestionLanguage}
      </div>
      <select className="selectPlace" defaultValue={'DEFAULT'} onChange={handleSelectChange}>
        <option value="DEFAULT" disabled>{props.siteLanguage}</option>

        {filteredData.map((value, index) => {
          return (
            <option
              key={index}
              value={JSON.stringify(value)}
            >

              {value.name}

            </option >
          );
        })}
      </select>
    </div>
      <div className={`mainRectangles ${props.language !== 'English' ? 'english' : ''}`}>

        {/* routes */}
        {modalOpen && (
          <Modal
            setNewTitleForRoute={setNewTitleForRoute}
            setOpenModal={setModalOpen}
            setFlagStudent={setFlagStudent}
            flagTest={flagTest}
            setSiteSelected={setSiteSelected}
            siteSelected={siteSelected}
          />
        )}
        <div
          className="Cover_Places"
        >

          <>
            <div className="TitlePlacesCover">
              <div className="TitlePlaces">
                <div className={`MyTitle text ${props.language !== 'English' ? 'english' : ''}`}>
                  {props.language === "English" ? "מסלולים" : "Routes"}
                </div>
              </div>
            </div>
          </>

          <div
            className="search"
            style={{
              backgroundColor: "#F5F5F5",
              // borderStyle: "none none solid none",
              // borderColor: "#fff",
              // borderWidth: "5px",
            }}
          >
            <input
              className="searchButton"
              dir="rtl"
              placeholder={props.language === "English" ? "חפש מסלול" : "search route"}
              label={<CgSearch style={{ fontSize: "x-large" }} />}
              onChange={inputHandlerRoutes}
            ></input>
          </div>
          <div className="routs">
            {filteredDataRoutes.length === 0
              ? <div className="textBeforeStation" style={{ backgroundImage: `url(${textArea})` }}>{props.routesBeforeChoosingSite}</div>
              : filteredDataRoutes.map((value, index) => {
                return (
                  <div
                    className="buttons" style={value.id === tasksOfRoutes.id ? { border: "1px solid #256fa1" } : {}}
                    onClick={() => DisplayTasks(value)} //הצגת המסלול
                    key={index}
                  >
                    <BsThreeDotsVertical
                      className="threeDotsVerticalEng"
                      onClick={() => clickOnhreeDotsVerticaIcont(value)}
                    />
                    {myRouteClick === value.id ? (
                      <>
                        {modalIconsOpen && (
                          <ModalIcons
                            setOpenModalPlaces={setModalIconsOpen}
                            myCategory={myCategory}
                          />
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                    <div className="nameOfButton">
                      {value.title.rendered
                        .replace("&#8211;", "-")
                        .replace("&#8217;", "'")}
                    </div>
                  </div>
                );
              })}
          </div>
          <div
            className="addPlaceCover"

          >
            <button
              className="AddButton"
              onClick={() => {
                setModalOpen(true);
                setFlagStudent(true);
                setClickAddRoute((clickAddRoute = true));
              }}
            >
              <AiOutlinePlus className="plus" />
            </button>
          </div>
        </div>
        <Stations
          firstStationName={firstStationName}
          boardArrayDND={boardArrayDND}
          stationArray={stationArray}
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
        />

        {/* )} */}

      </div>
      {openModalRouteChosen ? (
        <>
          <Modal_route_chosen setOpenModalRouteChosen={setOpenModalRouteChosen}>
          </Modal_route_chosen>
        </>
      ) : <></>}

      {/* <div className="colors">
        {pastelColors.map((color) => {
          return (
            <div style={{ background: color, height: "100px", width: "100px" }}>{color}</div>
          )
        }
        )

        }
      </div> */}
    </>
  );
};
export default Places;

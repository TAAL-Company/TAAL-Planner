import React, { useState, useEffect } from "react";
import { get } from "../../api/api";
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

// const { baseUrl } = require
//-----------------------
let places = [];
let myRoutes = [];
let onlyAllStation = [];
let stationArray = [];
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

  // const [, setMyCategory] = useState("place")
  let inputHandler = (e) => {
    //convert input text to lower case
    setInputText((inputText = e.target.value.toLowerCase()));
    setFilteredData(
      (filteredData = places.filter((el) => {
        // setInputText(lowerCase);
        if (inputText === "") {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.name.toLowerCase().includes(inputText);
        }
      }))
    );
  };
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
    await get(`${baseUrl}/wp-json/wp/v2/places/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      params: {
        per_page: 99,
        "Cache-Control": "no-cache",
      },
    }).then((res) => {
      console.log("res places: ", res);
      setPlaces((places = res.data.filter((item) => item.parent === 0)));
      setOnlyAllStation(
        (onlyAllStation = res.data.filter((item) => item.parent > 0))
      );
      Places_and_their_stations = places.map((element) => {
        return {
          parent: element,
          related: res.data.filter((r) => r.parent === element.id),
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
    });
    // await get(`${baseUrl}/wp-json/wp/v2/time_data/`, {
    //   params: {
    //     per_page: 99,
    //   },
    // }).then((res) => {
    //   console.log(
    //     "res time_dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: ",
    //     res.data[1].title.rendered
    //   );
    // });
    setDone(true);
    // setData_Loaded(true)
  };
  const DisplayTasks = (e) => {

    // console.log("check value routes:", tasksOfRoutes);
    if (!flagRoute) {
      console.log("e", e);

      setRouteFlags(true)
      setTasksOfRoutes((tasksOfRoutes = e));
      console.log("check value routes:", tasksOfRoutes);
      // setFlagButtonRoute((flagRoute = true));
      console.log("check value routes:", tasksOfRoutes.acf.tasks);
    }
    else {
      setOpenModalRouteChosen(true);

    }


  };
  const handleSelectChange = (event) => {
    const selectedValue = JSON.parse(event.target.value);
    Display_The_Stations(selectedValue);
    setSiteSelected(true);
  }

  const Display_The_Stations = (selectedValue) => {

    // const selectedValue = JSON.parse(event.target.value);

    // setRouteFlags(true)
    // setFlagRoute((flagRoute = true));
    setThisIdTask((thisIdTask = selectedValue.id));
    if (stationArray.length > 0) {
      stationArray = [];
    }
    setMySite((mySite.name = selectedValue.name));
    setMySite((mySite.id = selectedValue.id));

    console.log("val:", selectedValue);

    Places_and_their_stations.forEach((element) => {
      if (element.parent.id === selectedValue.id) {
        element.related.forEach((rel) => {
          setStateStation({ data: stationArray.push(rel) });
        });
        // console.log("stationArray:", stationArray);
      }
    });
    // console.log("stationArray:", stationArray);

    // finalSpaceCharacters[1] = {
    //   id: "gary",
    //   name: "wwwwwwwwwww",
    // };
    setStateStation({ data: stationArray });

    get(`${baseUrl}/wp-json/wp/v2/routes/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      params: {
        per_page: 99,
        "Cache-Control": "no-cache",
      },
    }).then((res) => {
      // console.log("resssssssssss ", res)
      // console.log("mySite.id:", mySite.id)
      setRoutes(
        (myRoutes = res.data.filter(
          (item) => (item.acf.my_site === String(mySite.id) || item.places.includes(mySite.id))
        ))
      );
      // console.log("myRoutesssssssssssss:", myRoutes);
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


    });
  };
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

    // console.log("filteredDataRoutes: ", filteredDataRoutes);

    if (Object.keys(newTitleForRoute).length > 0) {
      filteredDataRoutes.push(newTitleForRoute);
      setFilteredDataRoutes(filteredDataRoutes)
      console.log("HHII")
    }

  }, [newTitleForRoute])
  useEffect(() => {
    console.log("filteredDataRoutes: ", filteredDataRoutes);


  }, [filteredDataRoutes])

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
          {!props.flagHebrew ? (
            <>
              {" "}
              <div
                className="TitlePlacesCover"
              // style={{
              //   background:
              //     "linear-gradient(90deg,  #256FA11F  95%, #679abd 1%)",
              // }}
              >
                <h3 className="TitlePlaces">
                  <div className="MyRoutesTitle">
                    {/* מסלולים ב{" "}
                          <span className="name_of_site_title">
                            {mySite.name}
                          </span> */}
                    מסלולים
                  </div>
                </h3>
              </div>
            </>
          ) : (
            <>
              <div
                className="TitlePlacesCover"
              // style={{
              //   background: props.titlePlacesCss,
              // }}
              >
                <h3 className="TitlePlaces">
                  &nbsp;&nbsp;&nbsp;
                  <div className="MyTitle">{props.sites}</div>
                </h3>
              </div>
            </>
          )}
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
              placeholder="חפש מסלול"
              label={<CgSearch style={{ fontSize: "x-large" }} />}
              onChange={inputHandlerRoutes}
            ></input>
          </div>
          <div className="routs">
            {filteredDataRoutes.length === 0
              ? <div className="textBeforeStation" style={{ backgroundImage: `url(${textArea})` }}>אחרי בחירת האתר, בעמודה זו יופיעו המסלולים הקיימים בו.</div>
              : filteredDataRoutes.map((value, index) => {
                return (
                  <div
                    className="buttons"
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
          propsData={stationArray}
          idTask={thisIdTask}
          allStations={onlyAllStation}
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
        />

        {/* )} */}

      </div>
      {openModalRouteChosen ? (
        <>
          <Modal_route_chosen setOpenModalRouteChosen={setOpenModalRouteChosen}>
          </Modal_route_chosen>
        </>
      ) : <></>}

      <></>
    </>
  );
};
export default Places;

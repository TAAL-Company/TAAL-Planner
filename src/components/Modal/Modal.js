import React, { useState, useEffect } from "react";
import "./Modal.css";
import { get, insertRoute, getingDataUsers } from "../../api/api";
import { FcLink } from "react-icons/fc";
import { BsExclamationLg } from "react-icons/bs";
import Modal_Loading from "./Modal_Loading";
import { baseUrl } from "../../config";
import { RiAsterisk } from "react-icons/ri";
import stopIcon from '../../Pictures/stopIcon.svg'
import Modal_no_site_selected from "./Modal_no_site_selected"

//--------------------------
let obj = { tasks: [], users: [], mySite: [] };
let student = [];
let myStudents = [];
let myStudentsChoice = [];
let flagClickOK = false;
//--------------------------
function Modal({ setOpenModal, setFlagStudent, flagTest, setNewTitleForRoute, siteSelected, language }) {
  console.log("flagTest:", flagTest);
  const [, set_obj] = useState(null); // for TextView
  const [, setDone] = useState(false);
  const [, setLoading] = useState(false);
  const [, setStudent] = useState([]);
  const [, setMyStudents] = useState([]);

  const [, setMyStudentsChoice] = useState([]);
  const [, setFlagClickOK] = useState(false);
  const [get_Name, setName] = useState(null); // for TextView

  const [routeTitle, setRouteTitle] = useState('');
  const [newRoute, setNewRoute] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setStudent(
          (student = getingDataUsers())
        );
        // getData();
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };
    fetchData();

    console.log('Student',student)
  }, []);

  const getData = () => {
    get(`${baseUrl}/wp-json/wp/v2/users/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      params: {
        per_page: 99,
        "Cache-Control": "no-cache",
      },
    }).then((res) => {
      setStudent(
        (student = res.data.filter((item) => item.acf.risk_profile > 0))
      );
      // console.log("student:", student);
    });
  };
  function Post_Route() {
    setFlagClickOK((flagClickOK = true));
    resultMyArrayStudent();
    // if (setText === null || setText === "") {
    //     alert('Please give the Route a title !')
    //     return
    // }

    if (JSON.parse(localStorage.getItem("New_Routes")) === null) {
      alert("Route is empty ! ");
      return;
    } else {
      set_obj((obj.tasks = JSON.parse(localStorage.getItem("New_Routes"))));
      console.log("obj.tasks:", obj.tasks);
      set_obj((obj.mySite = JSON.parse(localStorage.getItem("MySite"))));
      console.log("obj.mySite:", obj.mySite.id);

      // console.log("obj : ", obj)
      // console.log("obj.tasks : ", obj.tasks)
      let url_post = `${baseUrl}/wp-json/wp/v2/routes/`;
      fetch(url_post, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          title: get_Name,
          status: "publish",
          fields: {
            tasks: obj.tasks.map((e) => {
              // console.log("e.id:", e.id)
              return e.id;
            }),
            users: {
              ID: myStudentsChoice.map((e) => {
                console.log("res of eee:00101110001010001:", e.id);
                return e.id;
              }),
            },
            my_site: obj.mySite.id,
          },
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (post) {
          setDone(true);

          // alert(get_Route_ID)
          // console.log("post:", post)
          window.location.replace("/planner");
        });
    }
  }
  const saveCheckbox = (val) => {
    setMyStudents(myStudents.push(val));
    if (myStudents.length > 1) sortById();
    console.log("myStudents", myStudents);
    // console.log("myStudents:", myStudents);
  };
  const sortById = () => {
    for (let i = 0; i < myStudents.length; i++) {
      let min = myStudents[i];
      for (let j = i; j < myStudents.length; j++) {
        // console.log(j, ",", myStudents[j].id)
        if (myStudents[j].id < min.id) {
          setMyStudents((myStudents[i] = myStudents[j]));
          setMyStudents((myStudents[j] = min));
          min = myStudents[j].id;
        }
      }
    }
  };
  const resultMyArrayStudent = () => {
    console.log("myStudents:", myStudents);
    if (myStudents.length > 1)
      for (let i = 0; i < myStudents.length; i++) {
        let index = i;
        let count = 1;
        for (let j = i + 1; j < myStudents.length; j++) {
          if (myStudents[j].id === myStudents[i].id) {
            i++;
            count++;
          }
        }
        if (count % 2 !== 0) {
          setMyStudentsChoice(myStudentsChoice.push(myStudents[index]));
        }

        // console.log("myStudentsChoice:", myStudentsChoice)
      }
    setMyStudentsChoice(myStudentsChoice.push(myStudents[0]));
  };
  function getName(val) {
    setName(val.target.value);
  }
  const saveData = () => {
    setFlagStudent(false);
    setOpenModal(false);
  };
  const handleSubmitRouteTitle = (event) => {
    event.preventDefault();

    // setNewTitleForRoute(routeTitle);

    const routeData = {
      title: routeTitle,
      places: [
        JSON.parse(localStorage.getItem("MySite")).id
      ]
    };

    insertRoute(routeData).then(data => {
      setNewRoute(data);
      setNewTitleForRoute(data);
      setRouteTitle('');
      setFlagStudent(false);
      setOpenModal(false);
    })
  }

  useEffect(() => {
    console.log("newRoute: ", newRoute);

  }, [newRoute])


  return (
    <>
      {flagTest ? (
        <>
          {false ? (
            // setText === null || setText === ""
            <>
              <div className="Background">
                <div className="modalContainer">
                  <div className="titleCloseBtn">
                    <button
                      onClick={() => {
                        setOpenModal(false);
                      }}
                    >
                      X
                    </button>
                  </div>
                  <div className="title">
                    <h3> Please type in the route name</h3>
                    <BsExclamationLg
                      style={{ color: "red", fontSize: "80px" }}
                    />
                  </div>
                  <div className="body"></div>
                  <div className="footer">
                    <button
                      className="cancelBtn"
                      onClick={() => {
                        setOpenModal(false);
                      }}
                    >
                      closed
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="Background">
              <div className="modalContainer">
                {setFlagStudent ? (
                  <>
                    <div className="headerNewRoute">
                      <div className="newRoutTitle"> שייך מסלול לעובד </div>
                    </div>

                    <div className="AddStudentTitle">
                      &nbsp;&nbsp;
                      <FcLink className="icon" />
                    </div>
                    <div className="allStudent">
                      {student.map((value, index) => {
                        return (
                          <label key={index} className="list-group-item">
                            <input
                              dir="ltr"
                              onChange={() => saveCheckbox(value)}
                              className="form-check-input me-1"
                              type="checkbox"
                              id={value.name}
                              name={value.name}
                              value=""
                            ></input>
                            {value.name}
                          </label>
                        );
                      })}
                    </div>
                    <button className="saveAs" onClick={() => saveData()}>
                      <div style={{ color: "white" }}>שייך</div>
                    </button>

                    <button className="cancelSaveAs" onClick={() => saveData()}>
                      {language !== 'English' ? 'Cancel' : 'ביטול'}

                    </button>
                  </>
                ) : (
                  <>
                    {" "}
                    <div className="body">
                      <h5>
                        {language !== 'English' ? 'Save route' : 'שמירת מסלול'}
                      </h5>
                    </div>
                    <div className="footer">
                      <button className="continueBtn" onClick={Post_Route}>
                        {language !== 'English' ? 'Save route' : 'שמירת מסלול'}

                      </button>
                      &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
                      <button
                        className="cancelBtn"
                        onClick={() => {
                          setOpenModal(false);
                        }}
                      >
                        {language !== 'English' ? 'Cancel' : 'ביטול'}
                      </button>
                      {flagClickOK ? (
                        <>
                          <Modal_Loading props={false} />
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {false ? (
            // setText === null || setText === ""
            <>
              <div className="Background">
                <div className="modalContainer">
                  <div className="titleCloseBtn">
                    <button
                      onClick={() => {
                        setOpenModal(false);
                      }}
                    >
                      X
                    </button>
                  </div>
                  <div className="title">
                    <h3> Please type in the route name</h3>
                    <BsExclamationLg
                      style={{ color: "red", fontSize: "80px" }}
                    />
                  </div>
                  <div className="body"></div>
                  <div className="footer">
                    <button
                      className="cancelBtn"
                      onClick={() => {
                        setOpenModal(false);
                      }}
                    >
                      closed
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="modalContainerNewRoute">
              {!siteSelected ? (<>
            
                <Modal_no_site_selected styleTransform={{ transform: "translate(150%, 50%)" }} setOpenModal={setOpenModal}></Modal_no_site_selected>

              </>) : (
                <>
                  {setFlagStudent ? (
                    <>
                      <div className="headerNewRoute">
                        <div className="newRoutTitle" style={{textAlign: language === 'English' ?  "right": "left"}}>
                          {language !== 'English' ? 'New route' : 'מסלול חדש'}

                        </div>
                      </div>
                      <div className="newRouteBody">
                      <form id="IPU" className="w3-container" onSubmit={handleSubmitRouteTitle}>
                        <div className="nameRoutTitle" style={{textAlign: language === 'English' ?  "right": "left"}} >
                          {language !== 'English' ? 'route name:' : ':שם המסלול'}

                        </div>
                        <p>
                          <input
                            dir="rtl"
                            className="inputRouteName"
                            required={true}
                            type="text"
                            // onChange={getName}
                            value={routeTitle}
                            onChange={e => setRouteTitle(e.target.value)}
                          ></input>
                        </p>

                        <button type="submit" className="saveAs" >
                          {/* onClick={() => saveData()}> */}
                          <div style={{ color: "white" }}>
                            {language !== 'English' ? 'Save as' : 'שמירה בשם'}

                          </div>
                        </button>

                        <button className="cancelSaveAs" onClick={() => saveData()}>
                          {language !== 'English' ? 'Cancel' : 'ביטול'}

                        </button>
                      </form>
                      </div>

                    </>
                  ) : (
                    <>
                      {" "}
                      <div className="headerNewRoute">
                        <div className="newRoutTitle">
                          {language !== 'English' ? 'save route' : 'שמירת מסלול'}

                        </div>
                      </div>
                      <div className="bodySaveRoute">
                        <div>:שיוך חניך</div>
                        <div className="allStudent">
                          {student.map((value, index) => {
                            return (
                              <label key={index} className="list-group-item">
                                <input
                                  dir="ltr"
                                  onChange={() => saveCheckbox(value)}
                                  className="form-check-input me-1"
                                  type="checkbox"
                                  id={value.name}
                                  name={value.name}
                                  value=""
                                ></input>
                                {value.name}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="footer">
                        <button className="continueBtn" onClick={Post_Route}>
                          {language !== 'English' ? 'Save route' : 'שמור מסלול'}

                        </button>
                   
                        <button
                          className="cancelBtn"
                          onClick={() => {
                            setOpenModal(false);
                          }}
                        >
                          {language !== 'English' ? 'Cancel' : 'ביטול'}
                        </button>
                        {flagClickOK ? (
                          <>
                            <Modal_Loading props={false} />
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </>
                  )}

                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
export default Modal;

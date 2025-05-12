import React, { useState, useEffect } from 'react';
import './Modal.css';
import {
  insertRoute,
  updateRoute,
  getingData_Routes,
  getingData_Users,
} from '../../api/api';
import { FcLink } from 'react-icons/fc';
import { BsExclamationLg } from 'react-icons/bs';
import Modal_Loading from './Modal_Loading';
import { baseUrl } from '../../config';
import { RiAsterisk } from 'react-icons/ri';
import stopIcon from '../../Pictures/stopIcon.svg';
import Modal_no_site_selected from './Modal_no_site_selected';
import { useNotification } from "../Notification/NotificationProvider";
import Model_assigned_route_to_parent from './Model_assigned_route_to_parent';
import Box from '@mui/material/Box';
import { FormControlLabel, Radio } from '@mui/material';
//--------------------------
let myStudents = [];
let myStudentsChoice = [];
let flagClickOK = false;


//--------------------------
function Modal({
  setOpenModal,
  setFlagStudent,
  flagTest,
  setNewTitleForRoute,
  siteSelected,
  language,
  routeName,
  tasksForNewRoute,
  routeUUID,
  setNewRoute,
  requestForEditing,
  setFilteredDataRoutes,
  newRoute,
  filteredDataRoutes,
  setRequestForEditing,
}) {
  const { showNotification } = useNotification();
  // let myStudentslist = [];
  const [obj, set_obj] = useState({
    name: '',
    studentIds: [],
    taskIds: [],
    siteIds: [],
  }); // for TextView
  const [site, setSite] = useState(localStorage.getItem('MySite'));

  const [, setDone] = useState(false);
  const [, setLoading] = useState(false);
  const [student, setStudent] = useState([]);
  const [, setMyStudents] = useState([]);

  const [, setMyStudentsChoice] = useState([]);
  const [, setFlagClickOK] = useState(false);
  const [get_Name, setName] = useState(null); // for TextView

  const [routeTitle, setRouteTitle] = useState(routeName);
  // const [newRoute, setNewRoute] = useState();

  const [ischecked, setIsChecked] = useState(false);
  const [Routes, setRoutes] = useState([]);
  const [myStudentsList, setMyStudentsList] = useState([]);

  const [searchStudent, setSearchStudent] = useState('');
  const [openModalRouteChosen, setOpenModalRouteChosen] = useState(false);
  const [searchRoute, setSearchRoute] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(filteredDataRoutes.filter((route) => route.id === routeUUID)[0]?.parentRouteId);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersData = await getingData_Users();
        if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
          setStudent(usersData);
        } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "EDITOR") {
          const usersDatafilterbycoachId = usersData.filter((user) => user.coachId == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
          setStudent(usersDatafilterbycoachId);
        } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "STUDENT") {
          const usersDatafilterbycoachId = usersData.filter((user) => user.id == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
          setStudent(usersDatafilterbycoachId);
        }
        // getData();
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
        setRoutes(await getingData_Routes());
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let tempStudentslist = [];//myStudentslist = [];
    Routes.map((route) => {
      if (route.name === routeTitle) {
        route.students.map((student) => {
          tempStudentslist.push(student);
        })
      }
    })
    setMyStudentsList(tempStudentslist);
    console.log("myStudentsList", myStudentsList);
  }, [routeTitle, Routes]);

  function Post_Route() {
    setFlagClickOK((flagClickOK = true));
    resultMyArrayStudent();

    if (JSON.parse(localStorage.getItem('New_Routes')) === null) {
      showNotification("error", language === "English" ? "Route is empty !" : "הרשומה ריקה !");
      return;
    } else {
      let taskIdList = [];
      tasksForNewRoute.map((task) => taskIdList.push(task.id));
      let studentIdList = [];
      myStudentsList.map((student) => studentIdList.push(student.id));
      let newRouteObj = {
        name: routeTitle,
        studentIds: studentIdList,
        taskIds: taskIdList,
        siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
        parentRouteId: selectedRoute,
      };

      console.log('newRouteObj', newRouteObj);

      try {
        updateRoute(routeUUID, newRouteObj).then(async (updatedRoute) => {
          try {
            // Fetch the updated route from the server
            let updatedRouteFromServer = await getingData_Routes().then((data) => {
              return data.find((route) => route.id === updatedRoute.id);
            });

            console.log(updatedRouteFromServer);

            // Update `filteredDataRoutes` with the updated route
            setFilteredDataRoutes((prevRoutes) => {
              const updatedRoutes = prevRoutes.map((route) =>
                route.id === routeUUID ? updatedRouteFromServer : route
              );
              return updatedRoutes;
            });

            setDone(true);
            setFlagClickOK((flagClickOK = false));
            setOpenModal(false);
            setRouteTitle('');
            showNotification(
              "success",
              language !== "English"
                ? "route updated successfully"
                : "המסלול עודכן בהצלחה"
            );
          } catch (error) {
            console.error("Error fetching updated route:", error);
            showNotification(
              "error",
              language !== "English"
                ? "Error Updating Route"
                : "שגיאה בעדכון המסלול"
            );
          }
        });
      } catch (error) {
        console.error(error.message);
        showNotification("error", language !== "English" ? "Error Updating Route" : "שגיאה בעדכון המסלול");
      }
    }
  }

  function Post_new_Route() {
    setOpenModalRouteChosen(true)
    // let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // let today = new Date();

    // setFlagClickOK((flagClickOK = true));
    // resultMyArrayStudent();

    // if (JSON.parse(localStorage.getItem('New_Routes')) === null) {
    //   // alert('Route is empty ! ');
    //   showNotification("error", language === "English" ? "Route is empty !" : "הרשומה ריקה !");
    //   return;
    // } else {
    //   let taskIdList = [];
    //   // setSite(JSON.parse(localStorage.getItem('New_Routes')));
    //   tasksForNewRoute.map((task) => taskIdList.push(task.id));
    //   let studentIdList = [];
    //   myStudentsList.map((student) => studentIdList.push(student.id));//myStudents
    //   let newRouteObj = {
    //     name: routeTitle + "-" + " Child " + "-" + today.toLocaleDateString("en-US"),
    //     studentIds: studentIdList,
    //     taskIds: taskIdList,
    //     siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
    //     parentRouteId: routeUUID
    //   };
    //   // set_obj((obj.mySite = JSON.parse(localStorage.getItem("MySite"))));
    //   console.log(newRouteObj);
    //   try {
    //     insertRoute(newRouteObj).then((data) => {
    //       setDone(true);
    //       setFlagClickOK((flagClickOK = false));
    //       setFilteredDataRoutes((prevRoutes) => [...prevRoutes, data]); // Add this line
    //       // window.location.replace("/forms");
    //     });
    //     setOpenModal(false);
    //     showNotification("success", language !== "English" ? "route created successfully" : "המסלול נוצר בהצלחה");
    //   } catch (error) {
    //     console.error(error.message);
    //     showNotification("error", language !== "English" ? "Error Creating Route" : "שגיאה ביצירת המסלול");
    //   }
    // }
  }

  const resultMyArrayStudent = () => {
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
      }
    setMyStudentsChoice(myStudentsChoice.push(myStudents[0]));
  };

  const saveData = () => {
    setFlagStudent(false);
    setOpenModal(false);
  };
  const handleSubmitRouteTitle = async (event) => {
    event.preventDefault();

    setNewTitleForRoute(routeTitle);

    const routeData = {
      name: routeTitle,
      siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
    };
    console.log(routeData);

    if (requestForEditing == 'edit' || requestForEditing == 'details') {
      try {
        await updateRoute(routeUUID, routeData).then((data) => {
          setNewRoute(data);
          // setNewTitleForRoute(data);
          setRouteTitle('');
          // setFlagStudent(false);
          setOpenModal(false);
        });
        showNotification("success", language !== "English" ? "route updated successfully" : "המסלול עודכן בהצלחה");
      } catch (error) {
        console.error(error.message);
        showNotification("error", language !== "English" ? "Error Updating Route" : "שגיאה בעדכון המסלול");
      }
    } else {
      try {
        await insertRoute(routeData).then((data) => {
          setNewRoute(data);
          setNewTitleForRoute(data);
          setRouteTitle('');
          setFlagStudent(false);
          setOpenModal(false);
        });
        showNotification("success", language !== "English" ? "route created successfully" : "המסלול נוצר בהצלחה");
      } catch (error) {
        console.error(error.message);
        showNotification("error", language !== "English" ? "Error Creating Route" : "שגיאה ביצירת המסלול");
      }
    }
  };

  return (
    <>
      {flagTest ? (
        <>
          {false ? (
            // setText === null || setText === ""
            <>
              <div className='Background'>
                <div className='modalContainer'>
                  <div className='titleCloseBtn'>
                    <button
                      onClick={() => {
                        setOpenModal(false);
                      }}
                    >
                      X
                    </button>
                  </div>
                  <div className='title'>
                    <h3> Please type in the route name</h3>
                    <BsExclamationLg
                      style={{ color: 'red', fontSize: '80px' }}
                    />
                  </div>
                  <div className='body'></div>
                  <div className='footer'>
                    <button
                      className='cancelBtn'
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
            <div className='Background'>
              <div className='modalContainer'>
                {setFlagStudent ? (
                  <>
                    <div className='headerNewRoute'>
                      <div className='newRoutTitle'> שייך מסלול לעובד </div>
                    </div>

                    <div className='AddStudentTitle'>
                      &nbsp;&nbsp;
                      <FcLink className='icon' />
                    </div>
                    <div className='allStudent'>
                      {student.map((value, index) => {
                        return (
                          <label key={index} className='list-group-item'>
                            <input
                              style={{ marginLeft: '10px' }}
                              dir='ltr'
                              onChange={() => {
                                console.log("testing", myStudentsList);
                                // saveCheckbox(value)
                                const isStudentInList = myStudentsList.some((student) => student.id === value.id);
                                console.log('isStudentInList', isStudentInList);
                                if (isStudentInList) {
                                  // Student exists in the list, remove the student with the matching id
                                  const updatedStudentsList = myStudentsList.filter((student) => student.id !== value.id);
                                  setMyStudentsList(updatedStudentsList);
                                } else {
                                  // Student does not exist in the list, add the new student
                                  const updatedStudentsList = [...myStudentsList, value];
                                  setMyStudentsList(updatedStudentsList);
                                }
                              }}
                              className='form-check-input me-1'
                              type='checkbox'
                              id={value.name}
                              name={value.name}
                              value=''
                              checked={myStudentsList.some((student) => student.id === value.id)}
                            ></input>
                            {value.name}
                          </label>
                        );
                      })}
                    </div>
                    <button className='saveAs' onClick={() => saveData()}>
                      <div style={{ color: 'white' }}>שייך</div>
                    </button>

                    <button className='cancelSaveAs' onClick={() => saveData()}>
                      {language !== 'English' ? 'Cancel' : 'ביטול'}
                    </button>
                  </>
                ) : (
                  <>
                    {' '}
                    <div className='body'>
                      <h5>
                        {language !== 'English' ? 'Save route' : 'שמירת מסלול'}
                      </h5>
                    </div>
                    <div className='footer'>
                      <button className='continueBtn' onClick={Post_Route}>
                        {language !== 'English' ? 'Save route' : 'שמירת מסלול'}
                      </button>
                      &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
                      <button
                        className='cancelBtn'
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
              <div className='Background'>
                <div className='modalContainer'>
                  <div className='titleCloseBtn'>
                    <button
                      onClick={() => {
                        setOpenModal(false);
                      }}
                    >
                      X
                    </button>
                  </div>
                  <div className='title'>
                    <h3> Please type in the route name</h3>
                    <BsExclamationLg
                      style={{ color: 'red', fontSize: '80px' }}
                    />
                  </div>
                  <div className='body'></div>
                  <div className='footer'>
                    <button
                      className='cancelBtn'
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
            <div className={`modalContainerNewRoute ${language === 'English' ? 'english' : ''}`}>
              {!siteSelected ? (
                <>
                  <Modal_no_site_selected
                    styleTransform={{ transform: 'translate(150%, 50%)' }}
                    setOpenModal={setOpenModal}
                  ></Modal_no_site_selected>
                </>
              ) : (
                <>
                  {setFlagStudent ? (
                    <>
                      <div className='headerNewRoute'>
                        <div
                          className='newRoutTitle'
                          style={{
                            textAlign:
                              language === 'English' ? 'right' : 'left',
                          }}
                        >
                          {language !== 'English' ? 'New route' : 'מסלול vחדש'}
                        </div>
                      </div>
                      <div className='newRouteBody'>
                        <form
                          id='IPU'
                          className='w3-container'
                          onSubmit={handleSubmitRouteTitle}
                        >
                          <div
                            className='nameRoutTitle'
                            style={{
                              textAlign:
                                language === 'English' ? 'right' : 'left',
                            }}
                          >
                            {language !== 'English'
                              ? 'route name:'
                              : ':שם המסלול'}
                          </div>
                          <p>
                            <input
                              dir='rtl'
                              className='inputRouteName'
                              required={true}
                              type='text'
                              // onChange={getName}
                              value={routeTitle}
                              onChange={(e) => setRouteTitle(e.target.value)}
                            ></input>
                          </p>

                          <button type='submit' className='saveAs'>
                            {/* onClick={() => saveData()}> */}
                            <div style={{ color: 'white' }}>
                              {language !== 'English' ? 'Save' : 'שמור'}
                            </div>
                          </button>

                          <button
                            className='cancelSaveAs'
                            onClick={() => saveData()}
                          >
                            {language !== 'English' ? 'Cancel' : 'ביטול'}
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <>
                      {' '}
                      <div className='headerNewRoute'
                        dir={language === 'English' ? 'ltr' : 'rtl'} >
                        <div className='newRoutTitle'>
                          {language !== 'English'
                            ? 'Save Route'
                            : 'שמירת מסלול'}
                        </div>
                      </div>
                      <div className='bodySaveRoute'
                        style={{
                          textAlign:
                            language === 'English' ? 'right' : 'left',
                        }}
                      >
                        <div>
                          {language !== 'English' ? 'Name of the route :' : 'שם המסלול :'}
                        </div>
                        <input
                          // dir={language !== 'English' ? 'ltr' : 'rtl'}
                          className='inputRouteName'
                          style={{ paddingRight: language !== 'English' ? '' : '10px', paddingLeft: language !== 'English' ? '10px' : '' }}
                          required={true}
                          type='text'
                          // onChange={getName}
                          value={routeTitle}
                          onChange={(e) => setRouteTitle(e.target.value)}
                        ></input>
                        <div>
                          {language !== 'English' ? 'List of students:' : 'שיוך עובד :'}
                        </div>
                        <input
                          type='text'
                          style={{ paddingRight: language !== 'English' ? '' : '10px', paddingLeft: language !== 'English' ? '10px' : '', width: '100%' }}
                          placeholder={language !== 'English' ? 'Search student' : 'חפש סטודנט'}
                          value={searchStudent}
                          onChange={(e) => setSearchStudent(e.target.value)}
                        />
                        <div className='allStudent'>
                          {student.filter((value) => value.name.toLowerCase().includes(searchStudent.toLowerCase())).map((value, index) => {
                            return (
                              <label key={index} className={`list-group-item ${language !== 'English' ? 'english' : ''}`}>
                                <input
                                  // dir={language !== 'English' ? 'ltr' : 'rtl'}
                                  // style={{ marginLeft: language !== 'English' ? '0' : '10px', }}
                                  onChange={() => {
                                    console.log("testing", myStudentsList);
                                    // saveCheckbox(value)
                                    const isStudentInList = myStudentsList.some((student) => student.id === value.id);
                                    console.log('isStudentInList', isStudentInList);
                                    if (isStudentInList) {
                                      // Student exists in the list, remove the student with the matching id
                                      const updatedStudentsList = myStudentsList.filter((student) => student.id !== value.id);
                                      console.log('isStudentInList - yes', isStudentInList, updatedStudentsList);
                                      setMyStudentsList(updatedStudentsList);
                                    } else {
                                      // Student does not exist in the list, add the new student
                                      const updatedStudentsList = [...myStudentsList, value];
                                      console.log('isStudentInList - no ', isStudentInList, updatedStudentsList);
                                      setMyStudentsList(updatedStudentsList);
                                    }
                                  }}
                                  className='form-check-input me-1'
                                  type='checkbox'
                                  id={value.name}
                                  name={value.name}
                                  value=''
                                  checked={myStudentsList.some((student) => student.id === value.id)}
                                ></input>
                                {value.name}
                              </label>
                            );
                          })}
                        </div>

                        <Box>
                          {language !== 'English' ? 'List of Route:' : 'רשימת מסלולים:'}
                        </Box>
                        <input
                          type='text'
                          style={{ paddingRight: language !== 'English' ? '' : '10px', paddingLeft: language !== 'English' ? '10px' : '', width: '100%' }}
                          placeholder={language !== 'English' ? 'Search Route' : 'חיפוש מסלול'}
                          value={searchRoute}
                          onChange={(e) => setSearchRoute(e.target.value)}
                        />
                        <Box className='allStudent'>
                          {filteredDataRoutes
                            .filter((route) => route.parentRouteId === null)
                            .filter((value) => value.name.toLowerCase().includes(searchRoute.toLowerCase()))
                            .map((route) => (
                              <Box key={route.id} className={`list-group-item ${language !== 'English' ? 'english' : ''}`}>
                                <FormControlLabel
                                  control={
                                    <Radio
                                      checked={selectedRoute === route.id}
                                      onChange={(e) => setSelectedRoute(route.id)}
                                      value={route.id}
                                    />
                                  }
                                  label={route.name}
                                />
                              </Box>
                            ))}
                        </Box>
                      </div>
                      <div className='footer'>
                        <button className='continueBtn' onClick={Post_Route}>
                          {language !== 'English' ? 'Save route' : 'שמור מסלול'}
                        </button>
                        <button className='continueBtn' onClick={
                          // setOpenModalRouteChosen(true)
                          Post_new_Route
                        }>
                          {language !== 'English' ? 'Save route' : 'שמור בשם'}
                        </button>
                        <button
                          className='cancelBtn'
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
                      {openModalRouteChosen && (
                        <Box>
                          <Model_assigned_route_to_parent
                            setOpenModalRouteChosen={setOpenModalRouteChosen}
                            language={language}
                            routeName={routeTitle}
                            tasksForNewRoute={tasksForNewRoute}
                            myStudentsList={myStudentsList}
                            routeUUID={routeUUID}
                            setFilteredDataRoutes={setFilteredDataRoutes}
                            setNewRoute={setNewRoute}
                            routesList={filteredDataRoutes}
                          />
                        </Box>

                      )}
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

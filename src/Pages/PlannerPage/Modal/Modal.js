import React, { useState, useEffect } from 'react';
import './Modal.css';
import {
  insertRoute,
  updateRoute,
  getingData_Routes,
  getingData_Users,
} from '../../../api/api';
import { FcLink } from 'react-icons/fc';
import { BsExclamationLg } from 'react-icons/bs';
import Modal_Loading from './Modal_Loading';
// import { baseUrl } from '../../../config';
// import { RiAsterisk } from 'react-icons/ri';
// import stopIcon from '../../../Pictures/stopIcon.svg';
import Modal_no_site_selected from './Modal_no_site_selected';
import { useNotification } from "../../../components/Notification/NotificationProvider";
import Model_assigned_route_to_parent from './Model_assigned_route_to_parent';
import Box from '@mui/material/Box';
import { FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
  const [loading, setLoading] = useState(false);
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
    const fetchUsers = async () => {
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
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const routesData = await getingData_Routes();
        setRoutes(routesData);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
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
      showNotification("error", t("plannerPage.Route_is_empty"));
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

      // console.log('newRouteObj', newRouteObj);

      setLoading(true);
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
              t("plannerPage.route_updated_successfully")
            );
          } catch (error) {
            console.error("Error fetching updated route:", error);
            showNotification(
              "error",
              t("plannerPage.Error_Updating_Route")
            );
          }
        });
      } catch (error) {
        console.error(error.message);
        showNotification("error", t("plannerPage.Error_Updating_Route"));
      } finally {
        setLoading(false);
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
    setLoading(true); // Start loading

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
        showNotification("success", t("plannerPage.route_updated_successfully"));
      } catch (error) {
        console.error(error.message);
        showNotification("error", t("plannerPage.Error_Updating_Route"));
      } finally {
        setLoading(false); // Stop loading
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
        showNotification("success", t("plannerPage.route_created_successfully"));
      } catch (error) {
        console.error(error.message);
        showNotification("error", t("plannerPage.Error_Creating_Route"));
      } finally {
        setLoading(false); // Stop loading
      }
    }
  }

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
                    <h3> {t("plannerPage.Please_type_in_the_route_name")}</h3>
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
                      {t("plannerPage.Close")}
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
                      <div className='newRoutTitle'> {t("plannerPage.Assign_route_to_employee")} </div>
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
                      <div style={{ color: 'white' }}>{t("plannerPage.Assign")}</div>
                    </button>

                    <button className='cancelSaveAs' onClick={() => saveData()}>
                      {t("plannerPage.Cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    {' '}
                    <div className='body'>
                      <h5>
                        {t("plannerPage.Save_route")}
                      </h5>
                    </div>
                    <div className='footer'>
                      <button className='continueBtn' onClick={Post_Route}>
                        {t("plannerPage.Save_route")}
                      </button>
                      &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
                      <button
                        className='cancelBtn'
                        onClick={() => {
                          setOpenModal(false);
                        }}
                      >
                        {t("plannerPage.Cancel")}
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
                    <h3> {t("plannerPage.Please_type_in_the_route_name")}</h3>
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
                      {t("plannerPage.Close")}
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
                          {t("plannerPage.New_route")}
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
                            {t("plannerPage.route_name")}
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
                            />
                          </p>

                          <button type='submit' className='saveAs' disabled={loading}>
                            {/* onClick={() => saveData()}> */}
                            <div style={{ color: 'white' }} disabled={loading} >
                              {loading ? (t("plannerPage.Loading")) : (t("plannerPage.Save"))}
                            </div>
                          </button>

                          <button
                            className='cancelSaveAs'
                            onClick={() => saveData()}
                          >
                            {t("plannerPage.Cancel")}
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
                          {t("plannerPage.Save_route")}
                        </div>
                      </div>
                      <div className='bodySaveRoute'
                        style={{
                          textAlign:
                            language === 'English' ? 'right' : 'left',
                        }}
                      >
                        <div>
                          {t("plannerPage.Name_of_the_route")}
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
                          {t("plannerPage.List_of_students")}
                        </div>
                        <input
                          type='text'
                          style={{ paddingRight: language !== 'English' ? '' : '10px', paddingLeft: language !== 'English' ? '10px' : '', width: '100%' }}
                          placeholder={t("plannerPage.Search_student")}
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
                          {t("plannerPage.List_of_Routes")}
                        </Box>
                        <input
                          type='text'
                          style={{ paddingRight: language !== 'English' ? '' : '10px', paddingLeft: language !== 'English' ? '10px' : '', width: '100%' }}
                          placeholder={t("plannerPage.Search_Route")}
                          value={searchRoute}
                          onChange={(e) => setSearchRoute(e.target.value)}
                        />
                        <Box className='allStudent'>
                          <Box className={`list-group-item ${language !== 'English' ? 'english' : ''}`}>
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={selectedRoute === null}
                                  onChange={() => setSelectedRoute(null)}
                                  value=""
                                />
                              }
                              label={t("plannerPage.Deselect") || "Deselect"}
                            />
                          </Box>
                          {filteredDataRoutes
                            .filter((route) => route.parentRouteId === null)
                            .filter((route) => route.id !== routeUUID)
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
                          {t("plannerPage.Save_route")}
                        </button>
                        <button className='continueBtn' onClick={
                          // setOpenModalRouteChosen(true)
                          Post_new_Route
                        }>
                          {t("plannerPage.Save_route_as")}
                        </button>
                        <button
                          className='cancelBtn'
                          onClick={() => {
                            setOpenModal(false);
                          }}
                        >
                          {t("plannerPage.Cancel")}
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

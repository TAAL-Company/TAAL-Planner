import React, { useState, useEffect } from 'react';
import './Modal.css';
import {
  get,
  insertRoute,
  updateRoute,
  getingDataUsers,
  getingData_Users,
} from '../../api/api';
import { FcLink } from 'react-icons/fc';
import { BsExclamationLg } from 'react-icons/bs';
import Modal_Loading from './Modal_Loading';
import { baseUrl } from '../../config';
import { RiAsterisk } from 'react-icons/ri';
import stopIcon from '../../Pictures/stopIcon.svg';
import Modal_no_site_selected from './Modal_No_Site_Selected';

//--------------------------
let obj = { tasks: [], users: [], mySite: [] };
// let student = [];
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
  newRoute,
}) {
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setStudent(await getingData_Users());
        // getData();
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  function Post_Route() {
    setFlagClickOK((flagClickOK = true));
    resultMyArrayStudent();
    // if (setText === null || setText === "") {
    //     alert('Please give the Route a title !')
    //     return
    // }

    if (JSON.parse(localStorage.getItem('New_Routes')) === null) {
      alert('Route is empty ! ');
      return;
    } else {
      let taskIdList = [];
      setSite(JSON.parse(localStorage.getItem('New_Routes')));
      tasksForNewRoute.map((task) => taskIdList.push(task.id));
      let studentIdList = [];
      myStudents.map((student) => studentIdList.push(student.id));
      let newRouteObj = {
        name: routeTitle,
        studentIds: studentIdList,
        taskIds: taskIdList,
        siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
      };
      // set_obj((obj.mySite = JSON.parse(localStorage.getItem("MySite"))));

      updateRoute(routeUUID, newRouteObj).then((data) => {
        setDone(true);
        setFlagClickOK((flagClickOK = false));
        // window.location.replace("/forms");
      });
      setOpenModal(false);
    }
  }

  function Post_new_Route() {
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let today  = new Date();
    
    setFlagClickOK((flagClickOK = true));
    resultMyArrayStudent();

    if (JSON.parse(localStorage.getItem('New_Routes')) === null) {
      alert('Route is empty ! ');
      return;
    } else {
      let taskIdList = [];
      setSite(JSON.parse(localStorage.getItem('New_Routes')));
      tasksForNewRoute.map((task) => taskIdList.push(task.id));
      let studentIdList = [];
      myStudents.map((student) => studentIdList.push(student.id));
      let newRouteObj = {
        name: routeTitle+"-"+(Math.floor((Math.random() * 100000)))+"-"+today.toLocaleDateString("en-US"),
        studentIds: studentIdList,
        taskIds: taskIdList,
        siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
      };
      // set_obj((obj.mySite = JSON.parse(localStorage.getItem("MySite"))));
      console.log(newRouteObj);
      insertRoute(newRouteObj).then((data) => {
        setDone(true);
        setFlagClickOK((flagClickOK = false));
        // window.location.replace("/forms");
      });
       setOpenModal(false);
    }
  }

  const saveCheckbox = (val) => {
    setMyStudents(myStudents.push(val));
    if (myStudents.length > 1) sortById();
  };
  const sortById = () => {
    for (let i = 0; i < myStudents.length; i++) {
      let min = myStudents[i];
      for (let j = i; j < myStudents.length; j++) {
        if (myStudents[j].id < min.id) {
          setMyStudents((myStudents[i] = myStudents[j]));
          setMyStudents((myStudents[j] = min));
          min = myStudents[j].id;
        }
      }
    }
  };
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
  function getName(val) {
    setName(val.target.value);
  }
  const saveData = () => {
    setFlagStudent(false);
    setOpenModal(false);
  };
  const handleSubmitRouteTitle = (event) => {
    event.preventDefault();

    setNewTitleForRoute(routeTitle);

    const routeData = {
      name: routeTitle,
      siteIds: [JSON.parse(localStorage.getItem('MySite')).id],
    };
    console.log(routeData);

    if (requestForEditing == 'edit' || requestForEditing == 'details') {
      updateRoute(routeUUID, routeData).then((data) => {
        setNewRoute(data);
        // setNewTitleForRoute(data);
        setRouteTitle('');
        // setFlagStudent(false);
        setOpenModal(false);
      });
    } else {
      insertRoute(routeData).then((data) => {
        setNewRoute(data);
        setNewTitleForRoute(data);
        setRouteTitle('');
        setFlagStudent(false);
        setOpenModal(false);
      });
    }
  };

  // useEffect(() => {
  // }, [newRoute]);

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
                              onChange={() => saveCheckbox(value)}
                              className='form-check-input me-1'
                              type='checkbox'
                              id={value.name}
                              name={value.name}
                              value=''
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
            <div className='modalContainerNewRoute'>
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
                          {language !== 'English' ? 'New route' : 'מסלול חדש'}
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
                      <div className='headerNewRoute'>
                        <div className='newRoutTitle'>
                          {language !== 'English'
                            ? 'save route'
                            : 'שמירת מסלול'}
                        </div>
                      </div>
                      <div className='bodySaveRoute'>
                        <div>:שם המסלול</div>
                        <input
                          dir='rtl'
                          className='inputRouteName'
                          required={true}
                          type='text'
                          // onChange={getName}
                          value={routeTitle}
                          onChange={(e) => setRouteTitle(e.target.value)}
                        ></input>
                        <div>:שיוך עובד</div>
                        <div className='allStudent'>
                          {student.map((value, index) => {
                            return (
                              <label key={index} className='list-group-item'>
                                <input
                                  dir='ltr'
                                  style={{ marginLeft: '10px' }}
                                  onChange={() => saveCheckbox(value)}
                                  className='form-check-input me-1'
                                  type='checkbox'
                                  id={value.name}
                                  name={value.name}
                                  value=''
                                ></input>
                                {value.name}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className='footer'>
                        <button className='continueBtn' onClick={Post_Route}>
                          {language !== 'English' ? 'Save route' : 'שמור מסלול'}
                        </button>
                        <button className='continueBtn' onClick={Post_new_Route}>
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

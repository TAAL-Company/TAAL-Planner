import React, { useState, useEffect } from 'react';
import './Modal.css';
import { FcMultipleInputs, FcAbout } from 'react-icons/fc';
import { RiAsterisk } from 'react-icons/ri';
import { IoMdCheckbox } from 'react-icons/io';
import Modal_Loading from './Modal_Loading';
import { baseUrl } from '../../config';
import Modal_no_site_selected from './Modal_no_site_selected';
import { uploadFiles, uploadFile, insertTask, updateTask } from '../../api/api';
import uploadFileToBlob from '../azureBlob';

//--------------------------
let ichour = 'אישור';
let file = '';
let myPlacesChoiceTemp = [];

//--------------------------
function Modal_Tasks(props) {
  const [, setDone] = useState(false);
  const [get_title, setTitle] = useState(props.title);
  const [picture, setPicture] = useState(null);
  const [audio, setAudio] = useState(null);
  const [getDescription, setDescription] = useState(props.subtitle);
  const [, setFile] = useState('');
  const [flagClickOK, setFlagClickOK] = useState(false);
  const [myPlacesChoice, setMyPlacesChoice] = useState([]);

  useEffect(() => {
    console.log('stationOfTask', props.stationOfTask);
    if (props.requestForEditing === 'edit' && props.stationOfTask) {
      props.stationOfTask.map((station) => {
        setMyPlacesChoice((prev) => [...prev, station.id]);
      });
    }
  }, [props.requestForEditing, props.stationOfTask]);

  console.log('allStations: ', props.allStations);
  console.log('myStation: ', props.myStation);

  const handleTitleInput = (e) => {
    setTitle(e.target.value);
  };
  const handleDescriptionInput = (e) => {
    setDescription(e.target.value);
  };
  // const handleFileInput = (e) => {
  //   setFile((file = e.target.files[0]));
  //   // console.log("file", file)
  //   if (file.type.includes("image")) {
  //     setPicture((getPicture = file));
  //     // console.log(file)
  //   }
  //   if (file.type.includes("audio")) {
  //     setAudio((file));
  //     // console.log(file)
  //   }
  // };
  const saveTask = async () => {
    setFlagClickOK(true);

    if (get_title === '' || getDescription === '') {
      alert('עליך למלא שדות חובה המסומנים בכוכבית');
    } else {
      let picture_url;
      let audio_url;
      try {
        if (picture) {
          console.log('enter site: ', 'Task media');
          picture_url = await uploadFiles(picture, 'Task media');
          console.log(`Image uploaded successfully:`, picture_url);
        }
        if (audio) {
          audio_url = await uploadFiles(audio, 'Task media');
          console.log(`Audio uploaded successfully:`, audio_url);
        }
      } catch (error) {
        console.error(error);
      }

      if (props.requestForEditing === 'edit') {
        const newTask = {
          title: get_title,
          subtitle: getDescription,
          stationIds: myPlacesChoice,
          picture_url,
          audio_url,
        };
        update_task(props.uuid, newTask);
      } else {
        Post_Task(picture_url, audio_url);
      }
      props.setOpenThreeDotsVertical(-1);
    }
  };
  const update_task = async (uuid, newTask) => {
    try {
      const update = await updateTask(uuid, newTask);
      console.log('update Modale Tasks:', update);

      if (update.status === 200) {
        let indexStation = props.allStations.findIndex(
          (station) => station.id === props.myStation.id
        );
        let existingTaskIndex = props.allStations[indexStation].tasks.findIndex(
          (task) => task.id === uuid
        );

        if (indexStation !== -1 && existingTaskIndex !== -1) {
          const newTasks = [...props.tasksOfChosenStation];
          newTasks[existingTaskIndex] = update.data;
          props.setTasksOfChosenStation(newTasks);
          props.allStations[indexStation].tasks = newTasks;
        }

        props.setTaskForEdit(update.data);
        setFlagClickOK(false);
        props.setModalOpen(false);
        console.log('insertTask: ', update.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const Post_Task = async (picture_url, audio_url) => {
    // resultMyPlacesChoice();

    try {
      const post = await insertTask(
        get_title,
        getDescription,
        myPlacesChoice,
        picture_url,
        audio_url,
        props.mySite.id
      );

      let color = props.allStations.find(
        (item) => item.id === myPlacesChoice[0]
      ).color;

      post.color = color;
      props.setAllTasksOfTheSite((prev) => [...prev, post]);

      setDone(true);
      console.log('post Modale Tasks:', post);

      setFlagClickOK(false);
      props.setModalOpen(false);

      console.log('insertTask: ', post);
    } catch (error) {
      console.error(error);
    }
  };
  const saveCheckbox = (val) => {
    // console.log(val)
    setMyPlacesChoice((prev) => [...prev, val.id]);
    // setMyStudents(myStudents.push(val))
    // sortById();
  };
  useEffect(() => {
    console.log('myPlacesChoice:', myPlacesChoice);
  }, [myPlacesChoice]);

  // const sortById = () => {
  //   if (myPlacesChoiceTemp.length > 1)
  //     for (let i = 0; i < myPlacesChoiceTemp.length; i++) {
  //       let min = myPlacesChoiceTemp[i];
  //       for (let j = i; j < myPlacesChoiceTemp.length; j++) {
  //         // console.log(j, ",", myStudents[j].id)
  //         if (myPlacesChoiceTemp[j].id < min.id) {
  //           setMyPlacesChoice((myPlacesChoiceTemp[i] = myPlacesChoiceTemp[j]));
  //           setMyPlacesChoice((myPlacesChoiceTemp[j] = min));
  //           min = myPlacesChoiceTemp[j].id;
  //         }
  //       }
  //     }
  //   // console.log("myPlacesChoiceSort:", myPlacesChoiceTemp);
  // };

  const resultMyPlacesChoice = () => {
    if (myPlacesChoiceTemp.length > 1)
      for (let i = 0; i < myPlacesChoiceTemp.length; i++) {
        let index = i;
        let count = 1;
        for (let j = i + 1; j < myPlacesChoiceTemp.length; j++) {
          if (myPlacesChoiceTemp[j].id === myPlacesChoiceTemp[i].id) {
            i++;
            count++;
          }
        }
        if (count % 2 !== 0) {
          setMyPlacesChoice(myPlacesChoice.push(myPlacesChoiceTemp[index].id));
        }
        // console.log("myPlacesChoice:", myPlacesChoice)
      }
  };

  return (
    <>
      {!props.help && !props.siteSelected ? (
        <>
          <Modal_no_site_selected
            setOpenModal={props.setModalOpen}
          ></Modal_no_site_selected>
        </>
      ) : (
        <></>
      )}
      {!props.help && props.siteSelected ? (
        <>
          <div
            className='BackgroundTasks'
            style={{
              textAlign: props.language === 'English' ? 'right' : 'left',
              direction: props.language === 'English' ? 'ltr' : 'rtl',
              transform:
                props.language === 'English'
                  ? ' translate(-50%, -50%)'
                  : ' translate(50%, -50%)',
            }}
          >
            <div className='modalContainerTasks'>
              <div className='headerNewTask'>
                <div className='NewTaskTitle'>
                  {props.language !== 'English' ? 'New task' : ':משימה חדשה'}
                </div>
              </div>
              <div className='bodyNewTask'>
                {/* <h5 style={{ textAlign: 'center' }}> הוסף משימה</h5> */}
                <form id='IPU' className='w3-container'>
                  <h6>
                    {props.language !== 'English'
                      ? 'Write the name of the task'
                      : ':רשום את שם המשימה '}

                    <RiAsterisk style={{ color: 'red' }} />
                  </h6>
                  <p>
                    <input
                      required={true}
                      type='text'
                      onChange={handleTitleInput}
                      style={{
                        width: '100%',
                        height: '38px',
                        paddingRight: '20px',
                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                      }}
                      value={get_title}
                    ></input>
                  </p>
                </form>
                <form id='IPU' className='w3-container'>
                  <h6>
                    {props.language !== 'English'
                      ? 'Describe the task'
                      : ':תאר במשפט את משימה '}
                    <RiAsterisk style={{ color: 'red' }} />
                  </h6>
                  <p>
                    <input
                      value={getDescription}
                      type='text'
                      onChange={handleDescriptionInput}
                      style={{
                        width: '100%',
                        height: '38px',
                        paddingRight: '20px',
                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                      }}
                    ></input>
                  </p>
                </form>
                <form id='IPU' className='w3-container'>
                  <h6>
                    {props.language !== 'English'
                      ? 'Add a picture of a task'
                      : ':הוסף תמונה של משימה '}

                    <FcMultipleInputs />
                  </h6>
                  <div className='input-group mb-3'>
                    <input
                      required={true}
                      accept='.png, .jpg, .jpeg'
                      className='form-control'
                      type='file'
                      onChange={(e) => setPicture(e.target.files[0])}
                      style={{
                        textAlign: 'right',
                        width: '100%',
                        height: '38px',
                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                      }}
                    ></input>
                  </div>
                </form>
                <form id='IPU' className='w3-container'>
                  <h6>
                    {props.language !== 'English'
                      ? 'Add a voice clip describing the task'
                      : ':הוסף קטע קול המתאר את המשימה '}
                    <FcMultipleInputs />
                  </h6>
                  <p>
                    <input
                      required={true}
                      accept='.mp3'
                      type='file'
                      className='form-control'
                      onChange={(e) => setAudio(e.target.files[0])}
                      style={{
                        textAlign: 'right',
                        width: '100%',
                        height: '38px',
                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                      }}
                    ></input>
                  </p>

                  <div className='list-group'>
                    <h6>
                      {props.language !== 'English'
                        ? 'Select the stations you want to associate the task with'
                        : ':בחר את התחנות שברצונך לשייך את המשימה'}
                      <IoMdCheckbox style={{ color: 'blue' }} />
                    </h6>
                    <div className='allTasks'>
                      {props.allStations.map((value, index) => {
                        return (
                          <label key={index} className='list-group-item'>
                            <input
                              onChange={() => saveCheckbox(value)}
                              className='form-check-input me-1'
                              style={{ marginLeft: '5px' }}
                              type='checkbox'
                              value=''
                              checked={myPlacesChoice.includes(value.id)}
                            ></input>
                            {value.title}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '16px',
                  height: '100px',
                  alignItems: 'center',
                  padding: '40px',
                  marginBottom: '20px',
                }}
                className='footerNewTasks'
              >
                <input
                  type='submit'
                  className='saveTaskButton'
                  value={
                    props.language !== 'English' ? 'Save Task' : 'שמור משימה'
                  }
                  onClick={saveTask}
                />
                <input
                  type='submit'
                  className='cancelTaskButton'
                  value={props.language !== 'English' ? 'Cancel' : 'ביטול'}
                  onClick={() => {
                    setMyPlacesChoice([]);
                    props.setModalOpen(false);
                    props.handleClose();
                  }}
                />
              </div>
              {flagClickOK ? (
                <>
                  <Modal_Loading props={false} />
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      ) : (
        <></>
        // <div className="Background">
        //   <div className="modalContainerHelpPlanner">
        //     <div className="titleCloseBtn">
        //       <button
        //         onClick={() => {
        //           setModalOpen(false);
        //         }}
        //       >
        //         {" "}
        //         X
        //       </button>
        //     </div>
        //     <h3>
        //       הוראות לבניית מסלול &nbsp;
        //       <FcAbout />
        //     </h3>
        //     <br></br>
        //     <div className="body" style={{ textAlign: "right" }}>
        //       <h6>
        //         בחר/י אתר קיים מרשימת האתרים או הוספ/י אתר משלך <samp>(1</samp>
        //       </h6>
        //       <br></br>
        //       <h6>
        //         בחר/י תחנה השייכת לאתר שבחרת ו/או הוספ/י תחנה חדשה{" "}
        //         <samp>(2</samp>
        //       </h6>
        //       <br></br>
        //       <h6>
        //         גרור לתיבת הגרירות את המשימות הרצויות כדי לבנות מסלול חדש{" "}
        //         <samp>(3</samp>
        //       </h6>
        //       <h6>
        //         ו/או בחר/י בהוסף משימה ושייך משימה זו לתחנות שבהם יש צורך בביצוע
        //         משימה זו
        //       </h6>
        //       <br></br>
        //       <h6>
        //         רשום את שם המסלול ובצע שמירה <samp>(4</samp>
        //       </h6>
        //     </div>
        //   </div>
        // </div>
      )}
    </>
  );
}
export default Modal_Tasks;

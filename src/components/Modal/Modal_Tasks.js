import React, { useState, useEffect } from "react";
import "./Modal.css";
import { FcMultipleInputs, FcAbout } from "react-icons/fc";
import { RiAsterisk } from "react-icons/ri";
import { IoMdCheckbox } from "react-icons/io";
import Modal_Loading from "./Modal_Loading";
import { baseUrl } from "../../config";
import Modal_no_site_selected from "./Modal_no_site_selected";
import { uploadFile, insertTask } from '../../api/api';

//--------------------------
let ichour = "אישור";
let file = "";
let myPlacesChoiceTemp = [];

//--------------------------
function Modal_Tasks({ setOpenModalPlaces, allStations, help, siteSelected, setModalOpenNoSiteSelected, mySite , setAllTasksOfTheSite }) {
  const [, setDone] = useState(false);
  const [get_title, setTitle] = useState("");
  const [picture, setPicture] = useState(null);
  const [audio, setAudio] = useState(null);
  const [getDescription, setDescription] = useState("");
  const [, setFile] = useState("");
  const [flagClickOK, setFlagClickOK] = useState(false);
  const [myPlacesChoice, setMyPlacesChoice] = useState([mySite.id]);

  console.log("allStations: ", allStations)

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
  const Post_Task = async () => {

    setFlagClickOK(true);

    // resultMyPlacesChoice();
    let imageData;
    let audioData;

    try {
      if (picture) {
        imageData = await uploadFile(picture, 'Image');
        console.log(`Image uploaded successfully:`, imageData);
      }
      if (audio) {
        audioData = await uploadFile(audio, 'Audio');
        console.log(`Audio uploaded successfully:`, audioData);
      }
    } catch (error) {
      console.error(error);
    }

    if (get_title === "" || getDescription === "") {
      alert("עליך למלא שדות חובה המסומנים בכוכבית");
    } else {
      try {
        const post = await insertTask(get_title, myPlacesChoice, imageData, audioData);
          setDone(true);
          console.log("post Modale Tasks:", post)
          setFlagClickOK(false);
          setOpenModalPlaces(false);
          let color = allStations.find(item => item.id === myPlacesChoice[1]).color
          setAllTasksOfTheSite(prev => [...prev, post])
      } catch (error) {
        console.error(error);
      }

      console.log("insertTask: ", insertTask      )

    //   let url_post = `${baseUrl}/wp-json/wp/v2/tasks/`;
    //   fetch(url_post, {
    //     method: "POST",
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
    //     },
    //     body: JSON.stringify({
    //       // password: "sdfsdf",
    //       status: "publish",

    //       title: get_title,
    //       // "description": getDescription,
    //       places: myPlacesChoice,
    //       fields: {
    //         image: {
    //           ID: imageData.id,
    //         },
    //         audio: {
    //           ID: audioData.id
    //         }
    //         // minimum_profile: 6
    //       },
    //     }),
    //   })
    //     .then(function (response) {
    //       return response.json();

    //       // props.setAllTasksOfTheSite
    //     })
    //     .then(function (post) {
    //       setDone(true);
    //       // alert("ok")
    //       console.log("post Modale Tasks:", post)
    //       // window.location.replace("/planner");
    //       setFlagClickOK(false);
    //       setOpenModalPlaces(false);
    //     });
    }


  }
  const saveCheckbox = (val) => {
    // console.log(val)
    setMyPlacesChoice(prev => [...prev, val.id])
    // setMyStudents(myStudents.push(val))
    // sortById();
  };
  useEffect(() => {
    console.log("myPlacesChoice:", myPlacesChoice);

  }, [myPlacesChoice])

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
      {!help && !siteSelected ? (<>
        <Modal_no_site_selected setOpenModal={setOpenModalPlaces}></Modal_no_site_selected>

      </>) : (<></>)}
      {!help && siteSelected ? (
        <>
          <div className="BackgroundTasks">
            <div className="modalContainerTasks">
              <div className="headerNewTask">
                <div className="NewTaskTitle">משימה חדשה</div>
              </div>
              <div className="bodyNewTask">
                {/* <h5 style={{ textAlign: 'center' }}> הוסף משימה</h5> */}
                <form id="IPU" className="w3-container">
                  <h6>
                    :רשום את שם המשימה <RiAsterisk style={{ color: "red" }} />
                  </h6>
                  <p>
                    <input
                      required={true}
                      type="text"
                      onChange={handleTitleInput}
                      style={{
                        width: "100%",
                        height: "40px",
                        paddingRight: "20px"
                      }}
                    ></input>
                  </p>
                </form>
                <form id="IPU" className="w3-container">
                  <h6>
                    :תאר במשפט את משימה <RiAsterisk style={{ color: "red" }} />
                  </h6>
                  <p>
                    <input
                      type="text"
                      onChange={handleDescriptionInput}
                      style={{
                        width: "100%",
                        height: "40px",
                        paddingRight: "20px"
                      }}
                    ></input>
                  </p>
                </form>
                <form id="IPU" className="w3-container">
                  <h6>
                    : הוסף תמונה של משימה <FcMultipleInputs />
                  </h6>
                  <div className="input-group mb-3">
                    <input
                      required={true}
                      accept=".png, .jpg, .jpeg"
                      className="form-control"
                      type="file"
                      onChange={(e) => setPicture(e.target.files[0])}
                      style={{
                        textAlign: "right",
                        width: "100%",
                        height: "40px",
                      }}
                    ></input>
                  </div>
                </form>
                <form id="IPU" className="w3-container">
                  <h6>
                    : הוסף קטע קול המתאר את המשימה <FcMultipleInputs />
                  </h6>
                  <p>
                    <input
                      required={true}
                      accept=".mp3"
                      type="file"
                      className="form-control"
                      onChange={(e) => setAudio(e.target.files[0])}
                      style={{
                        textAlign: "right",
                        width: "100%",
                        height: "40px",
                      }}
                    ></input>
                  </p>

                  <div className="list-group">
                    <h6>
                      :בחר את התחנות שברצונך לשייך את המשימה{" "}
                      <IoMdCheckbox style={{ color: "blue" }} />
                    </h6>
                    <div className="allTasks">
                      {allStations.map((value, index) => {
                        return (
                          <label key={index} className="list-group-item">
                            <input
                              onChange={() => saveCheckbox(value)}
                              className="form-check-input me-1"
                              type="checkbox"
                              value=""
                            ></input>
                            {value.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "16px",
                height: "100px",
                alignItems: "center",
                paddingLeft: "68px",
                marginBottom: "20px",
              }}
                className="footerNewTasks">
                <input
                  type="submit"
                  className="saveTaskButton"
                  value="שמור משימה"
                  onClick={Post_Task}
                />
                <input
                  type="submit"
                  className="cancelTaskButton"
                  value="ביטול"
                  onClick={() => {
                    setOpenModalPlaces(false);
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
        //           setOpenModalPlaces(false);
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
      )
      }
    </>
  );
}
export default Modal_Tasks;

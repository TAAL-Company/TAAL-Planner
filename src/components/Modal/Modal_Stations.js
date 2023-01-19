import React, { useState } from "react";
import "./Modal.css";
import { FcMultipleInputs } from "react-icons/fc";
import { RiAsterisk } from "react-icons/ri";
import { BsExclamationLg } from "react-icons/bs";
import Modal_Loading from "./Modal_Loading";
import { baseUrl } from "../../config";
import stopIcon from '../../Pictures/stopIcon.svg'

//--------------------------
let getPicture, getSound;
let ichour = "אישור";
let flagClickOK = false;
//--------------------------
const Modal_Stations = ({ setOpenModalPlaces, idTasks }) => {
  const [, setDone] = useState(false);
  const [get_title, settitle] = useState("");
  const [, setPicture] = useState(null);
  const [, setSound] = useState(null);
  const [getDescription, setDescription] = useState("");
  const [, setFlagClickOK] = useState(false);
  //----------------------------------

  const handleTitleInput = (e) => {
    settitle(e.target.value);
  };
  //----------------------------------

  const handleDescriptionInput = (e) => {
    setDescription(e.target.value);
  };
  //----------------------------------

  const handleFileInput = (e) => {
    // handle validations
    const file = e.target.files[0];

    if (file.type.includes("image")) {
      setPicture((getPicture = file));
      // console.log(file)
    }

    if (file.type.includes("audio")) {
      setSound((getSound = file));
      // console.log(file)
    }
  };
  //----------------------------------

  function Post_Station() {
    if (get_title === "" || getDescription === "") {
      alert("עליך למלא שדות חובה המסומנים בכוכבית");
    } else {
      setFlagClickOK((flagClickOK = true));
      let url_post = `${baseUrl}/wp-json/wp/v2/places/`;
      fetch(url_post, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },

        body: JSON.stringify({
          name: get_title,
          description: getDescription,
          parent: idTasks,
          fields: {
            audio: getSound,
            image: getPicture,
          },
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (post) {
          // get_Route_ID = post.id
          setDone(true);

          // alert(get_Route_ID)
          // console.log(post)
          setFlagClickOK((flagClickOK = false));
          window.location.replace("/planner");
        });
    }
  }
  return (
    <>
      {idTasks === 0 ? (
        <>
          <div className="BackgroundPlasesNoClick">
            <div className="modalContainerPlases">
          
              <div className="stopIconContainer">
                <img
                  src={stopIcon}
                  alt="logo"

                ></img>
              </div>
              <div className="body" style={{ textAlign: "center" }}>
                <h4>
                  {" "}
                  עליך לבחור ראשית אתר, ואז לשייך אליו תחנה
                </h4>

              </div>
              <div className="footer">
                <button
                  className="cancelBtn"
                  onClick={() => {
                    setOpenModalPlaces(false);
                  }}
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="modalContainerNewStation">

            <div className="headerNewTask">
              <div className="NewTaskTitle">תחנה חדשה</div>
            </div>
            <div className="bodyNewStation">
              <form id="IPU" className="w3-container">
                <h6>
                  :רשום את שם תחנה <RiAsterisk style={{ color: "red" }} />
                </h6>
                <p>
                  <input
                    required={true}
                    type="text"
                    onChange={handleTitleInput}
                    style={{
                      height: "40px",
                      width: "100%",
                      paddingRight: "20px"
                    }}
                  ></input>
                </p>
              </form>
              <form id="IPU" className="w3-container">
                <h6>
                  :תאר במשפט את תחנה <RiAsterisk style={{ color: "red" }} />
                </h6>
                <p>
                  <input
                    type="text"
                    onChange={handleDescriptionInput}
                    style={{
                      height: "40px",
                      width: "100%",
                      paddingRight: "20px"
                    }}
                  ></input>
                </p>
              </form>
              <form id="IPU" className="w3-container">
                <h6>
                  : הוסף תמונה של תחנה <FcMultipleInputs />
                </h6>
                <div className="input-group mb-3">
                  <input
                    required={true}
                    accept=".png, .jpg, .jpeg"
                    className="form-control"
                    type="file"
                    onChange={handleFileInput}
                    style={{
                      width: "100%",
                      height: "40px",
                    }}
                  ></input>
                </div>
              </form>
              <form id="IPU" className="w3-container">
                <h6>
                  : הוסף קטע קול המתאר את התחנה <FcMultipleInputs />
                </h6>
                <p>
                  <input
                    required={true}
                    accept=".mp3"
                    type="file"
                    className="form-control"
                    onChange={handleFileInput}
                    style={{
                      width: "100%",
                      height: "40px",
                    }}
                  ></input>
                </p>
              </form>
            </div>
            <div className="footerNewStation">
              <input
                type="submit"
                className="newStationButton"
                value="שמור תחנה"
                onClick={Post_Station}
              />
              <input
                type="submit"
                className="newStationButton"
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

        </>
      )}
    </>
  );
};
export default Modal_Stations;

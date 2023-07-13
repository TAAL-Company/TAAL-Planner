import React, { useState, useEffect } from "react";
import "./Modal.css";
import { FcMultipleInputs } from "react-icons/fc";
import { RiAsterisk } from "react-icons/ri";
import { BsExclamationLg } from "react-icons/bs";
import Modal_Loading from "./Modal_Loading";
import CircularProgressWithLabel from "./progressbar";
import { baseUrl } from "../../config";
import stopIcon from "../../Pictures/stopIcon.svg";
import { uploadFile, insertStation, updateStation } from "../../api/api";

//--------------------------
// let getPicture, getSound;
let ichour = "אישור";
let flagClickOK = false;
//--------------------------
const Modal_Stations = (props) => {
  const [, setDone] = useState(false);
  const [get_title, settitle] = useState("");
  const [picture, setPicture] = useState([]);
  const [audio, setAudio] = useState(null);
  const [getDescription, setDescription] = useState("");
  const [, setFlagClickOK] = useState(false);
  const [picturePreview, setPicturePreview] = useState(false);
  const [srcImage, setSrcImage] = useState("");
  const [stationUUId, setStationUUId] = useState("");

  console.log("stationIndex: ", props.stationIndex);
  console.log("stationArray: ", props.stationArray);
  useEffect(() => {
    if (
      props.stationArray.length > 0 &&
      props.stationIndex != undefined &&
      props.stationIndex > -1
    ) {
      settitle(props.stationArray[props.stationIndex].title);
      setDescription(props.stationArray[props.stationIndex].subtitle);
      setStationUUId(props.stationArray[props.stationIndex].id);
    }
  }, []);

  //----------------------------------

  const handleTitleInput = (e) => {
    settitle(e.target.value);
  };
  //----------------------------------

  const handleDescriptionInput = (e) => {
    setDescription(e.target.value);
  };
  //----------------------------------
  useEffect(() => {
    if (picture.length > 0) {
      setPicturePreview(true);
      setSrcImage(URL.createObjectURL(picture));
      console.log("srcImage", srcImage);
    }
    console.log("srcImage picture", picture);
  }, [picture]);

  async function Post_Station() {
    setFlagClickOK((flagClickOK = true));

    console.log("props.stationArray", props.stationArray);
    console.log("props.stationUUId", stationUUId);

    if (get_title === "" || getDescription === "") {
      alert("עליך למלא שדות חובה המסומנים בכוכבית");
    } else if (
      props.requestForEditing === "edit" ||
      props.requestForEditing == "details"
    ) {
      let response = await updateStation(
        stationUUId,
        get_title,
        getDescription,
        props.mySite.id
      );
      if (response.status === 200) {
        alert("התחנה עודכנה");
        setFlagClickOK((flagClickOK = false));
        props.setOpenModalPlaces(false);
        let station = props.stationArray.find(
          (station) => station.id === stationUUId
        );
        station.title = get_title;
        station.subtitle = getDescription;

        props.setOpenModalPlaces(false);
        props.setOpenThreeDotsVertical(-1);
        props.setRequestForEditing("");
      }
    } else {
      let imageData;
      let audioData;

      try {
        if (picture) {
          imageData = await uploadFile(picture, "Image");
          console.log(`Image uploaded successfully:`, imageData);
        }
        if (audio) {
          audioData = await uploadFile(audio, "Audio");
          console.log(`Audio uploaded successfully:`, audioData);
        }
      } catch (error) {
        console.error(error);
      }

      try {
        const post = await insertStation(
          get_title,
          getDescription,
          props.mySite
        ); //, imageData, audioData);
        setDone(true);
        setFlagClickOK((flagClickOK = false));

        let length = props.stationArray.length + 1;
        let color = props.pastelColors[length];
        post.color = color;
        props.setOpenModalPlaces(false);
        await props.setStationArray((stations) => [...stations, post]);
      } catch (error) {
        alert("שם התחנה כבר קיים - בחר שם אחר");
        console.error(error);
      }
    }
  }

  useEffect(() => {
    console.log("m props.stationArray:", props.stationArray);
  }, [props.stationArray]);

  return (
    <>
      {props.idTasks === 0 ? (
        <>
          {/* <div className="BackgroundPlasesNoClick"> */}
          <div className="modalContainerPlases">
            <div className="stopIconContainer">
              <img src={stopIcon} alt="logo"></img>
            </div>
            <div className="body" style={{ textAlign: "center" }}>
              <h4> עליך לבחור ראשית אתר, ואז לשייך אליו תחנה</h4>
            </div>
            <div className="footer">
              <button
                className="cancelBtn"
                onClick={() => {
                  props.setOpenModalPlaces(false);
                }}
              >
                סגור
              </button>
            </div>
          </div>
          {/* </div> */}
        </>
      ) : (
        <>
          <div className="modalContainerNewStation">
            <div className="headerNewTask">
              <div
                className="NewTaskTitle"
                style={{
                  textAlign: props.language === "English" ? "right" : "left",
                }}
              >
                {props.language !== "English" ? "New staition" : "תחנה חדשה"}
              </div>
            </div>
            <div
              className="bodyNewStation"
              style={{
                textAlign: props.language === "English" ? "right" : "left",
              }}
            >
              <form id="IPU" className="w3-container">
                <h6>
                  {props.language !== "English"
                    ? "Write the station name:"
                    : ":רשום את שם התחנה"}
                  <RiAsterisk style={{ color: "red" }} />
                </h6>
                <p>
                  <input
                    value={get_title}
                    required={true}
                    type="text"
                    onChange={handleTitleInput}
                    style={{
                      height: "38px",
                      width: "100%",
                      paddingRight: "20px",
                      direction: props.language === "English" ? "rtl" : "ltr",
                    }}
                  ></input>
                </p>
              </form>
              <form id="IPU" className="w3-container">
                <h6>
                  {props.language !== "English"
                    ? "Describe the station:"
                    : ":תאר במשפט את תחנה"}
                  <RiAsterisk style={{ color: "red" }} />
                </h6>
                <p>
                  <input
                    value={getDescription}
                    type="text"
                    onChange={handleDescriptionInput}
                    style={{
                      height: "38px",
                      width: "100%",
                      paddingRight: "20px",
                      direction: props.language === "English" ? "rtl" : "ltr",
                    }}
                  ></input>
                </p>
              </form>
              <form id="IPU" className="w3-container">
                <h6>
                  {props.language !== "English"
                    ? "add picture of the station:"
                    : "הוסף תמונה של התחנה"}
                  <FcMultipleInputs />
                </h6>
                <div className="input-group mb-3">
                  <input
                    required={true}
                    accept=".png, .jpg, .jpeg"
                    className="form-control"
                    type="file"
                    onChange={(e) => setPicture(e.target.files[0])}
                    style={{
                      width: "100%",
                      height: "38px",
                      direction: props.language === "English" ? "rtl" : "ltr",
                    }}
                  ></input>
                  {picturePreview ? (
                    <img
                      className="picturePreview"
                      src={srcImage}
                      alt="picturePreview"
                    ></img>
                  ) : (
                    <></>
                  )}
                </div>
              </form>
              <form id="IPU" className="w3-container">
                <h6>
                  {props.language !== "English"
                    ? "Add a voice clip:"
                    : "הוסף קטע קול"}

                  <FcMultipleInputs />
                </h6>
                <p>
                  <input
                    required={true}
                    accept=".mp3"
                    type="file"
                    className="form-control"
                    onChange={(e) => setAudio(e.target.files[0])}
                    style={{
                      width: "100%",
                      height: "38px",
                      direction: props.language === "English" ? "rtl" : "ltr",
                    }}
                  ></input>
                </p>
              </form>
            </div>
            <div className="footerNewStation">
              <input
                type="submit"
                className="newStationButton"
                value={
                  props.language !== "English" ? "Save station" : "שמור תחנה"
                }
                onClick={Post_Station}
              />
              <input
                type="submit"
                className="newStationButton"
                value={props.language !== "English" ? "Cancel" : "ביטול"}
                onClick={() => {
                  props.setOpenModalPlaces(false);
                  props.setRequestForEditing("");
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

import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import Tag from "../Tag/Tag.js";
import { CgSearch } from "react-icons/cg";
import textArea from "../../Pictures/textArea.svg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useDrag } from "react-dnd";
import ModalTasks from "../Modal/Modal_Tasks";
import { deleteTask } from "../../api/api.js";
import Modal_Delete from "../Modal/Modal_Delete";

const Tasks = (props) => {
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState("");
  const [taskUuidForEdit, setTaskUuidForEdit] = useState("");
  const [taskForEdit, setTaskForEdit] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [openRemove, setOpenRemove] = React.useState(false);
  const [modalOpenNoSiteSelected, setModalOpenNoSiteSelected] = useState(false);
  const [filteredDataTasks, setFilteredDataTasks] = useState([]);
  const [taskForDelete, setTaskForDelete] = useState("");
  // useEffect(() => {
  //   setFilteredDataTasks(props.tasksOfChosenStation);
  // }, []);
  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing("");
  };
  const handleCloseRemoveConfirm = async () => {
    console.log("DELETE:"); //, stationArray[openThreeDotsVertical].id);

    let deleteTaskTemp = await deleteTask(taskForDelete);

    console.log("deleteTaskTemp:", deleteTaskTemp);
    console.log(" props.tasksOfChosenStation:", props.tasksOfChosenStation);
    console.log(" props.tasksOfChosenStation:", props.tasksOfChosenStation);

    if (deleteTaskTemp != undefined) {
      alert("המחיקה בוצעה בהצלחה!");
      const newTasks = [...props.tasksOfChosenStation];
      let indexaTask = props.tasksOfChosenStation.findIndex(
        (task) => task.id === taskForDelete
      );
      newTasks.splice(indexaTask, 1); // remove one element at index x
      props.setTasksOfChosenStation(newTasks);

      console.log("props.stationArray 123", props.stationArray);

      let indexStation = props.stationArray.findIndex(
        (station) => station.id === props.chosenStation.id
      );
      console.log("indexStation 123", indexStation);

      props.stationArray[indexStation].tasks = newTasks;
      console.log("newTasks 123", newTasks);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing("");
  };
  useEffect(() => {
    console.log("tasks: ", props.tasksOfChosenStation);
    console.log("tasks: chosenStation ", props.chosenStation);
    setFilteredDataTasks(props.tasksOfChosenStation);
  }, [props.tasksOfChosenStation]);
  useEffect(() => {
    console.log("tasks: filteredDataTasks ", filteredDataTasks);
  }, [filteredDataTasks]);

  useEffect(() => {
    console.log("tasks b requestForEditing: ", requestForEditing);
    console.log("tasks b openThreeDotsVertical: ", openThreeDotsVertical);

    if (requestForEditing == "edit" || requestForEditing == "details") {
      console.log("openThreeDotsVertical", openThreeDotsVertical);
      setTaskUuidForEdit(openThreeDotsVertical);
      setModalOpen(true);
    } else if (requestForEditing == "duplication") {
      console.log("openThreeDotsVertical", openThreeDotsVertical);
    } else if (requestForEditing == "delete") {
      setTaskForDelete(openThreeDotsVertical);
      setOpenRemove(true);
      //Modal_Delete
    }
  }, [requestForEditing]);

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical == value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  // handle search word in "searce Task"
  const searchTask = (e) => {
    setFilteredDataTasks(
      props.tasksOfChosenStation.filter((el) => {
        if (e.target.value === "") {
          return el;
        }
        //return the item which contains the user input
        else {
          return el.title.toLowerCase().includes(e.target.value);
        }
      })
    );
  };

  return (
    <div className="Cover_Tasks">
      <div className="TitleTasks">
        <div
          className={`MyTitle text ${
            props.language !== "English" ? "english" : ""
          }`}
        >
          {props.myTasks}
        </div>
      </div>
      <div
        className="search"
        style={{
          backgroundColor: "#F5F5F5",
        }}
      >
        <input
          className="searchButton"
          // dir="rtl"
          placeholder={
            props.language === "English" ? "חפש משימה" : "search task"
          }
          label={<CgSearch style={{ fontSize: "x-large" }} />}
          onChange={searchTask}
        ></input>
      </div>

      {/* המשימות */}
      <div className="TasksCover">
        {props.tasksOfChosenStation.length === 0 &&
        props.chosenStation.length === 0 ? (
          <div
            className="textBeforeStation"
            style={{ backgroundImage: `url(${textArea})` }}
          >
            {props.tasksBeforeChoosingSite}
          </div>
        ) : (
          // <></>
          filteredDataTasks.map((tag, index) => {
            let ID = "" + tag.id;
            console.log("id: ", typeof ID);
            console.log("tag: ", tag);

            return (
              <Tag
                title={tag.title}
                id={ID}
                key={ID}
                dataImg={tag.dataImg}
                flagBoard={false}
                myLastStation={
                  props.chosenStation ? props.chosenStation.name : ""
                }
                data={tag.data}
                dragFromCover={"TasksNew"}
                language={props.language}
                openThreeDotsVertical={openThreeDotsVertical}
                setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                requestForEditing={requestForEditing}
                setRequestForEditing={setRequestForEditing}
                requestForEditingBoard={requestForEditing}
                // setRequestForEditingBoard={setRequestForEditingBoard}
              />
            );
          })
        )}
      </div>
      <div className="addTaskCover">
        <button
          className="AddButton"
          onClick={() => {
            setModalOpen(true);
            setModalOpenNoSiteSelected(true);
          }}
        >
          <AiOutlinePlus className="plus" />
        </button>
      </div>

      {modalOpen ? (
        <ModalTasks
          setTaskForEdit={setTaskForEdit}
          uuid={taskUuidForEdit}
          requestForEditing={requestForEditing}
          handleClose={handleCloseRemove}
          language={props.language}
          setModalOpen={setModalOpen}
          setAllTasksOfTheSite={props.setAllTasksOfTheSite}
          setMyStation={props.setMyStation}
          myStation={props.chosenStation}
          // setModalOpenNoSiteSelected={setModalOpenNoSiteSelected}
          allStations={props.stationArray}
          siteSelected={props.tasksOfChosenStation.length > 0}
          mySite={props.mySite}
          // help={helpFlag}
          title={
            openThreeDotsVertical != -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).title
              : ""
          }
          subtitle={
            openThreeDotsVertical != -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).subtitle
              : ""
          }
          stationOfTask={
            openThreeDotsVertical != -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).stations
              : ""
          }
        />
      ) : (
        <></>
      )}
      <Modal_Delete
        openRemove={openRemove}
        handleCloseRemove={handleCloseRemove}
        DialogTitle={"מחיקת משימה"}
        DialogContent={"האם אתה בטוח במחיקת המשימה?"}
        handleCloseRemoveConfirm={handleCloseRemoveConfirm}
      />
    </div>
  );
};
export default Tasks;

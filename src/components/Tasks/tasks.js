import React, { useState, useEffect } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import Tag from '../Tag/Tag.js';
import { CgSearch } from 'react-icons/cg';
import textArea from '../../Pictures/textArea.svg';
import ModalTasks from '../Modal/Modal_Tasks.js';
import { deleteTask, insertTask } from '../../api/api.js';
import ModalDelete from '../Modal/Modal_Delete.js';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const Tasks = (props) => {
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState('');
  const [taskUuidForEdit, setTaskUuidForEdit] = useState('');
  const [taskForEdit, setTaskForEdit] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [modalOpenNoSiteSelected, setModalOpenNoSiteSelected] = useState(false);
  const [filteredDataTasks, setFilteredDataTasks] = useState([]);
  const [taskForDelete, setTaskForDelete] = useState('');
  const [siteSelected, setSiteSelected] = useState(false);

  useEffect(() => {
    console.log('tasks: ', props.tasksOfChosenStation);
    console.log('tasks: chosenStation ', props.chosenStation);
    console.log('tasks: filteredDataTasks ', filteredDataTasks);

    setFilteredDataTasks(props.tasksOfChosenStation);

    if (props.mySite.id !== '') {
      setSiteSelected(true);
    }
  }, [
    props.mySite.id,
    filteredDataTasks,
    props.chosenStation,
    props.tasksOfChosenStation,
  ]);

  const handleCloseRemove = () => {
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
    setOpenRemove(false);
  };

  const handleCloseRemoveConfirm = async () => {
    console.log('DELETE:'); //, stationArray[openThreeDotsVertical].id);

    let deleteTaskTemp = await deleteTask(taskForDelete);

    console.log('deleteTaskTemp:', deleteTaskTemp);
    console.log(' props.tasksOfChosenStation:', props.tasksOfChosenStation);
    console.log(' props.tasksOfChosenStation:', props.tasksOfChosenStation);

    if (deleteTaskTemp !== undefined) {
      alert('המחיקה בוצעה בהצלחה!');
      const newTasks = [...props.tasksOfChosenStation];
      let indexaTask = props.tasksOfChosenStation.findIndex(
        (task) => task.id === taskForDelete
      );
      newTasks.splice(indexaTask, 1); // remove one element at index x
      props.setTasksOfChosenStation(newTasks);

      console.log('props.stationArray 123', props.stationArray);

      let indexStation = props.stationArray.findIndex(
        (station) => station.id === props.chosenStation.id
      );
      console.log('indexStation 123', indexStation);

      props.stationArray[indexStation].tasks = newTasks;
      console.log('newTasks 123', newTasks);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing('');
  };

  const duplicateTask = async (
    get_title,
    getDescription,
    myPlacesChoice,
    imageData,
    audioData,
    mySiteId,
    estimatedTimeSeconds = 20
  ) => {
    let station = props.stationArray.find(
      (s) => s.id === props.chosenStation.id
    );
    let indexStation = props.stationArray.findIndex(
      (station) => station.id === props.chosenStation.id
    );
    if (station && indexStation !== -1) {
      try {
        const post = await insertTask(
          get_title,
          getDescription,
          myPlacesChoice,
          imageData,
          audioData,
          mySiteId,
          estimatedTimeSeconds
        );

        // props.setAllTasksOfTheSite((prev) => [...prev, post]);
        const newTasks = [...props.tasksOfChosenStation];
        newTasks.push(post);
        props.setTasksOfChosenStation(newTasks);
        props.stationArray[indexStation].tasks = newTasks;

        console.log('insertTask: ', post);
        setRequestForEditing('');
        setOpenThreeDotsVertical(-1);
      } catch (error) {
        console.error(error);
      }
    }
  };

  console.log('tasks b requestForEditing: ', requestForEditing);
  console.log('tasks b openThreeDotsVertical: ', openThreeDotsVertical);

  useEffect(() => {
    if (openThreeDotsVertical !== -1) {
      if (requestForEditing === 'edit' || requestForEditing === 'details') {
        console.log('openThreeDotsVertical', openThreeDotsVertical);
        setOpenThreeDotsVertical(openThreeDotsVertical);
        setTaskUuidForEdit(openThreeDotsVertical);
        setModalOpen(true);
      } else if (requestForEditing === 'duplication') {
        setOpenThreeDotsVertical(openThreeDotsVertical);
        setTaskUuidForEdit(openThreeDotsVertical);

        let newTask = props.tasksOfChosenStation.find(
          (task) => task.id === openThreeDotsVertical
        );
        let newObject = Object.assign({}, newTask);
        delete newObject.id;

        duplicateTask(
          newObject.title,
          newObject.subtitle,
          props.stationArray
            ?.filter((s) => s.id === props.chosenStation.id)
            .map((s) => s.id) || [],
          newObject.picture_url,
          newObject.audio_url,
          props.mySite.id,
          newObject.estimatedTimeSeconds
        );
      } else if (requestForEditing === 'delete') {
        setTaskForDelete(openThreeDotsVertical);
        setOpenRemove(true);
        //Modal_Delete
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestForEditing]);

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  // handle search word in "searce Task"
  const searchTask = (e) => {
    setFilteredDataTasks(
      props.tasksOfChosenStation.filter((el) => {
        if (e.target.value === '') {
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
    <div className='Cover_Tasks'>
      <div className='TitleTasks'>
        <div
          className={`MyTitle text ${
            props.language !== 'English' ? 'english' : ''
          }`}
        >
          {props.myTasks}
        </div>
      </div>
      <div
        className='search'
        style={{
          backgroundColor: '#F5F5F5',
        }}
      >
        <input
          className='searchButton'
          // dir="rtl"
          placeholder={
            props.language === 'English' ? 'חפש משימה' : 'search task'
          }
          label={<CgSearch style={{ fontSize: 'x-large' }} />}
          onChange={searchTask}
        ></input>
      </div>

      {/* המשימות */}
      <div className='TasksCover'>
        {props.tasksOfChosenStation.length === 0 ||
        props.chosenStation.length === 0 ? (
          <div
            className='textBeforeStation'
            style={{ backgroundImage: `url(${textArea})` }}
          >
            {props.tasksBeforeChoosingSite}
          </div>
        ) : (
          // <></
          <Droppable droppableId='tasks-droppable'>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className='TasksCover'
                style={{
                  backgroundColor: snapshot.isDraggingOver
                    ? '#eeeee4'
                    : '#F5F5F5',
                }}
              >
                {filteredDataTasks.map((tag, index) => {
                  let ID = '' + tag.id;
                  console.log('id: ', typeof ID);
                  console.log('tag: ', tag);

                  return (
                    <Draggable key={ID} draggableId={ID} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Tag
                            title={tag.title}
                            id={ID}
                            key={ID}
                            dataImg={tag.picture_url}
                            flagBoard={false}
                            myLastStation={
                              props.chosenStation
                                ? props.chosenStation.name
                                : ''
                            }
                            data={tag.data}
                            dragFromCover={'TasksNew'}
                            language={props.language}
                            taskButtonColor={props.color}
                            openThreeDotsVertical={openThreeDotsVertical}
                            setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                            requestForEditing={requestForEditing}
                            setRequestForEditing={setRequestForEditing}
                            requestForEditingBoard={requestForEditing}
                            // setRequestForEditingBoard={setRequestForEditingBoard}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
      <div className='addTaskCover'>
        <button
          className='AddButton'
          onClick={() => {
            setModalOpen(true);
            setModalOpenNoSiteSelected(true);
          }}
        >
          <AiOutlinePlus className='plus' />
        </button>
      </div>

      {modalOpen ? (
        <ModalTasks
          setTaskForEdit={setTaskForEdit}
          uuid={taskUuidForEdit}
          tasksOfChosenStation={props.tasksOfChosenStation}
          setTasksOfChosenStation={props.setTasksOfChosenStation}
          requestForEditing={requestForEditing}
          handleClose={handleCloseRemove}
          language={props.language}
          setModalOpen={setModalOpen}
          setOpenThreeDotsVertical={setOpenThreeDotsVertical}
          setAllTasksOfTheSite={props.setAllTasksOfTheSite}
          setMyStation={props.setMyStation}
          myStation={props.chosenStation}
          // setModalOpenNoSiteSelected={setModalOpenNoSiteSelected}
          allStations={props.stationArray}
          siteSelected={siteSelected}
          mySite={props.mySite}
          // help={helpFlag}
          title={
            openThreeDotsVertical !== -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).title
              : ''
          }
          subtitle={
            openThreeDotsVertical !== -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).subtitle
              : ''
          }
          estimatedTimeSeconds={
            openThreeDotsVertical !== -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).estimatedTimeSeconds
              : 20
          }
          picture={
            openThreeDotsVertical !== -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).picture_url
              : null
          }
          audio={
            openThreeDotsVertical !== -1
              ? props.tasksOfChosenStation.find(
                  (task) => task.id === openThreeDotsVertical
                ).audio_url
              : null
          }
          stationOfTask={
            openThreeDotsVertical !== -1
              ? props.allTasks?.find(
                  (task) => task.id === openThreeDotsVertical
                )?.stations
              : []
          }
        />
      ) : (
        <></>
      )}
      <ModalDelete
        openRemove={openRemove}
        handleCloseRemove={handleCloseRemove}
        DialogTitle={'מחיקת משימה'}
        DialogContent={'האם אתה בטוח במחיקת המשימה?'}
        handleCloseRemoveConfirm={handleCloseRemoveConfirm}
      />
    </div>
  );
};
export default Tasks;

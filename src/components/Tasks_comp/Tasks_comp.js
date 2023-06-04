import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import DragnDrop from "../DragnDrop/DragnDrop";

const Tasks_comp = (props) => {
  // console.log("Task AllStation in:", props.allStations)
  console.log(" props.allTasksOfTheSite1 ", props.allTasksOfTheSite);
  console.log("Task AllStation in:", props.allStations);
  console.log("props.propsDataTask task comp:", props.propsDataTask);

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <DragnDrop
          percentProgressBar={props.percentProgressBar}
          setPercentProgressBar={props.setPercentProgressBar}
          progressBarFlag={props.progressBarFlag}
          setProgressBarFlag={props.setProgressBarFlag}
          replaceSiteFlag={props.replaceSiteFlag}
          replaceRouteFlag={props.replaceRouteFlag}
          firstStationName={props.firstStationName}
          allTasksOfTheSite={props.allTasksOfTheSite}
          allTasks={props.allTasks}
          tasksBeforeChoosingSite={props.tasksBeforeChoosingSite}
          propDataTask={props.propsDataTask}
          boardArrayDND={props.boardArrayDND}
          allStations={props.allStations}
          language={props.language}
          myTasks={props.myTasks}
          siteQuestionLanguage={props.siteQuestionLanguage}
          saveButton={props.saveButton}
          drag={props.drag}
          addMyTask={props.addMyTask}
          titleTaskCss={props.titleTaskCss}
          mySite={props.mySite}
          flagHebrew={props.flagHebrew}
          tasksOfRoutes={props.tasksOfRoutes}
          myStation={props.myStation}
          myStations={props.myStations}
          setMyStation={props.setMyStation}
          setAllTasksOfTheSite={props.setAllTasksOfTheSite}
        />
      </DndProvider>
    </>
  );
};
export default Tasks_comp;
//----------------------------------------

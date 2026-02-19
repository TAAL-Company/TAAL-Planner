import React, { useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AiOutlinePlus } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CgSearch } from "react-icons/cg";
import { Droppable, Draggable } from "react-beautiful-dnd";
import Stations from "../Stations/Stations";
import Tasks from "../Tasks/tasks";

/* ─── Styled Components (same pattern as SizeSelector) ─────── */

const Container = styled(Box)({
  display: "flex",
  flexDirection: "row",
  borderRadius: 6,
  // border: "1px solid #ddd",
  overflow: "hidden",
  height: "100%",
  minHeight: 600,
});

const PanelWrapper = styled(Box)({
  padding: 5,
  // display: "flex",
  // flexDirection: "row",
});

const LabelButton = styled(Box)(({ active, panelcolor }) => ({
  width: active ? "100%" : 40,
  height: active ? 50 : 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRight: "1px solid rgba(0,0,0,.12)",
  background: panelcolor,
  color: "#fff",
  boxShadow: active
    ? "0 1px 1px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.1) inset"
    : "none",
  transition: "background 0.2s",
  userSelect: "none",
  writingMode: active
    ? "horizontal-tb" : "vertical-rl",
  textOrientation: "mixed",
  transform: active
    ? "none" : "rotate(180deg)",
  fontSize: 13,
  font: "normal normal bold 26px/34px Assistant",
  fontWeight: active ? 700 : 500,
  letterSpacing: 1,
}));

const Content = styled(Box)(({ active }) => ({
  width: active ? 280 : 0,
  opacity: active ? 1 : 0,
  overflow: "hidden",
  transition: "width 0.25s linear, opacity 0.3s linear",
  // display: "flex",
  flexDirection: "column",
  background: "#F5F5F5",
}));

/* ─── Main Component ─────────────────────────────────────────── */

export default function PanelAccordion(props) {
  const {
    // shared
    language,
    translateData,
    translatedRoutes,
    textArea,
    routesBeforeChoosingSite,
    t,

    // packs
    filteredpacksbysite,
    selectedPack,
    setSelectedPack,
    handleSelectPack,
    setDropToBoard,
    openThreeDotsVerticalPacks,
    setOpenThreeDotsVerticalPacks,
    clickOnThreeDotsVerticalIcon,
    setRequestForEditing,
    handleAddPack,
    ModalDropdown,

    // routes
    filteredDataRoutes,
    selectedRoute,
    setSelectedRoute,
    openThreeDotsVertical,
    setOpenThreeDotsVertical,
    inputHandlerRoutes,
    displayStationsFromSelectedRoute,
    DisplayTasks,
    tasksOfRoutes,
    BorderedTreeView,
    modalOpen,
    setModalOpen,
    setFlagStudent,
    setClickAddRoute,
    clickAddRoute,

    // stations + tasks shared
    handleDeselectRoute,
    board,
    setBoard,
    setFilteredDataRoutes,
    setTranslateData,
    dropToBoard,
    setAllTasksOfTheSite,
    percentProgressBar,
    setPercentProgressBar,
    progressBarFlag,
    setProgressBarFlag,
    replaceRouteFlag,
    replaceSiteFlag,
    firstStationName,
    boardArrayDND,
    setBoardArrayDND,
    stationArray,
    setStationArray,
    thisIdTask,
    onlyAllStation,
    setOnlyAllStation,
    myTasks,
    drag,
    addStation,
    addMyTask,
    titleStationCss,
    titleTaskCss,
    mySite,
    flagHebrew,
    saveButton,
    siteQuestionLanguage,
    stationsBeforeChoosingSite,
    tasksBeforeChoosingSite,
    allTasks,
    setAllTasks,
    allTasksOfTheSite,
    pastelColors,
    hebrew,
    english,
    Hebrew,
    setTasksOfChosenStation,
    tasksOfChosenStation,
    setChosenStation,
    chosenStation,
    handleColor,
    taskcolor,
    allUsers,
    stations,
  } = props;

  // All 4 open by default — change array to e.g. ["packs"] to start with only one open
  const [openPanels, setOpenPanels] = useState([ "routes", "stations", "tasks"]);

  const handleToggle = (id) => {
    setOpenPanels((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const panels = [

    /* ── 1. PACKS ──────────────────────────────────────────────── */
    {
      id: "packs",
      label: t ? t("plannerPage.Packs") : "Packs",
      color: "linear-gradient(to bottom, #ba11b0, #ba11b0)",
      content: (
        <div className="Cover_Places">
          <>
            {/* <div className="TitlePlacesCover" style={{ backgroundColor: "#ba11b0" }}>
              <div className="TitlePlaces">
                <div className={`MyTitle text ${language !== "English" ? "english" : ""}`}>
                  {t ? t("plannerPage.Packs") : "Packs"}
                </div>
              </div>
            </div> */}
          </>

          <div className="search" style={{ backgroundColor: "#F5F5F5" }}>
            <input
              className={`searchButton ${language !== "English" ? "english" : "routes"}`}
              dir="rtl"
              placeholder={t ? t("plannerPage.Search_packs") : "Search packs..."}
              label={<CgSearch style={{ fontSize: "x-large", textAlign: "-webkit-center" }} />}
            // onChange={inputHandlerPacks}
            />
          </div>

          <div className="packs">
            {filteredpacksbysite.length === 0 ? (
              <div
                className={`textBeforeStation ${language !== "English" ? "english" : ""}`}
                style={{ backgroundImage: `url(${textArea})`, width: "88%" }}
              >
                <div className={`textBeforeStationtext ${language !== "English" ? "english" : ""}`}>
                  {routesBeforeChoosingSite}
                </div>
              </div>
            ) : (
              filteredpacksbysite.map((pack, index) => (
                <div
                  className="buttons"
                  style={{
                    border: pack.id === selectedPack?.id ? "1px solid rgb(173, 16, 212)" : "",
                    flexDirection: language === "English" ? "row" : "row-reverse",
                    textAlignLast: language === "English" ? "end" : "left",
                  }}
                  key={index}
                >
                  <div className="dropdownThreeDots">
                    <button
                      className="threeDotsVerticalEng"
                      onClick={() => {
                        const actualIndex = filteredpacksbysite.findIndex((r) => r.id === pack.id);
                        console.log("actualIndex", actualIndex);
                        console.log("openThreeDotsVerticalPacks", openThreeDotsVerticalPacks);
                        clickOnThreeDotsVerticalIcon(actualIndex, "pack");
                        setSelectedPack(pack);
                        setRequestForEditing("");
                      }}
                    >
                      <BsThreeDotsVertical />
                    </button>

                    {openThreeDotsVerticalPacks === filteredpacksbysite.findIndex((r) => r.id === pack.id) ? (
                      <ModalDropdown
                        language={language}
                        setRequestForEditing={setRequestForEditing}
                        setOpenThreeDotsVertical={setOpenThreeDotsVerticalPacks}
                        editable={true}
                        Reproducible={true}
                        details={false}
                        erasable={true}
                        uploadfromsheet={false}
                      />
                    ) : (
                      <></>
                    )}
                  </div>

                  <button
                    className="nameOfButton"
                    onClick={() => {
                      setSelectedPack(pack);
                      console.log("pack", pack);
                      handleSelectPack(pack);
                      const simulatedDropEvent = {
                        source: { droppableId: "Packs" },
                        destination: { droppableId: "board-droppable" },
                        draggableId: pack.id,
                      };
                      setDropToBoard(simulatedDropEvent);
                    }}
                  >
                    {translateData === "translated"
                      ? translatedRoutes[pack.id] || pack.name.replace("&#8211;", "-").replace("&#8217;", "'")
                      : translateData === "Mixed"
                        ? `${pack.name.replace("&#8211;", "-").replace("&#8217;", "'")} (${translatedRoutes[pack.id] || pack.name.replace("&#8211;", "-").replace("&#8217;", "'")
                        })`
                        : pack.name.replace("&#8211;", "-").replace("&#8217;", "'")}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="addPlaceCover">
            <button className="AddButton" onClick={handleAddPack}>
              <AiOutlinePlus className="plus" />
            </button>
          </div>
        </div>
      ),
    },

    /* ── 2. ROUTES ─────────────────────────────────────────────── */
    {
      id: "routes",
      label: t ? t("plannerPage.Routes") : "Routes",
      color: "linear-gradient(to bottom, #256fa1, #256fa1)",
      content: (
        <div className="Cover_Places">
          <>
            {/* <div className="TitlePlacesCover">
              <div className="TitlePlaces">
                <div className={`MyTitle text ${language !== "English" ? "english" : ""}`}>
                  {t ? t("plannerPage.Routes") : "Routes"}
                </div>
              </div>
            </div> */}
          </>

          <div className="search" style={{ backgroundColor: "#F5F5F5" }}>
            <input
              className={`searchButton ${language !== "English" ? "english" : "routes"}`}
              dir="rtl"
              placeholder={t ? t("plannerPage.Search_Route") : "Search route..."}
              label={<CgSearch style={{ fontSize: "x-large", textAlign: "-webkit-center" }} />}
              onChange={inputHandlerRoutes}
            />
          </div>

          <Droppable droppableId="routes-droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="routs"
                style={{ backgroundColor: snapshot.isDraggingOver ? "#eeeee4" : "#F5F5F5" }}
              >
                {filteredDataRoutes.length === 0 ? (
                  <div
                    className={`textBeforeStation ${language !== "English" ? "english" : ""}`}
                    style={{ backgroundImage: `url(${textArea})`, width: "88%" }}
                  >
                    <div className={`textBeforeStationtext ${language !== "English" ? "english" : ""}`}>
                      {routesBeforeChoosingSite}
                    </div>
                  </div>
                ) : (
                  <BorderedTreeView
                    direction={language !== "English" ? "ltr" : "rtl"}
                    filteredDataRoutes={filteredDataRoutes}
                    renderRoute={(route, index) => (
                      <Draggable key={route.id} draggableId={route.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="buttons"
                            style={{
                              ...provided.draggableProps.style,
                              border: route.id === tasksOfRoutes.id ? "1px solid #256fa1" : "",
                              flexDirection: "row-reverse",
                              textAlignLast: language === "English" ? "end" : "left",
                            }}
                            onClick={() => {
                              setSelectedRoute(route);
                              if (selectedRoute === null || selectedRoute.id !== route.id) {
                                displayStationsFromSelectedRoute(route);
                                DisplayTasks(route);
                              }
                            }}
                          >
                            <div className="dropdownThreeDots">
                              <button
                                className="threeDotsVerticalEng"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const actualIndex = filteredDataRoutes.findIndex((r) => r.id === route.id);
                                  console.log("actualIndex", actualIndex);
                                  console.log("openThreeDotsVertical", openThreeDotsVertical);
                                  clickOnThreeDotsVerticalIcon(actualIndex, "route");
                                  setSelectedRoute(route);
                                }}
                              >
                                <BsThreeDotsVertical />
                              </button>

                              {selectedRoute?.id === route.id &&
                                openThreeDotsVertical === filteredDataRoutes.findIndex((r) => r.id === route.id) ? (
                                <ModalDropdown
                                  language={language}
                                  setRequestForEditing={setRequestForEditing}
                                  setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                                  editable={false}
                                  Reproducible={true}
                                  details={false}
                                  erasable={true}
                                  uploadfromsheet={true}
                                />
                              ) : (
                                <></>
                              )}
                            </div>

                            <div
                              className="nameOfButton"
                              onClick={() => {
                                setSelectedRoute(route);
                                if (selectedRoute === null || selectedRoute.id !== route.id) {
                                  displayStationsFromSelectedRoute(route);
                                  DisplayTasks(route);
                                }
                              }}
                            >
                              {translateData === "translated"
                                ? translatedRoutes[route.id] || route.name.replace("&#8211;", "-").replace("&#8217;", "'")
                                : translateData === "Mixed"
                                  ? `${route.name.replace("&#8211;", "-").replace("&#8217;", "'")} (${translatedRoutes[route.id] ||
                                  route.name.replace("&#8211;", "-").replace("&#8217;", "'")
                                  })`
                                  : route.name.replace("&#8211;", "-").replace("&#8217;", "'")}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )}
                  />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="addPlaceCover">
            <button
              className="AddButton"
              onClick={() => {
                console.log("clicked", modalOpen);
                setModalOpen(true);
                setFlagStudent(true);
                setClickAddRoute((clickAddRoute = true));
              }}
            >
              <AiOutlinePlus className="plus" />
            </button>
          </div>
        </div>
      ),
    },

    /* ── 3. STATIONS ───────────────────────────────────────────── */
    {
      id: "stations",
      label: t ? t("plannerPage.Stations") : "Stations",
      color: "linear-gradient(to bottom, #cc0127, #cc0127)",
      content: (
        <Stations
          handleDeselectRoute={handleDeselectRoute}
          selectedRoute={selectedRoute}
          setSelectedRoute={setSelectedRoute}
          board={board}
          setBoard={setBoard}
          filteredDataRoutes={filteredDataRoutes}
          setFilteredDataRoutes={setFilteredDataRoutes}
          setTranslateData={setTranslateData}
          setDropToBoard={setDropToBoard}
          dropToBoard={dropToBoard}
          setAllTasksOfTheSite={setAllTasksOfTheSite}
          percentProgressBar={percentProgressBar}
          setPercentProgressBar={setPercentProgressBar}
          progressBarFlag={progressBarFlag}
          setProgressBarFlag={setProgressBarFlag}
          replaceRouteFlag={replaceRouteFlag}
          replaceSiteFlag={replaceSiteFlag}
          firstStationName={firstStationName}
          boardArrayDND={boardArrayDND}
          stationArray={stationArray}
          setStationArray={setStationArray}
          idTask={thisIdTask}
          allStations={onlyAllStation}
          setOnlyAllStation={setOnlyAllStation}
          language={language}
          stationsName={stations}
          myTasks={myTasks}
          drag={drag}
          addStation={addStation}
          addMyTask={addMyTask}
          titleStationCss={titleStationCss}
          titleTaskCss={titleTaskCss}
          mySite={mySite}
          flagHebrew={flagHebrew}
          tasksOfRoutes={tasksOfRoutes}
          clickAddRoute={clickAddRoute}
          saveButton={saveButton}
          siteQuestionLanguage={siteQuestionLanguage}
          stationsBeforeChoosingSite={stationsBeforeChoosingSite}
          tasksBeforeChoosingSite={tasksBeforeChoosingSite}
          allTasks={allTasks}
          allTasksOfTheSite={allTasksOfTheSite}
          pastelColors={pastelColors}
          hebrew={hebrew}
          english={english}
          Hebrew={Hebrew}
          setTasksOfChosenStation={setTasksOfChosenStation}
          tasksOfChosenStation={tasksOfChosenStation}
          setChosenStation={setChosenStation}
          chosenStation={chosenStation}
          settaskcolor={handleColor}
          Packs={filteredpacksbysite}
          selectedPack={selectedPack}
        />
      ),
    },

    /* ── 4. TASKS ──────────────────────────────────────────────── */
    {
      id: "tasks",
      label: t ? t("plannerPage.Tasks") : "Tasks",
      color: "linear-gradient(to bottom, #e8b221, #e8b221)",
      content: (
        <Tasks
          allUsers={allUsers}
          boardArrayDND={Array.isArray(boardArrayDND) ? boardArrayDND : []}
          setBoardArrayDND={setBoardArrayDND}
          allTasks={allTasks}
          setAllTasks={setAllTasks}
          setDropToBoard={setDropToBoard}
          dropToBoard={dropToBoard}
          allTasksOfTheSite={allTasksOfTheSite}
          setAllTasksOfTheSite={setAllTasksOfTheSite}
          setTasksOfChosenStation={setTasksOfChosenStation}
          tasksOfChosenStation={tasksOfChosenStation}
          myTasks={myTasks}
          onlyAllStation={onlyAllStation}
          language={language}
          tasksBeforeChoosingSite={tasksBeforeChoosingSite}
          chosenStation={chosenStation}
          stationArray={stationArray}
          mySite={mySite}
          color={taskcolor}
        />
      ),
    },
  ];
  
  let panelsdir = props.language !== 'English' ? panels : panels.reverse();

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <Container>
      {panelsdir.map((panel) => {
        const isActive = openPanels.includes(panel.id);
        return (
          <PanelWrapper key={panel.id}>
            {/* Vertical label strip — click to toggle */}
            <LabelButton
              active={isActive ? 1 : 0}
              panelcolor={panel.color}
              onClick={() => {
                if (panel.id === "packs") {
                  handleToggle(panel.id);
                }
                
              }}
            >
              {panel.label}
              {panel.id === "stations" ?
                (<>
                  <div>
                    <button
                      className="deselect-button"
                      onClick={props.handleDeselectRoute}
                    >
                      {t("plannerPage.Show_all_Stations")}
                    </button>
                  </div>
                </>) :
                (<></>)
              }
            </LabelButton>

            {/* Sliding content */}
            <Content active={isActive ? 1 : 0}>{panel.content}</Content>
          </PanelWrapper>
        );
      })}
    </Container>
  );
}
import * as React from "react";
import "./DataTableRTL.css";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import {
  getingDataUsers,
  postTaskCognitiveRequirements,
} from "../../../../api/api";
import "./CustomToolbar.css";

import {
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
// import MultipleSelectChip from "./MultipleSelectChip";
// import AccessibleTabs1 from "./AccessibleTabs1";

import { Button, InputLabel } from "@mui/material";
import MultipleEdit from "../multiple_edit/MultipleEdit";
import AddColumn from "../add_column/AddColumn";
import SaveIcon from "@mui/icons-material/Save";

const CustomToolbar = ({
  isInfoUserRoute,
  isInfoUserSite,
  tableType,
  selectedRows,
  columns,
  setColumns,
  workerName,
  routeName,
  siteName,
  setWorker,
  worker,
  allUsers,
  setChangeUser,
  setChangeRoute,
  setSaveProfileChanges,
  allRoutes,
  routeForTasksAbility,
  setRouteForTasksAbility,
  prevSelectedWorker,
  newTaskCognitiveRequirements,
}) => {
  // const [prevSelected, setPrevSelected] = useState([]);
  useEffect(() => {
    console.log("prevSelectedWorker", prevSelectedWorker);
  }, [prevSelectedWorker]);

  const saveProfileChanges = (e) => {
    console.log("HII");
    if (tableType === "CognitiveProfileHE") {
      console.log("true");
      setSaveProfileChanges(true);
    } else if (tableType === "TaskabilityHE") {
      console.log("HII");
      newTaskCognitiveRequirements.forEach((element) => {
        try {
          let post = postTaskCognitiveRequirements(element);
        } catch (error) {}

        alert("המידע נשמר !");
      });
    }
  };
  const handleChangeUser = (event) => {
    const selectedValue = JSON.parse(event.target.value);
    // setPrevSelected((prevSelected) => [...prevSelected, selectedValue]);

    console.log("worker", selectedValue);
    setWorker(selectedValue);
    setChangeUser(true);
  };
  const handleChangeRoute = (event) => {
    const selectedValue = JSON.parse(event.target.value);

    console.log("route", selectedValue);
    setRouteForTasksAbility(selectedValue);
    setChangeRoute(true);
  };
  return (
    <div>
      <GridToolbarContainer
        style={{
          paddingTop: "20px",
          paddingBottom: "15px",
          direction: "rtl",
          justifyContent: "space-between",
        }}
      >
        <div>
          <GridToolbarColumnsButton style={{ color: "black" }} />
          <GridToolbarFilterButton style={{ color: "black" }} />
          <GridToolbarDensitySelector style={{ color: "black" }} />
          <GridToolbarExport
            csvOptions={{
              fileName: `${
                tableType === "TaskabilityHE"
                  ? "Taskability"
                  : tableType === "CognitiveProfileHE"
                  ? "CognitiveProfile"
                  : "TA'AL EDITOR"
              }_${new Date()
                .toLocaleDateString("en-GB")
                .replace(/\//g, "-")}.csv`,
            }}
            style={{ color: "black" }}
          />
        </div>

        {isInfoUserRoute && (
          <div className="infoForms">
            <div className="workerNameForms">שם עובד: {workerName}</div>
            <div className="workerRouteForms">שם מסלול: {routeName}</div>
          </div>
        )}
        {tableType === "TaskabilityHE" ? (
          <div className="infoForms">
            <div className="workerNameForms">
              <InputLabel id="demo-simple-select-label-forms">
                בחירת מסלול:
              </InputLabel>
              <select
                className="selectUserForms"
                defaultValue={"DEFAULT"}
                onChange={handleChangeRoute}
              >
                <option value="DEFAULT" disabled>
                  {routeForTasksAbility.length == 0
                    ? "בחירת מסלול"
                    : routeForTasksAbility.name}
                </option>
                {allRoutes.map((value, index) => {
                  return (
                    <option key={index} value={JSON.stringify(value)}>
                      {value.name
                        .replace("&#8211;", "-")
                        .replace("&#8217;", "'")}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        ) : (
          <></>
        )}
        {isInfoUserSite && (
          <div className="infoForms">
            <div className="workerNameForms">
              <InputLabel id="demo-simple-select-label-forms">
                שם העובד:
              </InputLabel>
              <select
                className="selectUserForms"
                defaultValue={"DEFAULT"}
                onChange={handleChangeUser}
              >
                <option value="DEFAULT" disabled>
                  {worker.length == 0 ? "בחירת משתמש" : worker.name}
                </option>
                {allUsers.map((value, index) => {
                  return (
                    <option
                      key={index}
                      value={JSON.stringify(value)}
                      style={
                        prevSelectedWorker.some((u) => u.id === value.id)
                          ? {
                              fontWeight: "bold",
                              backgroundColor: "#efff00c9",
                            }
                          : {}
                      }
                    >
                      {value.name}
                    </option>
                  );
                })}
              </select>
            </div>
            {/* <div className="workerRoute">שם אתר: {siteName}</div> */}
          </div>
        )}

        <div>
          <InputAdornment position="start">
            <GridToolbarQuickFilter
              InputProps={{ disableUnderline: true }}
              placeholder="חיפוש"
              style={{
                paddingRight: "10px",
                width: "250px",
                position: "relative",
                borderRadius: "8px",
                paddingBottom: "2px",
                marginTop: "2px",
                background: "white",
              }}
              sx={{
                "& .MuiInputBase-root": {
                  // background: "blue",
                  width: "87%",
                  height: "28px",
                },
              }}
            />
            <SearchIcon
              style={{
                marginRight: "-30px",
                zIndex: "5",
              }}
            />
          </InputAdornment>
        </div>
      </GridToolbarContainer>

      {tableType === "TaskabilityHE" && selectedRows.length >= 2 ? (
        <>
          <div
            className="buttonaNavbarForms"
            style={{ display: "flex", right: 0, paddingBottom: "10px" }}
          >
            <div style={{ marginLeft: "10px" }}>
              <MultipleEdit
                textButton={"עריכה קבוצתית"}
                selectedRows={selectedRows}
                fieldsCount={columns.length}
                columns={columns}
              />{" "}
            </div>
            <AddColumn columns={columns} setColumns={setColumns}></AddColumn>
            {/* {selectedRows.map((item) => item.tasks)} */}
          </div>
        </>
      ) : tableType === "TaskabilityHE" ? (
        <>
          <div
            className="buttonaNavbarForms"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: "10px",
            }}
          >
            {" "}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="outlined"
                disabled
                style={{ marginLeft: "10px" }}
              >
                עריכה קבוצתית
              </Button>
              <AddColumn columns={columns} setColumns={setColumns}></AddColumn>
            </div>
            <div style={{ display: "flex" }}>
              <SaveIcon
                fontSize="large"
                color="primary"
                style={{ zIndex: "5" }}
                onClick={saveProfileChanges}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="buttonaNavbarForms"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: "10px",
            }}
          >
            <AddColumn columns={columns} setColumns={setColumns}></AddColumn>
            <div style={{ display: "flex", right: 0 }}>
              <SaveIcon
                fontSize="large"
                color="primary"
                style={{ zIndex: "5" }}
                onClick={saveProfileChanges}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default CustomToolbar;

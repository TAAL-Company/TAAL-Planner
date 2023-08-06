import * as React from "react";
import Box from "@mui/material/Box";
import "./DataTableRTL.css";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";

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
import { heIL } from "@mui/x-data-grid";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import MultipleEdit from "../multiple_edit/MultipleEdit";
import AddColumn from "../add_column/AddColumn";
import { DataGridPro } from "@mui/x-data-grid-pro";
import SaveIcon from "@mui/icons-material/Save";
import CustomToolbar from "./CustomToolbar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DataTableRTL = ({
  columns,
  setColumns,
  rows,
  isInfoUserRoute,
  isInfoUserSite,
  fillFalse,
  tableType,
  workerName,
  routeName,
  siteName,
  setWorker,
  worker,
  allUsers,
  setChangeUser,
  setChangeRoute,
  setRows,
  setCognitiveProfileValues,
  cognitiveProfileValues,
  setSaveProfileChanges,
  allRoutes,
  routeForTasksAbility,
  setRouteForTasksAbility,
  prevSelectedWorker,
  handleChangeUserFlags,
  handleChangeRouteFlags,
}) => {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [columnFillRows, setColumnFillRows] = React.useState({
    PrivateInfoHE: true,
    HistoryHE: true,
    LanguageComprehensionHE: true,
    LanguagesHE: true,
  });
  const [newTaskCognitiveRequirements, setNewTaskCognitiveRequirements] =
    React.useState([]);
  const [updateTaskCognitiveRequirements, setUpdateTaskCognitiveRequirements] =
    React.useState([]);

  useEffect(() => {
    console.log("rows:", rows);
    console.log("columns:", columns);
  }, [columns]);

  const [openDialogTrueFalse, setOpenDialogTrueFalse] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");

  const handleClose = () => {
    setOpenDialogTrueFalse(false);
  };

  const handleCellEdit = (params) => {
    console.log("params", params);
    console.log("params", params.field);
    console.log("params", params.value);

    if (tableType === "TaskabilityHE") {
      let [letter, number] = [
        params.value.charAt(0),
        params.value.substring(1),
      ];
      const position = letter.charCodeAt(0) - 64;
      const result = position.toString(10);

      console.log("diff", rows[params.id].uuid);
      let uuid = rows.find((temp) => temp.id === params.id).uuid;
      console.log("diff uuid", uuid);

      let temp = newTaskCognitiveRequirements.find(
        (temp) => temp.taskId === uuid
      );
      if (temp != undefined) {
        temp.value[parseInt(params.field)] = parseInt(number);
        temp.weights[parseInt(params.field)] = parseInt(result);
      } else {
        let valueArray = new Array(241).fill(1);
        valueArray[parseInt(params.field)] = parseInt(number);

        let weightsArry = new Array(241).fill(1);
        weightsArry[parseInt(params.field)] = parseInt(result);

        let post = {
          taskId: uuid,
          value: valueArray,
          weights: weightsArry,
        };
        setNewTaskCognitiveRequirements((prev) => [...prev, post]);

        console.log("post", post);
      }
      console.log(letter);
      console.log(number);
      console.log("diff", newTaskCognitiveRequirements);
    } else {
      console.log("params", params);
      console.log("params", params.field);
      console.log("params", params.value);

      // if (params.value >= 0 && params.value < 6) {
      const updatedRows = rows.map((row) => {
        if (row.id === params.id) {
          return {
            ...row,
            [params.field]: params.value,
          };
        } else {
          return row;
        }
      });

      setRows(updatedRows);

      const valueMap = {
        A: 5,
        B: 3,
        C: 2,
        D: 1,
        a: 5,
        b: 3,
        c: 2,
        d: 1,
      };

      // Convert input value to its corresponding numerical value
      let outputValue = 0;
      if (valueMap.hasOwnProperty(params.value)) {
        outputValue = valueMap[params.value];
      }

      setCognitiveProfileValues(
        cognitiveProfileValues.map((cog, index) => {
          if (index === params.id) {
            return outputValue;
          } else {
            return cog;
          }
        })
      );
      // } else {
      //   alert("בבקשה אכנס מספר בין 0-5");
      // }
    }
  };

  const handleChange = (event) => {
    fillFalse({ groupingColumn: "Languages", show: event.target.value });
    console.log("PrivateInfoHE");
    fillFalse({
      groupingColumn: "PrivateInfoHE",
      show: !columnFillRows.PrivateInfoHE,
    });
    setColumnFillRows((prev) => ({
      ...prev,
      PrivateInfoHE: !prev.PrivateInfoHE,
    }));
  };

  const columnGroupingModel = [
    {
      groupId: "PrivateInfoHE",
      description: "",
      renderHeaderGroup: (params) => (
        <div
          className="groupingHeaderNameForms"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("PrivateInfoHE");
            // fillFalse({
            //   groupingColumn: "PrivateInfoHE",
            //   show: !columnFillRows.PrivateInfoHE,
            // });
            // setColumnFillRows((prev) => ({
            //   ...prev,
            //   PrivateInfoHE: !prev.PrivateInfoHE,
            // }));
            setOpenDialogTrueFalse(true);
            setGroupName("פרטים אישיים");
          }}
        >
          פרטים אישיים
        </div>
      ),
      children: [
        { field: "fieldHEPrivateCard" },
        { field: "xPrivateCard" },
        { field: "yPrivateCard" },
        { field: "fieldENPrivateCard" },
        { field: "classificationHEPrivateCard" },
      ],
    },
    {
      groupId: "HistoryHE",
      renderHeaderGroup: (params) => (
        <div
          className="groupingHeaderNameForms"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("HistoryHE");
            // fillFalse({
            //   groupingColumn: "HistoryHE",
            //   show: !columnFillRows.HistoryHE,
            // });
            // setColumnFillRows((prev) => ({
            //   ...prev,
            //   HistoryHE: !prev.HistoryHE,
            // }));
            setOpenDialogTrueFalse(true);
            setGroupName("היסטוריה");
          }}
        >
          היסטוריה
        </div>
      ),
      children: [
        { field: "beginningOfWorkPrivateCard" },
        { field: "employersPrivateCard" },
        { field: "reportsPrivateCard" },
        { field: "improvementPrivateCard" },
        { field: "interventionHEPrivateCard" },
      ],
    },
    {
      groupId: "LanguageComprehensionHE",
      renderHeaderGroup: (params) => (
        <div
          className="groupingHeaderNameForms"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("LanguageComprehensionHE");
            // fillFalse({
            //   groupingColumn: "LanguageComprehensionHE",
            //   show: !columnFillRows.LanguageComprehensionHE,
            // });
            // setColumnFillRows((prev) => ({
            //   ...prev,
            //   LanguageComprehensionHE: !prev.LanguageComprehensionHE,
            // }));
            setOpenDialogTrueFalse(true);
            setGroupName("הבנת שפה");
          }}
        >
          הבנת שפה
        </div>
      ),
      children: [
        { field: "understandSpokenLanguageComprehension" },
        { field: "understandWrittenLanguageComprehension" },
      ],
    },

    {
      groupId: "LanguagesHE",
      renderHeaderGroup: (params) => (
        <div
          className="groupingHeaderNameForms"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("LanguagesHE");
            // fillFalse({
            //   groupingColumn: "LanguagesHE",
            //   show: !columnFillRows.LanguagesHE,
            // });
            // setColumnFillRows((prev) => ({
            //   ...prev,
            //   LanguagesHE: !prev.LanguagesHE,
            // }));
            setOpenDialogTrueFalse(true);
            setGroupName("שפות");
          }}
        >
          שפות
        </div>
      ),
      children: [{ field: "hebrew" }, { field: "english" }],
    },
  ];

  return (
    <div className="allForms">
      <Box
        sx={{
          // height: "80vh",
          width: "100%",
          direction: "ltr",
          // backgroundColor: "#256FA133",
          background: "#F5F5F5",
          mb: 2,
          display: "flex",
          flexDirection: "column",

          "& .MuiDataGrid-root": {
            marginRight: "25px",
            marginLeft: "25px",
            border: 0,
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontSize: "Medium",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "white",
            marginTop: "5px",
            marginBottom: "0px",
            borderRadius: "6px",
          },

          "& .MuiDataGrid-cellContent": {
            fontFamily: "Gotham Black, sans-serif",
            fontSize: "medium",
          },

          "& .MuiButton-startIcon": {
            marginLeft: "5px",
          },

          // css-1e2bxag-MuiDataGrid-root .MuiDataGrid-iconSeparator
          //  הפרדה בין כותרת עמודה לכותרת עמודה
          // "& .css-1e2bxag-MuiDataGrid-root .MuiDataGrid-iconSeparator": {
          //   fill: "red",
          // },
          //           "& .css-1e2bxag-MuiDataGrid-root .MuiDataGrid-columnHeader--filledGroup .MuiDataGrid-columnHeaderTitleContainer":

          "& .MuiDataGrid-root .MuiDataGrid-columnHeader--filledGroup .MuiDataGrid-columnHeaderTitleContainer":
            {
              borderBottom: "solid white 3px",
              justifyContent: "center",
            },

          // .css-1e2bxag-MuiDataGrid-root .MuiDataGrid-columnHeader--filledGroup .MuiDataGrid-columnHeaderTitleContainer
          // border-bottom: solid #1976d2 1px;
        }}
      >
        <DataGridPro
          autoHeight
          columnTypes={{
            string: {
              autoWidth: true,
            },
          }}
          sortModel={[
            {
              field: "id",
              sort: "asc",
            },
          ]}
          onCellEditCommit={handleCellEdit}
          sx={{
            direction: "rtl",
            "& .MuiDataGrid-virtualScroller": {
              overflow: "unset !important",
              mt: "0 !important",
            },

            "& .MuiDataGrid-columnHeaders": {
              overflow: "unset",
              position: "sticky",
              left: 1,
              zIndex: 1,
              bgcolor: "#0070A6",
            },
            "& .MuiDataGrid-columnHeadersInner > div": {
              direction: "rtl !important",
            },
            "& .MuiDataGrid-main": {
              overflow: "auto",
            },
            "& .MuiTablePagination-actions": {
              direction: "ltr",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#EDF3F8",
            },
            "& .MuiButton-textSizeSmall": {
              color: "rgb(8,8,137)",
            },
            "& .MuiDataGrid-columnHeadersInner": {
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
              bgcolor: "#0070A6",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              color: "white",
            },

            "& .MuiDataGrid-iconSeparator": {
              color: "white",
            },
            "& .MuiDataGrid-menuIconButton > .MuiSvgIcon-root , .MuiDataGrid-sortIcon":
              {
                color: "white !important",
                opacity: 1,
              },
          }}
          experimentalFeatures={
            ({ newEditingApi: true }, { columnGrouping: true })
          }
          rows={rows}
          columns={columns}
          pageSize={100}
          // rowHeight={52}
          getRowHeight={() => "auto"}
          // getEstimatedRowHeight={() => 150}
          rowsPerPageOptions={[10]}
          pagination
          // scrollbarSize={[1]}
          // scrollArea={(color = "red")}
          checkboxSelection
          disableSelectionOnClick
          onSelectionModelChange={(ids) => {
            const selectedIDs = new Set(ids);
            const selectedRows = rows.filter((row) => selectedIDs.has(row.id));

            setSelectedRows(selectedRows);
          }}
          columnGroupingModel={columnGroupingModel}
          localeText={heIL.components.MuiDataGrid.defaultProps.localeText}
          components={{
            Toolbar: () => (
              <CustomToolbar
                handleChangeUserFlags={handleChangeUserFlags}
                handleChangeRouteFlags={handleChangeRouteFlags}
                allRoutes={allRoutes}
                setSaveProfileChanges={setSaveProfileChanges}
                setChangeUser={setChangeUser}
                setChangeRoute={setChangeRoute}
                allUsers={allUsers}
                setWorker={setWorker}
                worker={worker}
                tableType={tableType}
                isInfoUserRoute={isInfoUserRoute}
                isInfoUserSite={isInfoUserSite}
                selectedRows={selectedRows}
                columns={columns}
                setColumns={setColumns}
                workerName={workerName}
                routeName={routeName}
                siteName={siteName}
                openDialogTrueFalse={openDialogTrueFalse}
                setOpenDialogTrueFalse={setOpenDialogTrueFalse}
                routeForTasksAbility={routeForTasksAbility}
                setRouteForTasksAbility={setRouteForTasksAbility}
                prevSelectedWorker={prevSelectedWorker}
                newTaskCognitiveRequirements={newTaskCognitiveRequirements}
              />
            ),
          }}
          disableVirtualization
          componentsProps={{
            toolbar: {
              utf8WithBom: true,
              showQuickFilter: false,
              quickFilterProps: {
                debounceMs: 500,
              },
            },
          }}
        />

        <div>
          <Dialog
            style={{ direction: "rtl" }}
            open={openDialogTrueFalse}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle> ?רלוונטי {groupName} האם</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                בחירה של אופציה לא רלוונטי ימלא את את כל העמודות תחת הקטגוריה "
                {groupName}" כלא רלוונטיות, ובחירה של רלוונטי יאפס את כל המשבצות
                לריקות.
              </DialogContentText>
              <FormControl
                sx={{
                  m: 1,
                  minWidth: 220,
                  maxWidth: 220,
                  "& 	.MuiInputLabel-formControl": {
                    background: "#d3e2ec",
                  },
                }}
                size="small"
              >
                {/* <InputLabel id="example1">{headers}</InputLabel> */}
                <InputLabel id="example1">{groupName}</InputLabel>

                <Select
                  labelId="example1"
                  id="example1"
                  // defaultValue={true}
                  value={columnFillRows.PrivateInfoHE}
                  onChange={handleChange}
                  autoWidth
                  label={groupName}
                >
                  <MenuItem value={true}>הכרחי לביצוע המשימה</MenuItem>
                  <MenuItem value={false}>לא הכרחי לביצוע המשימה</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Disagree</Button>
              <Button onClick={handleClose}>Agree</Button>
            </DialogActions>
          </Dialog>
        </div>
      </Box>
      {/* <pre style={{ fontSize: 10 }}>
        {JSON.stringify(selectedRows, null, 4)}
        {selectedRows.length}
      </pre> */}
    </div>
  );
};

export default DataTableRTL;

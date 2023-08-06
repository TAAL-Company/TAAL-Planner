import React, { useEffect, useState } from "react";
// import cognitiveList from "./Form/cognitive.json";
import cognitiveProfilesFile from "./Form/cognitiveProfiles.json";
import taskAbility from "./Form/taskAbility.json";
// import post_cognitive_abillities from "../api/api"
//----------------------------------------------------------------
import Box from "@mui/material/Box";
import "../components/Form/FormsComponents/data_grid/DataTableRTL.css";
import CustomToolbar from "../components/Form/FormsComponents/data_grid/CustomToolbar";

import { DataGridPro } from "@mui/x-data-grid-pro";
import { heIL } from "@mui/x-data-grid";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import {
  getCognitiveAbillities,
  post_cognitive_abillities,
  getingData_Users,
  insertUser,
  postDataCognitiveProfile,
  postTaskCognitiveRequirements,
} from "../api/api";

const CognitiveAbillities = () => {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = React.useState("");


  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_Users();
      setUsers(usersData);
    };

    fetchData();
    // console.log("usersData", usersData);

    taskAbilityPost();
  }, []);

  // Transform the data of cognitive Profiles
  // const transformedData = cognitiveList.map((item) => {
  //   const value = [];
  //   for (let i = 0; i <= 340; i++) {
  //     console.log("item: ", item[i.toString()]);
  //     if (item[i.toString()] != undefined) {
  //       value.push(item[i.toString()]);
  //     }
  //   }
  //   return {
  //     name: item.name,
  //     worker_id: item.worker_id,
  //     mail: item.mail,
  //     value: value,
  //   };
  // });

  const cognitiveProfiles = () => {
    cognitiveProfilesFile.map(async (item) => {
      const name = users.find((student) => student.name === item.name);
      console.log("name: ", name);

      if (name !== undefined) {
        //   insertUser({ email: item.mail, name: item.name, user_name: item.name });
        //   console.log("name1: ", name);

        await postDataCognitiveProfile(name.id, item.value);
      }
    });
  };

  function postCognitiveABillities() {
    cognitiveList.map((item) => {
      post_cognitive_abillities({
        index: item.index,
        trait: item.trait,
        requiredField: item.requiredField,
        score: item.score,
        general: "",
        category: item.category,
        classification: "",
        ML: item.ML,
      });
    });
  }
  const [cognitiveList, setCognitiveList] = useState([]);

  useEffect(async () => {
    const get = await getCognitiveAbillities();
    setCognitiveList(get);
    // postCognitiveABillities();
  }, []);
  // useEffect(() => {
  //   cognitiveProfiles();
  // }, [users]);

  // const transData = taskAbility.map((item) => {
  //   const value = [];
  //   const weights = [];

  //   for (let i = 0; i <= 340; i++) {
  //     console.log("item: ", item[i.toString()]);
  //     if (item[i.toString()] != undefined) {
  //       const [letter, number] = item[i.toString()]
  //         .match(/([A-Z]+)(\d+)/)
  //         .slice(1);
  //       value[i] = parseInt(number);
  //       weights[i] = letter;
  //     }
  //   }

  //   return {
  //     route: item.route,
  //     station: item.station,
  //     task: item.task,
  //     value: value,
  //     weights: weights,
  //   };
  // });

  const taskAbilityPost = () => {
    taskAbility.map((item) => {
      const value = [];
      const weights = [];

      item.weights.map((weight) => {
        if (weight === "A") {
          weights.push(0);
        } else if (weight === "B") {
          weights.push(1);
        } else if (weight === "C") {
          weights.push(2);
        } else if (weight === "D") {
          weights.push(3);
        } else if (weight === "E") {
          weights.push(4);
        } else {
          weights.push(5);
        }
      });

      postTaskCognitiveRequirements({
        taskId: item.taskId,
        value: item.value,
        weights: weights,
      });
    });
  };
  const handleChange = (event) => {

  };
  // // Convert the transformed data to JSON
  // const transformedJson = JSON.stringify(transformedData, null, 2);

  // // Print the transformed JSON data
  // console.log(transformedJson);

  const handleDelete = (id) => {
    console.log("id:", id);
  };
  const columns = ([
    {field:"id", headerName: 'ID'},
    {field:"index", headerName: 'NO'},
    {field:"trait", headerName: 'Trait'},
    {field:"requiredField", headerName: 'Required Field'},
    {field:"category", headerName: 'Category'},
    {field:"score", headerName: 'Score'},
    {field:"ML", headerName: 'ML'}
  ])

return (
  // <table>
  //   <thead>
  //     <tr>
  //       <th>NO</th>
  //       <th>Trait</th>
  //       <th>Required Field</th>
  //       <th>Category</th>
  //       <th>Score</th>
  //       <th>ML</th>
  //     </tr>
  //   </thead>
  //   <tbody>
  //     {cognitiveList.length > 0 &&
  //       cognitiveList?.map((item) => (
  //         <tr key={item.id}>
  //           <td>{item.index}</td>
  //           <td>{item.trait}</td>
  //           <td>{item.requiredField ? "Yes" : "No"}</td>
  //           <td>{item.category}</td>
  //           <td>{item.score}</td>
  //           <td>{item.ML ? "Yes" : "No"}</td>
  //           <td>
  //             <button onClick={() => handleDelete(item.id)}>מחיקה</button>
  //           </td>
  //         </tr>
  //       ))}
  //   </tbody>
  // </table>

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
        //onCellEditCommit={handleCellEdit}
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
        rows={cognitiveList}
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
        // onSelectionModelChange={(ids) => {
        //   const selectedIDs = new Set(ids);
        //   const selectedRows = rows.filter((row) => selectedIDs.has(row.id));

        //   setSelectedRows(selectedRows);
        // }}
        //columnGroupingModel={columnGroupingModel}
        localeText={heIL.components.MuiDataGrid.defaultProps.localeText}
        components={{
          Toolbar: () => (
            <CustomToolbar
            // handleChangeUserFlags={handleChangeUserFlags}
            // handleChangeRouteFlags={handleChangeRouteFlags}
            // allRoutes={allRoutes}
            // setSaveProfileChanges={setSaveProfileChanges}
            // setChangeUser={setChangeUser}
            // setChangeRoute={setChangeRoute}
            // allUsers={allUsers}
            // setWorker={setWorker}
            // worker={worker}
            // tableType={tableType}
            // isInfoUserRoute={isInfoUserRoute}
            // isInfoUserSite={isInfoUserSite}
            // selectedRows={selectedRows}
            // columns={columns}
            // setColumns={setColumns}
            // workerName={workerName}
            // routeName={routeName}
            // siteName={siteName}
            // openDialogTrueFalse={openDialogTrueFalse}
            // setOpenDialogTrueFalse={setOpenDialogTrueFalse}
            // routeForTasksAbility={routeForTasksAbility}
            // setRouteForTasksAbility={setRouteForTasksAbility}
            // prevSelectedWorker={prevSelectedWorker}
            // newTaskCognitiveRequirements={newTaskCognitiveRequirements}
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
          //open={openDialogTrueFalse}
          //TransitionComponent={Transition}
          keepMounted
          // onClose={handleClose}
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
                value={cognitiveList}
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
            <Button onClick={false}>Disagree</Button>
            <Button onClick={false}>Agree</Button>
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

export default CognitiveAbillities;

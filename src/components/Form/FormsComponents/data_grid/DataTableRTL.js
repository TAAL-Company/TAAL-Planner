import * as React from "react";
import Box from "@mui/material/Box";
import "./DataTableRTL.css";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
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
import { Button } from "@mui/material";
import MultipleEdit from "../multiple_edit/MultipleEdit";
import AddColumn from "../add_column/AddColumn";
import { DataGridPro } from "@mui/x-data-grid-pro";
import SaveIcon from "@mui/icons-material/Save";

// const [columnsIds, setColumnsIds] = React.useState([
//   { id: 3, fill: true },
//   { id: 2, fill: false },
//   { id: 1, fill: false },
// ]);

function CustomToolbar({
  isInfoUserRoute,
  isInfoUserSite,
  tableType,
  selectedRows,
  columns,
  setColumns,
  workerName,
  routeName,
  siteName,
}) {
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
          <GridToolbarExport style={{ color: "black" }} />
        </div>

        {isInfoUserRoute && (
          <div className="infoTableRTL">
            <div className="workerNameTableRTL">שם עובד: {workerName}</div>
            <div className="workerRouteTableRTL">שם מסלול: {routeName}</div>
          </div>
        )}

        {isInfoUserSite && (
          <div className="infoTableRTL">
            <div className="workerNameTableRTL">שם עובד: {workerName}</div>
            <div className="workerRouteTableRTL">שם אתר: {siteName}</div>
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
            className="buttonaNavbar"
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
            className="buttonaNavbar"
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
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="buttonaNavbar"
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
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
}) => {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [columnFillRows, setColumnFillRows] = React.useState({
    PrivateInfoHE: true,
    HistoryHE: true,
    LanguageComprehensionHE: true,
    LanguagesHE: true,
  });

  const columnGroupingModel = [
    {
      groupId: "PrivateInfoHE",
      description: "",
      renderHeaderGroup: (params) => (
        <div
          className="groupingHeaderName"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("PrivateInfoHE");
            fillFalse({
              groupingColumn: "PrivateInfoHE",
              show: !columnFillRows.PrivateInfoHE,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              PrivateInfoHE: !prev.PrivateInfoHE,
            }));
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
          className="groupingHeaderName"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("HistoryHE");
            fillFalse({
              groupingColumn: "HistoryHE",
              show: !columnFillRows.HistoryHE,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              HistoryHE: !prev.HistoryHE,
            }));
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
          className="groupingHeaderName"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("LanguageComprehensionHE");
            fillFalse({
              groupingColumn: "LanguageComprehensionHE",
              show: !columnFillRows.LanguageComprehensionHE,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              LanguageComprehensionHE: !prev.LanguageComprehensionHE,
            }));
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
          className="groupingHeaderName"
          style={{ cursor: "pointer", color: "white" }}
          onClick={() => {
            console.log("LanguagesHE");
            fillFalse({
              groupingColumn: "LanguagesHE",
              show: !columnFillRows.LanguagesHE,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              LanguagesHE: !prev.LanguagesHE,
            }));
          }}
        >
          שפות
        </div>
      ),
      children: [{ field: "hebrew" }, { field: "english" }],
    },
  ];

  return (
    <div className="all">
      <Box
        sx={{
          height: "80vh",
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
        <div></div>

        <DataGridPro
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
          pageSize={10}
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
                tableType={tableType}
                isInfoUserRoute={isInfoUserRoute}
                isInfoUserSite={isInfoUserSite}
                selectedRows={selectedRows}
                columns={columns}
                setColumns={setColumns}
                workerName={workerName}
                routeName={routeName}
                siteName={siteName}
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
      </Box>
      {/* <pre style={{ fontSize: 10 }}>
        {JSON.stringify(selectedRows, null, 4)}
        {selectedRows.length}
      </pre> */}
    </div>
  );
};

export default DataTableRTL;

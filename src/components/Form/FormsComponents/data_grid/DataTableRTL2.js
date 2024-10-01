import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { heIL } from '@mui/x-data-grid';
import CustomToolbar from './CustomToolbar';
export default function DataTableRTL2({ 
  columns,
  rows,
  tableType,
  routeForTasksAbility={routeForTasksAbility},
  setRouteForTasksAbility={setRouteForTasksAbility},
  allRoutes,
  setColumns,
  isInfoUserRoute,
  isInfoUserSite,
  fillFalse,
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
  prevSelectedWorker,
}) {

  const groups = columns.reduce((groups, column) => {
    const group = column.category;
    if (group != undefined) {
      if (!groups[group]) {
        groups[group] = {
          groupId: group,
          children: [],
        };
      }
      groups[group].children.push({ field: column.field });
    }
    return groups;
  }, {});
  const columnGroupingModel = Object.values(groups);

  const handleCellEdit = (params) => {
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
  };
  
  return (
    <div className='allForms' >
      <Box
        sx={{
          // height: "80vh",
          width: '100%',
          direction: 'ltr',
          // backgroundColor: "#256FA133",
          background: '#F5F5F5',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          '& .MuiDataGrid-root': {
            marginRight: '50px',
            marginLeft: '50px',
            border: 0,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: 'Medium',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row': {//////////////////////////////////////////////////////////////////// ctrl + f = .MuiDataGrid-row
            backgroundColor: 'white',
            marginTop: '8px',
            marginBottom: '0px',
            borderRadius: '6px',
            border: "1px solid gray"
          },
          "& .MuiDataGrid-cell": {
             border:'solid grey 1px',
            },
          '& .MuiDataGrid-cellContent': {
            fontFamily: 'Gotham Black, sans-serif',
            fontSize: 'medium',
            marginRight:'10px',
            margin:'10px',
          },

          '& .MuiButton-startIcon': {
            marginLeft: '5px',
          },

          // css-1e2bxag-MuiDataGrid-root .MuiDataGrid-iconSeparator
          //  הפרדה בין כותרת עמודה לכותרת עמודה
          // "& .css-1e2bxag-MuiDataGrid-root .MuiDataGrid-iconSeparator": {
          //   fill: "red",
          // },
          //           "& .css-1e2bxag-MuiDataGrid-root .MuiDataGrid-columnHeader--filledGroup .MuiDataGrid-columnHeaderTitleContainer":

          '& .MuiDataGrid-root .MuiDataGrid-columnHeader--filledGroup .MuiDataGrid-columnHeaderTitleContainer':
            {
              borderBottom: 'solid white 3px',
              justifyContent: 'center',
              
            },
            '& .css-lm239v-MuiDataGrid-root .MuiDataGrid-columnHeader, .css-lm239v-MuiDataGrid-root .MuiDataGrid-cell': {
              padding: '5px',
            }

          // .css-1e2bxag-MuiDataGrid-root .MuiDataGrid-columnHeader--filledGroup .MuiDataGrid-columnHeaderTitleContainer
          // border-bottom: solid #1976d2 1px;
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          checkboxSelection
          disableRowSelectionOnClick
          columnGroupingModel={columnGroupingModel}
          onCellEditCommit={handleCellEdit}
          sx={{
            direction: 'rtl',
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'unset !important',
              mt: '0 !important',
            },

            '& .MuiDataGrid-columnHeaders': {
              overflow: 'unset',
              position: 'sticky',
              left: 1,
              zIndex: 1,
              bgcolor: '#114260',
            },
            '& .MuiDataGrid-columnHeadersInner > div': {
              direction: 'rtl !important',
            },
            '& .MuiDataGrid-main': {
              overflow: 'auto',
              height: '40vmax',
            },
            '& .MuiTablePagination-actions': {
              direction: 'ltr',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#EDF3F8',
            },
            '& .MuiButton-textSizeSmall': {
              color: 'rgb(8,8,137)',
            },
            '& .MuiDataGrid-columnHeadersInner': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
              bgcolor: '#114260',
            },

            '& .MuiDataGrid-columnHeaderTitle': {
              color: 'white',
            },

            '& .MuiDataGrid-iconSeparator': {
              color: 'white',
            },
            '& .MuiDataGrid-menuIconButton > .MuiSvgIcon-root , .MuiDataGrid-sortIcon':
              {
                color: 'white !important',
                opacity: 1,
              },
          }}
          experimentalFeatures={
            ({ newEditingApi: true }, { columnGrouping: true })
          }
          localeText={heIL.components.MuiDataGrid.defaultProps.localeText}
          // disableVirtualization

          components={{
            Toolbar: () => (
              <CustomToolbar
                tableType={tableType}
                routeForTasksAbility={routeForTasksAbility}
                setRouteForTasksAbility={setRouteForTasksAbility}
                allRoutes={allRoutes}
                isInfoUserSite={isInfoUserSite}
                allUsers={allUsers}
                setWorker={setWorker}
                worker={worker}
                setChangeUser={setChangeUser}
                setSaveProfileChanges={setSaveProfileChanges}
              />
            ),
          }}

        />
      </Box>
    </div>
  );
}

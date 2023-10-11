import * as React from 'react';

import Box from '@mui/material/Box';
import './DataTableLTR.css';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import {
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { Button } from '@mui/material';
import MultipleEdit from '../multiple_edit/MultipleEdit';
import AddColumn from '../add_column/AddColumn';
import SaveIcon from '@mui/icons-material/Save';

import { DataGridPro } from '@mui/x-data-grid-pro';

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
          paddingTop: '20px',
          paddingBottom: '15px',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <GridToolbarColumnsButton style={{ color: 'black' }} />
          <GridToolbarFilterButton style={{ color: 'black' }} />
          <GridToolbarDensitySelector style={{ color: 'black' }} />
          <GridToolbarExport
            csvOptions={{
              fileName: `${
                tableType === 'TaskabilityHE'
                  ? 'Taskability'
                  : tableType === 'CognitiveProfileHE'
                  ? 'CognitiveProfile'
                  : "TA'AL EDITOR"
              }_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`,
              utf8WithBom: true,
            }}
            style={{ color: 'black' }}
          />
        </div>

        {isInfoUserRoute && (
          <div className='infoForms'>
            <div className='workerNameForms'>Worker: {workerName}</div>
            <div className='workerRouteForms' style={{ paddingLeft: '25px' }}>
              Route: {routeName}
            </div>
          </div>
        )}
        {isInfoUserSite && (
          <div className='infoForms'>
            <div className='workerNameForms'>Worker: {workerName}</div>
            <div className='workerRouteForms' style={{ paddingLeft: '25px' }}>
              Site: {siteName}
            </div>
          </div>
        )}
        <div>
          <InputAdornment position='start'>
            <GridToolbarQuickFilter
              InputProps={{ disableUnderline: true }}
              placeholder=' Search'
              style={{
                paddingRight: '10px',
                width: '250px',
                position: 'relative',
                borderRadius: '8px',
                paddingBottom: '2px',
                marginTop: '2px',
                background: 'white',
              }}
              sx={{
                '& .MuiInputBase-root': {
                  // background: "blue",
                  width: '87%',
                  height: '28px',
                },
              }}
            />
            <SearchIcon
              style={{
                marginLeft: '-30px',
                zIndex: '5',
              }}
            />
          </InputAdornment>
        </div>
      </GridToolbarContainer>
      {tableType === 'TaskabilityEN' && selectedRows.length >= 2 ? (
        <>
          <div
            className='buttonaNavbarForms'
            style={{ display: 'flex', right: 0, paddingBottom: '10px' }}
          >
            <div style={{ marginRight: '10px' }}>
              <MultipleEdit
                textButton={'Multiple Edit'}
                selectedRows={selectedRows}
                fieldsCount={columns.length}
                columns={columns}
              />
            </div>
            <AddColumn columns={columns} setColumns={setColumns}></AddColumn>
            {/* {selectedRows.map((item) => item.tasks)} */}
          </div>
        </>
      ) : tableType === 'TaskabilityEN' ? (
        <>
          <div
            className='buttonaNavbarForms'
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant='outlined'
                disabled
                style={{ marginRight: '10px' }}
              >
                Multiple Edit
              </Button>
              <AddColumn columns={columns} setColumns={setColumns} />
            </div>
            <div style={{ display: 'flex' }}>
              <SaveIcon
                fontSize='large'
                color='primary'
                style={{ zIndex: '5' }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className='buttonaNavbarForms'
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
            }}
          >
            <AddColumn columns={columns} setColumns={setColumns} />
            <div style={{ display: 'flex', right: 0 }}>
              <SaveIcon
                fontSize='large'
                color='primary'
                style={{ zIndex: '5' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const DataTableLTR = ({
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
  allRoutes,
  prevSelectedWorker,
}) => {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [columnFillRows, setColumnFillRows] = React.useState({
    PrivateInfoEN: true,
    HistoryEN: true,
    LanguageComprehensionEN: true,
    LanguagesEN: true,
  });

  const columnGroupingModel = [
    {
      groupId: 'PrivateInfoEN',
      description: '',
      renderHeaderGroup: (params) => (
        <div
          className='groupingHeaderNameForms'
          style={{ cursor: 'pointer', color: 'white' }}
          onClick={() => {
            fillFalse({
              groupingColumn: 'PrivateInfoEN',
              show: !columnFillRows.PrivateInfoEN,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              PrivateInfoEN: !prev.PrivateInfoEN,
            }));
          }}
        >
          Private Info
        </div>
      ),
      children: [
        { field: 'fieldHEPrivateCard' },
        { field: 'xPrivateCard' },
        { field: 'yPrivateCard' },
        { field: 'fieldENPrivateCard' },
        { field: 'classificationHEPrivateCard' },
      ],
    },
    {
      groupId: 'HistoryEN',
      renderHeaderGroup: (params) => (
        <div
          className='groupingHeaderNameForms'
          style={{ cursor: 'pointer', color: 'white' }}
          onClick={() => {
            fillFalse({
              groupingColumn: 'HistoryEN',
              show: !columnFillRows.HistoryEN,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              HistoryEN: !prev.HistoryEN,
            }));
          }}
        >
          History
        </div>
      ),
      children: [
        { field: 'beginningOfWorkPrivateCard' },
        { field: 'employersPrivateCard' },
        { field: 'reportsPrivateCard' },
        { field: 'improvementPrivateCard' },
        { field: 'interventionHEPrivateCard' },
      ],
    },
    {
      groupId: 'LanguageComprehensionEN',
      renderHeaderGroup: (params) => (
        <div
          className='groupingHeaderNameForms'
          style={{ cursor: 'pointer', color: 'white' }}
          onClick={() => {
            fillFalse({
              groupingColumn: 'LanguageComprehensionEN',
              show: !columnFillRows.LanguageComprehensionEN,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              LanguageComprehensionEN: !prev.LanguageComprehensionEN,
            }));
          }}
        >
          Language Comprehension
        </div>
      ),
      children: [
        { field: 'understandSpokenLanguageComprehension' },
        { field: 'understandWrittenLanguageComprehension' },
      ],
    },

    {
      groupId: 'LanguagesEN',
      renderHeaderGroup: (params) => (
        <div
          className='groupingHeaderNameForms'
          style={{ cursor: 'pointer', color: 'white' }}
          onClick={() => {
            fillFalse({
              groupingColumn: 'LanguagesEN',
              show: !columnFillRows.LanguagesEN,
            });
            setColumnFillRows((prev) => ({
              ...prev,
              LanguagesEN: !prev.LanguagesEN,
            }));
          }}
        >
          Languages
        </div>
      ),
      children: [{ field: 'hebrew' }, { field: 'english' }],
    },
  ];

  return (
    <div className='allForms'>
      <Box
        sx={{
          height: 750,
          width: '100%',
          direction: 'ltr',
          // backgroundColor: "#256FA133",
          background: '#F5F5F5',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',

          '& .MuiDataGrid-root': {
            marginRight: '25px',
            marginLeft: '25px',
            border: 0,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: 'Medium',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'white',
            marginTop: '5px',
            marginBottom: '0px',
            borderRadius: '6px',
          },

          '& .MuiDataGrid-cellContent': {
            fontFamily: 'Gotham Black, sans-serif',
            fontSize: 'medium',
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

          // .css-1e2bxag-MuiDataGrid-root .MuiDataGrid-columnHeader--filledGroup .MuiDataGrid-columnHeaderTitleContainer
          // border-bottom: solid #1976d2 1px;
        }}
      >
        {/* <MultipleSelectChip></MultipleSelectChip>
        <AccessibleTabs1></AccessibleTabs1> */}
        <div></div>
        <DataGridPro
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#EDF3F8',
            },
            '& .MuiButton-textSizeSmall': {
              color: 'rgb(8,8,137)',
            },
            '& .MuiDataGrid-columnHeadersInner': {
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
              bgcolor: '#0070A6',
            },
            '& .MuiDataGrid-pinnedColumnHeaders': {
              bgcolor: '#d3e2ec',
            },
            '& .MuiDataGrid-pinnedColumns--left': {
              bgcolor: '#d3e2ec',
            },

            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#0070A6',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: 'white',
            },

            // "& .MuiSvgIcon-root": {
            //   color: "white",
            // },
            '& .MuiDataGrid-iconSeparator': {
              color: 'white',
            },
            '& .MuiDataGrid-menuIconButton > .MuiSvgIcon-root , .MuiDataGrid-sortIcon':
              {
                color: 'white !important',
              },

            // "& .MuiDataGrid-pinnedColumns--right": {
            //   bgcolor: "#d3e2ec",
            // },
          }}
          experimentalFeatures={
            ({ newEditingApi: true }, { columnGrouping: true })
          }
          rows={rows}
          columns={columns}
          pageSize={100}
          // rowHeight={52}
          getRowHeight={() => 'auto'}
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
          initialState={{
            pinnedColumns: {
              // left: ["taskTaskabilityHE"],
              // right: ["actionsTaskabilityHE"],
            },
          }}
          columnGroupingModel={columnGroupingModel}
          // localeText={heIL.components.MuiDataGrid.defaultProps.localeText}
          components={{
            Toolbar: () => (
              <CustomToolbar
                allRoutes={allRoutes}
                tableType={tableType}
                isInfoUserRoute={isInfoUserRoute}
                isInfoUserSite={isInfoUserSite}
                selectedRows={selectedRows}
                columns={columns}
                setColumns={setColumns}
                workerName={workerName}
                routeName={routeName}
                siteName={siteName}
                prevSelectedWorker={prevSelectedWorker}
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

export default DataTableLTR;

import React from 'react';
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Container, InputAdornment, Box as MUIBox, Paper, TextField, Typography } from "@mui/material";
// import textArea from '../../Pictures/textArea.svg';

const TextAreaSVG = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="263.639" height="173.932" viewBox="0 0 263.639 173.932">
    <defs>
      <clipPath id="clip-path">
        <rect id="Rectangle_637" data-name="Rectangle 637" width="263.639" height="173.932" fill="#fff" stroke="#a8a8a8" strokeWidth="2" />
      </clipPath>
    </defs>
    <g id="Group_4859" data-name="Group 4859" transform="translate(0 0)">
      <g id="Group_4857" data-name="Group 4857" transform="translate(0 0)" clipPath="url(#clip-path)">
        <path id="Path_6400" data-name="Path 6400" d="M235.124,32.344H221.911a130.114,130.114,0,0,1,5-31.125c-19.832,4.97-32.3,15.015-40.812,31.125H25.911A24.693,24.693,0,0,0,1.218,57.037v88.379a24.692,24.692,0,0,0,24.693,24.693H235.124a24.692,24.692,0,0,0,24.693-24.693V57.037A24.693,24.693,0,0,0,235.124,32.344Z" transform="translate(1.301 1.303)" fill="#fff" stroke="#a8a8a8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </g>
    </g>
    <foreignObject x="10" y="10" width="243.639" height="153.932">
      {children}
    </foreignObject>
  </svg>
);

export function Plannerbox({ droppableId, data, renderItem, color, title, icontext, direction, customDroppableContent }) {
  return (
    <div>
      <MUIBox
        sx={{
          bgcolor: "#f5f5f5",
          direction: direction, // Right-to-left for Hebrew
          borderRadius: 5,
          boxShadow: 3,
        }}
      >
        {/* Header */}
        <MUIBox
          sx={{
            bgcolor: color,
            p: 1.5,
            boxShadow: 1,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "white" }} variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </MUIBox>

        {/* Search Bar */}
        <Container sx={{ mt: 2 }}>
          <TextField
            fullWidth
            placeholder="חיפוש"
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "#fff",
                borderRadius: 5,
                boxShadow: 5,
              },
            }}
          />
        </Container>

        {/* Show All Stations Button */}
        <Container sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: color,
              color: "white",
              textTransform: "none",
              py: 1,
              borderRadius: 2,
              boxShadow: 5,
            }}
          >
            הצג את כל התחנות
          </Button>
        </Container>

        {/* Droppable Area */}
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <Container
              maxWidth="sm"
              sx={{
                mt: 4,
                minHeight: "40vh",
                maxHeight: "40vh",
                overflowX: "hidden",
                overflowY: "scroll",
              }}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {/* 🧠 Conditional rendering of TreeView or Draggable list */}
              {data.length > 0 ? (
                customDroppableContent ? (
                  customDroppableContent
                ) : (
                  data.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {renderItem(item)}
                        </div>
                      )}
                    </Draggable>
                  ))
                )) : (
                <MUIBox sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* <div
                    className={`textBeforeStation`}
                    style={{ backgroundImage: `url(${textArea})` }}
                  >
                    <div
                      className={`textBeforeStationtext`}>
                      {icontext}
                    </div>
                  </div> */}
                  <TextAreaSVG>
                    <Typography align="center" sx={{ mt: 6 }}>
                      {icontext}
                    </Typography>
                  </TextAreaSVG>
                </MUIBox>
              )}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>

        {/* Bottom Input Area */}
        <Container sx={{ mt: 4, textAlign: "center", p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "2px dashed #ccc",
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AddIcon sx={{ color: "#999" }} />
          </Paper>
        </Container>
      </MUIBox>
    </div>
  );
}
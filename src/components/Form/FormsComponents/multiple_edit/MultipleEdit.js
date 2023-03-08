import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function PaperComponent(props) {
  return (
    <Draggable>
      <Paper {...props} style={{ direction: "rtl" }} />
    </Draggable>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide({
  textButton,
  selectedRows,
  fieldsCount,
  columns,
}) {
  const [open, setOpen] = React.useState(false);
  const [slide, setSlide] = React.useState(false);
  const [initialValuesRow, setInitialValuesRow] = React.useState({});
  const [currRow, setCurrRow] = React.useState({});

  const labels = Array.from({ length: fieldsCount - 1 }, (_, i) => (
    <TextField
      key={i}
      autoFocus
      variant="outlined"
      error={false}
      id="outlined-error-helper-text"
      label={columns[i].headerName}
      value={selectedRows[0][columns[i].headerName]}
      onChange={(e) =>
        setCurrRow({ ...currRow, [columns[i].headerName]: e.target.value })
      }
      helperText=""
    />
  ));

  // console.log("textButton: " + textButton);
  // console.log(selectedRows);

  const handleClickOpen = () => {
    setOpen(true);
    setSlide(!slide);
    setInitialValuesRow(selectedRows[0]);
    setCurrRow(selectedRows[0]);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleReset = () => {
    setCurrRow(initialValuesRow);
  };

  const handleSave = (data) => {
    // if (explainationError || interventionError) {
    //   return;
    // }
    const updatedRows = [...selectedRows];
    let eyh = true;

    for (let i = 0; i < selectedRows.length && eyh; i++) {
      if (selectedRows[i].id === data.id) {
        // console.log("true");
        updatedRows[i] = data;
        // setRowsFlags(updatedRows);
        eyh = false;
      }
    }
    // console.log(updatedRows);
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        {textButton}
      </Button>

      <Dialog
        maxWidth="xl"
        disableEscapeKeyDown
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        TransitionComponent={Transition}
        keepMounted={slide}
        aria-labelledby={"alert-dialog-slide-title"}
        aria-describedby={"alert-dialog-slide-description"}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          <DialogTitle style={{ cursor: "move" }} id={"draggable-dialog-title"}>
            {textButton}
          </DialogTitle>

          <DialogActions style={{ direction: "rtl", flexGrow: 1 }}>
            <Button onClick={handleClose}>X</Button>
          </DialogActions>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingRight: "25px",
          }}
        >
          {selectedRows.map((item) => (
            <div style={{ margin: "10px 0" }}>{"◉  " + item.tasks}</div>
          ))}
        </div>
        <DialogContent dividers>
          <DialogContentText id="alert-dialog-slide-description">
            <Box
              component="form"
              sx={{
                "& .MuiTextField-root": { m: 1, width: "25ch" },
              }}
              noValidate
              autoComplete="off"
            >
              <div
                className="inputUserForm"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {/* <TextField
                    variant="outlined"
                    error={false}
                    id="outlined-error-helper-text"
                    label="Hebrew"
                    value={selectedRows[0].hebrew}
                    onChange={(e) =>
                      setCurrRow({ ...currRow, Hebrew: e.target.value })
                    }
                    helperText=""
                  />
                  <TextField
                    variant="outlined"
                    error={false}
                    id="outlined-error-helper-text"
                    label="English"
                    // defaultValue="שם משתמש"
                    value={selectedRows[0].English}
                    onChange={(e) =>
                      setCurrRow({ ...currRow, English: e.target.value })
                    }
                    helperText=""
                  /> */}{" "}
                  <div>{labels}</div>
                </div>
              </div>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleReset}>
            {"Reset"}
          </Button>
          <Button onClick={() => handleSave(currRow)}>{"Save"}</Button>

          {/* {slide ? null : <Button onClick={toggleSlide}>Toggle Slide</Button>} */}
        </DialogActions>
      </Dialog>
    </div>
  );
}

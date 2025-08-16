import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { DialogActions, DialogContent, DialogTitle } from "@mui/material";

export default function AddColumn({ columns, setColumns }) {
  const [open, setOpen] = React.useState(false);
  const [headerName, setHeaderName] = React.useState("");
  const [helperText, setHelperText] = React.useState("");
  const [error, setError] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    if (!headerName) {
      setHelperText("עמודה אינה יכולה להיות ריקה");
      setError(true);
    } else {
      const newColumns = [
        ...columns.slice(0, columns.length - 1),
        { field: headerName, headerName: headerName },
        columns[columns.length - 1],
      ];
      setColumns(newColumns);
      setOpen(false);
      setHeaderName("");
    }
  };

  return (
    <Box style={{ direction: "rtl" }}>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        New Column
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <div
          style={{
            display: "flex",
          }}
        >
          <DialogActions style={{ direction: "rtl", flexGrow: 1 }}>
            <Button onClick={handleClose}>X</Button>
          </DialogActions>

          <DialogTitle>הכנס כותרת לעמודה חדשה</DialogTitle>
        </div>
        <DialogContent style={{ direction: "rtl" }}>
          <TextField
            style={{ direction: "rtl" }}
            autoFocus
            margin="dense"
            id="columnName"
            label="כותרת עמודה"
            type="text"
            fullWidth
            error={error}
            helperText={helperText}
            onChange={(event) => setHeaderName(event.target.value)}
          />
        </DialogContent>
        <DialogActions style={{ direction: "rtl" }}>
          <Button onClick={handleSave} color="primary">
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

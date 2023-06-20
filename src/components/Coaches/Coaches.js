import React, { useState, useEffect } from "react";
import "./Coaches.css";
import defualtSiteImg from "../../Pictures/defualtSiteImg.svg";
import {
  getingData_coaches,
  deleteCoach,
  patchForCoach,
  post_cognitive_abillities,
} from "../../api/api";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { insertCoach } from "../../api/api";
import { BsThreeDotsVertical } from "react-icons/bs";
import Modal_dropdown from "../Modal/Modal_dropdown";
import cognitiveList from "../Form/cognitive.json";
const Coaches = () => {
  const [users, setUsers] = useState([]); // State to store the users
  const [userForRemove, setUserForRemove] = useState([]); // State to store the user to be removed
  const [userForUpdate, setUserForUpdate] = useState(-1); // State to store the index of the user to be updated
  const [open, setOpen] = React.useState(false); // State to manage the open state of the dialog
  const [openRemove, setOpenRemove] = React.useState(false); // State to manage the open state of the remove dialog

  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1); // State to manage the open state of the vertical three dots
  const [requestForEditing, setRequestForEditing] = useState(""); // State to store the request for editing

  useEffect(() => {
    console.log("student openThreeDotsVertical: ", openThreeDotsVertical);
  }, [openThreeDotsVertical]);

  useEffect(() => {
    console.log("student requestForEditing: ", requestForEditing);

    if (requestForEditing === "edit" || requestForEditing === "details") {
      setOpen(true);
      setUserForUpdate(openThreeDotsVertical);
    } else if (requestForEditing === "duplication") {
      console.log("openThreeDotsVertical", openThreeDotsVertical);
    } else if (requestForEditing === "delete") {
      setUserForRemove(openThreeDotsVertical);
      console.log("openThreeDotsVertical", openThreeDotsVertical);
      setOpenRemove(true);
    }
  }, [requestForEditing]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRequestForEditing("");
    setOpenThreeDotsVertical(-1);
  };

  const handleClickOpenRemove = () => {
    setOpenRemove(true);
  };

  const handleCloseRemove = () => {
    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing("");
  };

  const handleCloseRemoveConfirm = async () => {
    console.log("DELETE:", userForRemove);
    let deletedUser = await deleteCoach(users[userForRemove].id);

    console.log("deletedUser:", deletedUser);
    if (deletedUser.status === 200) {
      alert("המחיקה בוצעה בהצלחה!");
      const newUsers = [...users];
      newUsers.splice(userForRemove, 1); // Remove one element at index x
      setUsers(newUsers);
    }

    setOpenRemove(false);
    setOpenThreeDotsVertical(-1);
    setRequestForEditing("");
  };

  const handleJson = () => {
    cognitiveList.map(async (cognitive) => {
      let cognitiveTemp = {
        trait: cognitive.trait === undefined ? "" : cognitive.trait,
        requiredField: cognitive.RequiredField === "לא" ? false : true,
        score: cognitive.score === undefined ? "" : cognitive.score,
        general: cognitive.general === undefined ? "" : cognitive.general,
        category: cognitive.category === undefined ? "" : cognitive.category,
        classification:
          cognitive.classification === undefined
            ? ""
            : cognitive.classification,
        ML: cognitive.ML === "לא" ? false : true,
      };

      let post_cognitive = await post_cognitive_abillities(cognitiveTemp);
      console.log("post_cognitive", post_cognitive);
    });
  };

  const handleConfirm = () => {
    const email = document.getElementById("email").value;
    const fullName = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    const user = {
      email: email,
      name: fullName,
      phone: phone,
    };

    if (userForUpdate !== -1) {
      patchForCoach(users[openThreeDotsVertical].id, user).then((data) => {
        users[openThreeDotsVertical].name = data.data.name;
        users[openThreeDotsVertical].email = data.data.email;
        users[openThreeDotsVertical].phone = data.data.phone;
        console.log("data", data);
      });
    } else {
      insertCoach(user).then((data) => {
        setUsers([data, ...users]);
      });
    }

    handleClose(); // Close the dialog after the form is submitted
  };

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_coaches();
      setUsers(usersData);
    };

    fetchData();
  }, []);

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  return (
    <div style={{ marginTop: "14px", textAlign: "-webkit-center" }}>
      <Button variant="outlined" onClick={handleClickOpen}>
        הוספת משתמש חדש
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>משתמש חדש</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="אימייל"
            type="email"
            fullWidth
            variant="standard"
            defaultValue={
              openThreeDotsVertical !== -1
                ? users[openThreeDotsVertical].email
                : ""
            }
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="שם מלא"
            type="name"
            fullWidth
            variant="standard"
            defaultValue={
              openThreeDotsVertical !== -1
                ? users[openThreeDotsVertical].name
                : ""
            }
          />
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="מספר פלאפון"
            type="phone"
            fullWidth
            variant="standard"
            defaultValue={
              openThreeDotsVertical !== -1
                ? users[openThreeDotsVertical].phone
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleConfirm}>שמירה</Button>
        </DialogActions>
      </Dialog>
      {/* sure for Remove */}
      <Dialog
        open={openRemove}
        onClose={handleCloseRemove}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"מחיקת משתמש"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            האם אתה בטוח במחיקת המשתמש?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemove}>ביטול</Button>
          <Button onClick={handleCloseRemoveConfirm} autoFocus>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
      {/* end cencel */}
      <div className="user_cards_warpper">
        {users.map((user, index) => (
          <div key={user.id} className="user_card">
            <div className="dropdownThreeDotsUsers">
              <button
                className="threeDotsVerticalEng"
                onClick={() => clickOnhreeDotsVerticaIcont(index)}
              >
                <BsThreeDotsVertical />
              </button>

              {openThreeDotsVertical === index ? (
                <Modal_dropdown
                  setRequestForEditing={setRequestForEditing}
                  setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                  editable={true}
                  Reproducible={true}
                  details={true}
                  erasable={true}
                />
              ) : (
                <></>
              )}
            </div>
            <img
              src={user.picture_url ? user.picture_url : defualtSiteImg}
              alt="Avatar"
              style={{ width: "100%" }}
            />
            <div className="users_cards_container" key={user.name}>
              <h5>{user.name}</h5>
              <p>{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coaches;

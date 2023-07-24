import React, { useState, useEffect } from "react";
import "./StudentsCard.css";
import defualtSiteImg from "../../Pictures/defualtSiteImg.svg";
import {
  getingData_Users,
  deleteUser,
  patchForUser,
  post_cognitive_abillities,
  getingData_coaches,
} from "../../api/api";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { insertUser } from "../../api/api";
import { BsThreeDotsVertical } from "react-icons/bs";
import Modal_dropdown from "../Modal/Modal_dropdown";
import cognitiveList from "../Form/cognitive.json";
import Autocomplete from "@mui/material/Autocomplete";

const Cards = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [openRemove, setOpenRemove] = React.useState(false);
  const [coaches, setCoaches] = useState([]);
  const [coach, setCoach] = useState([]);

  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState("");
  
  useEffect(() => {
    console.log("student openThreeDotsVertical: ", openThreeDotsVertical);
  }, [openThreeDotsVertical]);

  useEffect(() => {
    const fetchData = async () => {
      const coachesData = await getingData_coaches();
      setCoaches(coachesData);
    };

    fetchData();
    // console.log("usersData", usersData);
  }, []);

  useEffect(() => {
    console.log("student requestForEditing: ", requestForEditing);

    if (requestForEditing == "edit" || requestForEditing == "details") {
      setOpen(true);
    } else if (requestForEditing == "duplication") {
      console.log("openThreeDotsVertical", openThreeDotsVertical);
    } else if (requestForEditing == "delete") {
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
    console.log("DELETE:", users[openThreeDotsVertical].id);
    let deletedUser = await deleteUser(users[openThreeDotsVertical].id);

    console.log("deletedUser:", deletedUser);
    if (deletedUser.status === 200) {
      alert("המחיקה בוצעה בהצלחה!");
      const newUsers = [...users];
      newUsers.splice(openThreeDotsVertical, 1); // remove one element at index x
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
    const user_name = document.getElementById("userName").value;
    // const coach = document.getElementById("coach").value;

    // const coachId = document.getElementById("coach").value;
    const image = document.getElementById("image-input").files[0];

    const user = {
      email: email,
      name: fullName,
      user_name: user_name,
      coachId: coach.id,
      pictureId: image,
    };
    console.log("khalid - user - "+user);
    console.log("khalid - openThreeDotsVertical - "+openThreeDotsVertical);
    if (openThreeDotsVertical !== -1) {
      console.log("khalid - test - edite");
      patchForUser(users[openThreeDotsVertical].id, user).then((data) => {
        users[openThreeDotsVertical].name = data.data.name;
        users[openThreeDotsVertical].email = data.data.email;
        users[openThreeDotsVertical].user_name = data.data.user_name;
        users[openThreeDotsVertical].coach = data.data.coach;

        console.log("data", data);
        
      });
    } else {
      console.log("khalid - test - add");
      insertUser(user).then((data) => {
        setUsers([data, ...users]);
      });
    }

    handleClose(); // Close the dialog after the form is submitted
  };

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getingData_Users();
      setUsers(usersData);
    };

    fetchData();
    // console.log("usersData", usersData);
  }, []);
  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical == value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };
  return (
    <div style={{ marginTop: "14px", textAlign: "-webkit-center" }}>
      {/* <Button variant="outlined" onClick={handleJson}>
        הכנסת יכולות קוגנטיביות
      </Button> */}
      <Button variant="outlined" onClick={handleClickOpen}>
        הוספת משתמש חדש
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>משתמש חדש</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* To subscribe to this website, please enter your email address here.
            We will send updates occasionally. */}
          </DialogContentText>
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
            id="userName"
            label="שם משתמש"
            type="name"
            fullWidth
            variant="standard"
            defaultValue={
              openThreeDotsVertical !== -1
                ? users[openThreeDotsVertical].user_name
                : ""
            }
          />

          <Autocomplete
            disablePortal
            id="coach"
            options={coaches}
            renderOption={(props, option) => (
              <li {...props}id={option.id}>{option.name}</li>
            )}
            getOptionLabel={(option) => option.name || ""}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="מדריך" />}
            onChange={(event, value) => {
              console.log("value", value);
              setCoach(value);
            }}
            defaultValue={
              openThreeDotsVertical !== -1 &&
              coaches.some(
                (coach) => coach.id === users[openThreeDotsVertical]?.coach?.id
              )
                ? users[openThreeDotsVertical]?.coach
                : null
            }
            value={
              (openThreeDotsVertical !== -1 &&
                coaches.find(
                  (coach) =>
                    coach.id === users[openThreeDotsVertical]?.coach?.id
                )) ||
              null
            }
          />

          <div>תמונה:</div>
          <input label="שם מלא" accept="image/*" id="image-input" type="file" />
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
          <Button onClick={handleCloseRemove}>cancel</Button>
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
              {/* <p>{user.description}</p> */}
              <p>{user.email}</p>
              {/* <button
                className="btn btn-primary"
                id="dropdown-basic-button"

                // onClick={() => myUsersfunc(value)}
              >
                מידע נוסף
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;

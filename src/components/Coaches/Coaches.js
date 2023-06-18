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

const Cards = () => {
  const [users, setUsers] = useState([]);
  const [userForRemove, setUserForRemove] = useState([]);
  const [userForUpdate, setUserForUpdate] = useState(-1);
  const [open, setOpen] = React.useState(false);
  const [openRemove, setOpenRemove] = React.useState(false);

  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  const [requestForEditing, setRequestForEditing] = useState("");

  useEffect(() => {
    console.log("student openThreeDotsVertical: ", openThreeDotsVertical);
  }, [openThreeDotsVertical]);

  useEffect(() => {
    console.log("student requestForEditing: ", requestForEditing);

    if (requestForEditing == "edit" || requestForEditing == "details") {
      setOpen(true);
      setUserForUpdate(openThreeDotsVertical);
    } else if (requestForEditing == "duplication") {
      console.log("openThreeDotsVertical", openThreeDotsVertical);
    } else if (requestForEditing == "delete") {
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
      newUsers.splice(userForRemove, 1); // remove one element at index x
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
    // const user_name = document.getElementById("userName").value;
    const phone = document.getElementById("phone").value;

    // const image = document.getElementById("image-input").files[0];

    const user = {
      email: email,
      name: fullName,
      // user_name: user_name,
      phone: phone,
      // pictureId: image,
    };

    if (userForUpdate !== -1) {
      patchForCoach(users[openThreeDotsVertical].id, user).then((data) => {
        users[openThreeDotsVertical].name = data.data.name;
        users[openThreeDotsVertical].email = data.data.email;
        // users[openThreeDotsVertical].user_name = data.data.user_name;
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
          {/* <TextField
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
          /> */}
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="מספר פלאפון"
            type="phone"
            fullWidth
            variant="standard"
            defaultValue={
              openThreeDotsVertical != -1
                ? users[openThreeDotsVertical].phone
                : ""
            }
          />
          {/* <div>תמונה:</div>
          <input label="שם מלא" accept="image/*" id="image-input" type="file" /> */}
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

// import React, { useState, useEffect } from "react";
// import { get, getingData_Users } from "../../api/api";
// import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
// import { Card } from "react-bootstrap";
// import profile from "../../Pictures/profile1.png";
// import logo from "../../Pictures/logo.jpeg";
// import Modal_Student from "../Modal/Modal_Student";
// import Image from "react-bootstrap/Image";
// import Modal_Loading from "../Modal/Modal_Loading";
// import TextField from "@mui/material/TextField";
// import { FcSearch } from "react-icons/fc";
// import { baseUrl } from "../../config";

// // import { Form } from "react-bootstrap";
// //----------------------------------------------------|
// // let dataCards = []; //                                 |
// let dataCards1 = []; //                                |
// let dataCards2 = []; //                                |
// let dataCards3 = []; //                                |
// let dataCards4 = []; //                                |
// let flag_show_page = false; //                         |
// let size = 0; //                                       |
// let index = 0; //                                      |
// let sizeMod = 0; //                                    |
// const number = 4; //                                   |
// let getMyUsers = []; //                                |
// let filteredData = [];
// let inputText = "";
// //                                                    |
// //----------------------------------------------------|
// const Cards = () => {
//   const [get_logged_in, setLogged_in] = useState(false);
//   const [done, setDone] = useState(false);
//   const [, setLoading] = useState(false);
//   const [dataCards, setDataCards] = useState([]);
//   const [, setDataCards1] = useState([]);
//   const [, setDataCards2] = useState([]);
//   const [, setDataCards3] = useState([]);
//   const [, setDataCards4] = useState([]);
//   const [, setFlag] = useState(false);
//   // const [, setResultData] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [, setMyUsers] = useState([]);
//   const [, setFilteredData] = useState([]);
//   const [, setInputText] = useState("");

//   let inputHandler = (e) => {
//     // console.log("element from card:", e.target.value)
//     //convert input text to lower case
//     setInputText((inputText = e.target.value.toLowerCase()));
//     // console.log("dataCards:", dataCards)
//     setFilteredData(
//       (filteredData = dataCards.filter((el) => {
//         // setInputText(lowerCase);

//         if (inputText === "") {
//           return el;
//         }
//         //return the item which contains the user input
//         else {
//           return el.name.toLowerCase().includes(inputText);
//         }
//       }))
//     );

//     // console.log("filteredData:", filteredData)

//     sizeMod = filteredData.length % number;
//     size = (filteredData.length - sizeMod) / number;

//     // console.log("filteredData.length", filteredData.length)

//     // console.log("size", size)
//     // console.log("sizeMod:", sizeMod)
//     dataCards1 = [];
//     dataCards2 = [];
//     dataCards3 = [];
//     dataCards4 = [];
//     index = 0;
//     for (let i = 0; i < size; i++) {
//       setDataCards1((dataCards1[i] = filteredData[index]));
//       index++;
//       setDataCards2((dataCards2[i] = filteredData[index]));
//       index++;
//       setDataCards3((dataCards3[i] = filteredData[index]));
//       index++;
//       setDataCards4((dataCards4[i] = filteredData[index]));
//       index++;
//     }

//     for (let i = 0; i < sizeMod; i++) {
//       if (i < sizeMod) {
//         setDataCards4((dataCards4[size] = filteredData[index]));
//         i++;
//         index++;
//       }
//       if (i < sizeMod) {
//         setDataCards3((dataCards3[size] = filteredData[index]));
//         i++;
//         index++;
//       }
//       if (i < sizeMod) {
//         setDataCards2((dataCards2[size] = filteredData[index]));
//         i++;
//         index++;
//       }
//       if (i < sizeMod) {
//         setDataCards1((dataCards1[size] = filteredData[index]));
//         i++;
//         index++;
//       }
//     }
//   };
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         setLogged_in(sessionStorage.getItem("logged_in"));
//         setDataCards(await getingData_Users());
//         console.log("Users:", dataCards);
//         setDone(true);
//         // getData();
//       } catch (error) {
//         console.error(error.message);
//       }
//       setLoading(false);
//     };
//     fetchData();
//   }, []);
//   const getData = () => {
//     if (flag_show_page === true) setDone(true);
//     if (flag_show_page === false)
//       get(`https://taal.tech/wp-json/wp/v2/users/`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
//         },
//         params: {
//           per_page: 99,
//           "Cache-Control": "no-cache",
//         },
//       }).then((res) => {
//         setDone(true);
//         console.log("Users:", res.data.data);
//         size = res.data.length / number;
//         setDataCards(
//           (dataCards = res.data.filter((item) => item.acf.risk_profile > 0))
//         );
//         // console.log("dataCards:", dataCards)
//         sizeMod = dataCards.length % number;
//         size = (dataCards.length - sizeMod) / number;

//         for (let i = 0; i < size; i++) {
//           setDataCards1((dataCards1[i] = dataCards[index]));
//           index++;
//           setDataCards2((dataCards2[i] = dataCards[index]));
//           index++;
//           setDataCards3((dataCards3[i] = dataCards[index]));
//           index++;
//           setDataCards4((dataCards4[i] = dataCards[index]));
//           index++;
//         }
//         for (let i = 0; i < sizeMod; i++) {
//           if (i < sizeMod) {
//             setDataCards4((dataCards4[size] = dataCards[index]));
//             i++;
//             index++;
//           }
//           if (i < sizeMod) {
//             setDataCards3((dataCards3[size] = dataCards[index]));
//             i++;
//             index++;
//           }
//           if (i < sizeMod) {
//             setDataCards2((dataCards2[size] = dataCards[index]));
//             i++;
//             index++;
//           }
//           if (i < sizeMod) {
//             setDataCards1((dataCards1[size] = dataCards[index]));
//             i++;
//             index++;
//           }
//         }
//         setFlag((flag_show_page = true));
//         sizeMod = dataCards.length % number;
//         size = (dataCards.length - sizeMod) / number;
//       });
//   };
//   const myUsersfunc = (val) => {
//     // console.log("getMyUsers.name:", val.name);
//     setMyUsers((getMyUsers = val));
//     setModalOpen(true);
//   };
//   return (
//     <>
//       {!get_logged_in ? (
//         <div style={{ color: "white" }}>Please connect properly !</div>
//       ) : (
//         <>
//           {!done ? (
//             <>{<Modal_Loading />}</>
//           ) : (
//             <>
//               <div className="inputCover">
//                 <TextField
//                   style={{
//                     borderRadius: "10px",
//                     textAlign: "right",
//                     width: "200px",
//                     backgroundColor: "#fff",
//                   }}
//                   id="outlined-basic"
//                   variant="outlined"
//                   userholder="Search employee"
//                   label={<FcSearch style={{ fontSize: "xx-large" }} />}
//                   onChange={inputHandler}
//                 />
//               </div>
//               <div
//                 style={{
//                   backgroundColor: "rgb(213, 221, 228)",
//                   overflow: "hidden",
//                 }}
//               >
//                 {modalOpen && (
//                   <Modal_Student
//                     setOpenModal={setModalOpen}
//                     thisGetMyUsers={getMyUsers}
//                   />
//                 )}
//                 <br></br>
//                 <div className="container">
//                   <div className="row">
//                     <div className="col-3">
//                       {dataCards1.map((value, index) => {
//                         return (
//                           <div key={index} className="App">
//                             <header key={index}>
//                               <Card
//                                 style={{
//                                   color: "#000",
//                                   marginBottom: 15,
//                                   border: "1px solid #888888",
//                                   borderRadius: "20px",
//                                 }}
//                               >
//                                 {value.acf.image ? (
//                                   <>
//                                     <Image
//                                       style={{
//                                         height: 237,
//                                         width: "97%",
//                                         borderRadius: "20px",
//                                       }}
//                                       src={value.acf.image.url}
//                                       alt="new"
//                                     />
//                                   </>
//                                 ) : (
//                                   <>
//                                     {/* <Card.Img src={profile} style={{ height: 237, width: '97%', borderRadius: "20px" }} /> */}
//                                   </>
//                                 )}
//                                 <Card.Body src={logo}>
//                                   <Card.Title>
//                                     <div className="text-center ">
//                                       <div className="row align-items-center">
//                                         <div className="col-md-11">
//                                           <h5>{value.name}</h5>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </Card.Title>
//                                   <button
//                                     className="btn btn-primary"
//                                     id="dropdown-basic-button"
//                                     style={{ marginLeft: "90px" }}
//                                     onClick={() => myUsersfunc(value)}
//                                   >
//                                     מידע נוסף
//                                   </button>
//                                   <br></br>
//                                   <br></br>
//                                 </Card.Body>
//                               </Card>
//                             </header>
//                           </div>
//                         );
//                       })}
//                     </div>
//                     <div className="col-3">
//                       {dataCards2.map((value, index) => {
//                         return (
//                           <div key={index} className="App">
//                             <header key={index}>
//                               <Card
//                                 style={{
//                                   color: "#000",
//                                   marginBottom: 15,
//                                   border: "1px solid #888888",
//                                   borderRadius: "20px",
//                                 }}
//                               >
//                                 {/* <Card.Img src={profile} style={{ height: 237, width: '97%' }} /> */}
//                                 {value.acf.image ? (
//                                   <>
//                                     {/* <Image style={{ height: 237, width: '97%', borderRadius: "20px" }}
//                                                                     src={value.acf.image.url}
//                                                                     alt="new"
//                                                                 /> */}
//                                   </>
//                                 ) : (
//                                   <>
//                                     {/* <Card.Img src={profile} style={{ height: 237, width: '97%', borderRadius: "20px" }} /> */}
//                                   </>
//                                 )}

//                                 <Card.Body>
//                                   <Card.Title>
//                                     <div className="text-center ">
//                                       <div className="row align-items-center">
//                                         <div className="col-md-12">
//                                           <h5>{value.name}</h5>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </Card.Title>
//                                   <button
//                                     className="btn btn-primary"
//                                     id="dropdown-basic-button"
//                                     style={{ marginLeft: "90px" }}
//                                     onClick={() => myUsersfunc(value)}
//                                   >
//                                     מידע נוסף
//                                   </button>
//                                   <br></br>
//                                   <br></br>
//                                 </Card.Body>
//                               </Card>
//                             </header>
//                           </div>
//                         );
//                       })}
//                     </div>
//                     <div className="col-3">
//                       {dataCards3.map((value, index) => {
//                         return (
//                           <div key={index} className="App">
//                             <header key={index}>
//                               <Card
//                                 style={{
//                                   color: "#000",
//                                   marginBottom: 15,
//                                   border: "1px solid #888888",
//                                   borderRadius: "20px",
//                                 }}
//                               >
//                                 {/* <Card.Img src={profile} style={{ height: 237, width: '97%' }} /> */}
//                                 {value.acf.image ? (
//                                   <>
//                                     {/* <Image style={{ height: 237, width: '97%', borderRadius: "20px" }}
//                                                                     src={value.acf.image.url}
//                                                                     alt="new"
//                                                                 /> */}
//                                   </>
//                                 ) : (
//                                   <>
//                                     {/* <Card.Img src={profile} style={{ height: 237, width: '97%', borderRadius: "20px" }} /> */}
//                                   </>
//                                 )}

//                                 <Card.Body>
//                                   <Card.Title>
//                                     <div className="text-center ">
//                                       <div className="row align-items-center">
//                                         <div className="col-md-11">
//                                           <h5>{value.name}</h5>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </Card.Title>
//                                   <button
//                                     className="btn btn-primary"
//                                     id="dropdown-basic-button"
//                                     style={{ marginLeft: "90px" }}
//                                     onClick={() => myUsersfunc(value)}
//                                   >
//                                     מידע נוסף
//                                   </button>
//                                   <br></br>
//                                   <br></br>
//                                 </Card.Body>
//                               </Card>
//                             </header>
//                           </div>
//                         );
//                       })}
//                     </div>
//                     <div className="col-3">
//                       {dataCards4.map((value, index) => {
//                         return (
//                           <div key={index} className="App">
//                             <header key={index}>
//                               <Card
//                                 style={{
//                                   color: "#000",
//                                   marginBottom: 15,
//                                   border: "1px solid #888888",
//                                   borderRadius: "20px",
//                                 }}
//                               >
//                                 {/* <Card.Img src={profile} style={{ height: 237, width: '97%' }} /> */}
//                                 {value.acf.image ? (
//                                   <>
//                                     {/* <Image style={{ height: 237, width: '97%', borderRadius: "20px" }}
//                                                                     src={value.acf.image.url}
//                                                                     alt="new"
//                                                                 /> */}
//                                   </>
//                                 ) : (
//                                   <>
//                                     {/* <Card.Img src={profile} style={{ height: 237, width: '97%', borderRadius: "20px" }} /> */}
//                                   </>
//                                 )}
//                                 <Card.Body>
//                                   <Card.Title>
//                                     <div className="text-center ">
//                                       <div className="row align-items-center">
//                                         <div className="col-md-11">
//                                           <h5>{value.name}</h5>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </Card.Title>
//                                   <button
//                                     className="btn btn-primary"
//                                     id="dropdown-basic-button"
//                                     style={{ marginLeft: "90px" }}
//                                     onClick={() => myUsersfunc(value)}
//                                   >
//                                     מידע נוסף
//                                   </button>
//                                   <br></br>
//                                   <br></br>
//                                 </Card.Body>
//                               </Card>
//                             </header>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </>
//       )}
//     </>
//   );
// };
// export default Cards;

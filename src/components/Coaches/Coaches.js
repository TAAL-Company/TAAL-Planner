// import React, { useState, useEffect } from 'react';
// import './Coaches.css';
// import defualtSiteImg from '../../Pictures/defualtSiteImg.svg';
// import {
//   getingData_coaches,
//   deleteCoach,
//   updateCoach,
//   post_cognitive_abillities,
//   uploadFiles,
// } from '../../api/api';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
// import { insertCoach } from '../../api/api';
// import { BsThreeDotsVertical } from 'react-icons/bs';
// import Modal_Dropdown from '../Modal/Modal_dropdown';
// import cognitiveList from '../Form/cognitive.json';

// import rtlPlugin from 'stylis-plugin-rtl';
// import { CacheProvider } from '@emotion/react';
// import createCache from '@emotion/cache';
// import { prefixer } from 'stylis';
// import InputFileUpload from '../InputFileUpload/InputFileUpload';
// import { FcMultipleInputs } from 'react-icons/fc';
// import BasicSelect from '../Gallery/BasicSelect';
// import { getBlobsInContainer } from '../azureBlob';
// import { Backdrop, CircularProgress } from '@mui/material';

// import { useNotification } from "../Notification/NotificationProvider";

// const Coaches = () => {
//   const [users, setUsers] = useState([]); // State to store the users
//   const [userForRemove, setUserForRemove] = useState([]); // State to store the user to be removed
//   const [userForUpdate, setUserForUpdate] = useState(-1); // State to store the index of the user to be updated
//   const [open, setOpen] = useState(false); // State to manage the open state of the dialog
//   const [openRemove, setOpenRemove] = useState(false); // State to manage the open state of the remove dialog
//   const [picture, setPicture] = useState(null);
//   const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1); // State to manage the open state of the vertical three dots
//   const [requestForEditing, setRequestForEditing] = useState(''); // State to store the request for editing
//   const [updateAdd, setupdateAdd] = useState(false);

//   const [language, setLanguage] = useState('Hebrew');
//   const [addUserButtonText, setAddUserButtonText] = useState('הוסף משתמש חדש');
//   const [addUserButtonError, setAddUserButtonError] = useState('עליך למלא שדות חובה המסומנים בכוכבית');
//   const [deleteSuccess, setDeleteSuccess] = useState(' המחיקה בוצעה בהצלחה!');

//   const [loading, setLoading] = useState(true);

//   const { showNotification } = useNotification();

//   useEffect(() => {
//     setLanguage(sessionStorage.getItem('language'));

//     if (sessionStorage.getItem('language') == 'English') {
//       setAddUserButtonText('Add a new Coach');
//       setAddUserButtonError('Please fill in the required fields marked with *');
//       setDeleteSuccess('The deletion was successful!');
//     } else if (sessionStorage.getItem('language') == 'Hebrew') {
//       setAddUserButtonText('הוסף משתמש חדש');
//       setAddUserButtonError('עליך למלא שדות חובה המסומנים בכוכבית');
//       setDeleteSuccess('המחיקה בוצעה בהצלחה!');
//     } else {
//       setAddUserButtonText('הוסף משתמש חדש');
//       setAddUserButtonError('עליך למלא שדות חובה המסומנים בכוכבית');
//       setDeleteSuccess('המחיקה בוצעה בהצלחה!');
//     }
//   })

//   const [Foldersite, setFoldersite] = useState('general');
//   const [blobList, setBlobList] = useState([]);
//   const [sortedUrls, setSortedUrls] = useState({});
//   const [folderNames, setFolderNames] = useState([]);

//   useEffect(async () => {
//     // prepare UI for results
//     setBlobList(await getBlobsInContainer());
//   }, []);
//   useEffect(() => {
//     for (const key in blobList) {
//       const url = blobList[key];
//       const parts = url.split('/');
//       let folderName = 'general';

//       const imageIndex = parts.indexOf('images');
//       if (imageIndex !== -1 && imageIndex + 2 < parts.length) {
//         folderName = parts[imageIndex + 1];
//       }

//       let fileType = getFileType(url);
//       let fileTypeFolder = '';

//       if (['jpeg', 'png', 'jpg', 'webp'].includes(fileType)) {
//         fileTypeFolder = 'pictures';
//       } else if (['aac', 'mp3', 'wav'].includes(fileType)) {
//         fileTypeFolder = 'audio';
//       }

//       sortedUrls[folderName] = sortedUrls[folderName] || {};
//       sortedUrls[folderName][fileTypeFolder] = sortedUrls[folderName][fileTypeFolder] || {};
//       sortedUrls[folderName][fileTypeFolder][key] = url;
//     }
//     console.log("sortedUrls", Object.keys(sortedUrls));
//     console.log("sortedUrls- 2", sortedUrls);

//     if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
//       setFolderNames(Object.keys(sortedUrls));
//     } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "STUDENT" || JSON.parse(sessionStorage.getItem('jwt'))?.role === "EDITOR") {
//       const usersites = JSON.parse(sessionStorage.getItem('jwt')).sites;
//       console.log("usersites", usersites);
//       const filteredSortedUrls = Object.keys(sortedUrls).filter(url => {
//         console.log("url", url);
//         return usersites.some(site => site.nameInEnglish === url)
//       });
//       console.log(filteredSortedUrls);
//       setFolderNames(filteredSortedUrls);
//     }
//   }, [blobList]);

//   const getFileType = (url) => {
//     if (typeof url === 'string') {
//       const parts = url.split('.');
//       const extension = parts[parts.length - 1];
//       const fileType = extension.toLowerCase();

//       return fileType;
//     } else {
//       return 'unknown';
//     }
//   };


//   useEffect(() => { }, [openThreeDotsVertical]);

//   useEffect(() => {
//     if (requestForEditing === 'edit' || requestForEditing === 'details') {
//       setUserForUpdate(openThreeDotsVertical);
//       setOpen(true);
//     } else if (requestForEditing === 'duplication') {
//       duplicateCoache();
//     } else if (requestForEditing === 'delete') {
//       setUserForRemove(openThreeDotsVertical);
//       setOpenRemove(true);
//     }
//   }, [requestForEditing]);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setRequestForEditing('');
//     setOpenThreeDotsVertical(-1);
//   };

//   const handleClickOpenRemove = () => {
//     setOpenRemove(true);
//   };

//   const handleCloseRemove = () => {
//     setOpenRemove(false);
//     setOpenThreeDotsVertical(-1);
//     setRequestForEditing('');
//   };

//   const handleCloseRemoveConfirm = async () => {
//     try{
//     let deletedUser = await deleteCoach(users[userForRemove].id);

//     if (deletedUser.status === 200) {
//       showNotification('success', deleteSuccess);
//       const newUsers = [...users];
//       newUsers.splice(userForRemove, 1); // Remove one element at index x
//       setUsers(newUsers);
//     }
//   } catch (error) {
//     showNotification('error', ( language !== "English" ?'המחיקה נכשל ':' Deletion Failed') +error.message);
//   }

//     setOpenRemove(false);
//     setOpenThreeDotsVertical(-1);
//     setRequestForEditing('');
//   };

//   const handleJson = () => {
//     cognitiveList.map(async (cognitive) => {
//       let cognitiveTemp = {
//         trait: cognitive.trait === undefined ? '' : cognitive.trait,
//         requiredField: cognitive.RequiredField === 'לא' ? false : true,
//         score: cognitive.score === undefined ? '' : cognitive.score,
//         general: cognitive.general === undefined ? '' : cognitive.general,
//         category: cognitive.category === undefined ? '' : cognitive.category,
//         classification:
//           cognitive.classification === undefined
//             ? ''
//             : cognitive.classification,
//         ML: cognitive.ML === 'לא' ? false : true,
//       };

//       await post_cognitive_abillities(cognitiveTemp);
//     });
//   };

//   function extractFilenameFromURL(url) {
//     const parts = url.split('?');
//     const path = parts[0]; // Get the part before the question mark
//     const pathParts = path.split('/');
//     const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
//     return filename;
//   }

//   const duplicateCoache = async () => {
//     const CoacheToDuplicate = {
//       email: users[openThreeDotsVertical].email,
//       name: users[openThreeDotsVertical].name,
//       phone: users[openThreeDotsVertical].phone,
//       picture_url: users[openThreeDotsVertical].picture_url || '',
//     };
//     try {
//       if (requestForEditing === 'duplication') {
//         insertCoach(CoacheToDuplicate).then((data) => {
//           setUsers([data, ...users]);
//           setupdateAdd(true);
//           showNotification('success', language !== "English" ? 'שוכפל בהצלחה': 'Duplicated successfully');

//         });
//         setupdateAdd(false);
//       }
//     } catch (error) {
//       console.error(error);
//       showNotification('error', (language !== "English" ? 'שגיאה בשכפול משתמש' : 'Error duplicating user') + error.message);
//     }

//     setOpenThreeDotsVertical(-1);
//     setRequestForEditing('');
//   };

//   const handleConfirm = async () => {
//     const email = document.getElementById('email').value;
//     const fullName = document.getElementById('name').value;
//     const phone = document.getElementById('phone').value;

//     if (email === '' || fullName === '') {
//       // alert(addUserButtonError);
//       showNotification('error', addUserButtonError);
//     } else {
//       let picture_url;
//       try {
//         if (picture) picture_url = await uploadFiles(picture, 'Coaches media/picture', Foldersite); //await uploadImageGD(picture)

//         const user = {
//           email,
//           name: fullName,
//           phone,
//           picture_url,
//         };

//         if (requestForEditing === 'edit' || requestForEditing === 'details') {
//           const userToUpdate = users[userForUpdate];
//           try {
//           updateCoach(userToUpdate.id, user).then((updatedUser) => {
//             userToUpdate.name = updatedUser.data.name;
//             userToUpdate.email = updatedUser.data.email;
//             userToUpdate.phone = updatedUser.data.phone;
//             userToUpdate.picture_url = updatedUser.data.picture_url;

//             const newUsers = [...users];
//             setUsers(newUsers);
//             showNotification('success', language !== "English" ? 'עודכן בהצלחה' : 'Updated successfully');
//           });
//           } catch (error) {
//             console.error(error);
//             showNotification('error', (language !== "English" ? 'שגיאה בעדכון משתמש' : 'Error updating user') + error.message);
//           }
//         } else {
//           try {
//             await insertCoach(user).then((data) => {
//             showNotification('success', language !== "English" ? 'נוסף בהצלחה' : 'Added successfully');
//             setUsers([data, ...users]);
//           });
//           } catch (error) {
//             console.error(error);
//             showNotification('error', (language !== "English" ? 'שגיאה בהוספת' : 'Error adding') + error.message);
//           }
//         }
//       } catch (error) {
//         console.error(error);
//         showNotification('error', (language !== "English" ? 'שגיאה בהעלאת קובץ' : 'Error uploading file') + error.message);
//       }

//       handleClose(); // Close the dialog after the form is submitted
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const usersData = await getingData_coaches();
//         if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
//           setUsers(usersData);
//         } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "EDITOR") {
//           const usersDatafilterbycoachId = usersData.filter((user) => user.id == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
//           setUsers(usersDatafilterbycoachId);
//         } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "STUDENT") {
//           const usersDatafilterbycoachId = usersData.filter((user) => user.id == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).coachId && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
//           setUsers(usersDatafilterbycoachId);
//         }
//       } catch (error) {
//         console.error(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [updateAdd]);

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     const usersData = await getingData_coaches();
//   //     if (JSON.parse(sessionStorage.getItem('jwt'))?.role === "ADMIN") {
//   //       setUsers(usersData);
//   //     } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "EDITOR") {
//   //       const usersDatafilterbycoachId = usersData.filter((user) => user.id == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
//   //       setUsers(usersDatafilterbycoachId);
//   //     } else if (JSON.parse(sessionStorage.getItem('jwt'))?.role == "STUDENT") {
//   //       const usersDatafilterbycoachId = usersData.filter((user) => user.id == JSON.parse(sessionStorage.getItem('jwt-EDITOR')).coachId && JSON.parse(sessionStorage.getItem('jwt-EDITOR')).id != null)
//   //       setUsers(usersDatafilterbycoachId);
//   //     }
//   //   }
//   //   fetchData();
//   // }, []);

//   const clickOnhreeDotsVerticaIcont = (value) => {
//     if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
//     else setOpenThreeDotsVertical(value);
//   };

//   const cache = createCache({
//     key: language === 'Hebrew' ? 'muirtl' : 'muiltr',
//     stylisPlugins: language === 'Hebrew' ? [prefixer, rtlPlugin] : [prefixer],
//   });

//   return (
//     <CacheProvider value={cache}>
//             <div>
//         <Backdrop
//           sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//           open={loading}
//         >
//           <CircularProgress size="10rem" color="info" />
//         </Backdrop>
//       </div>
//       <div
//         style={{
//           direction: language === 'Hebrew' ? 'rtl' : 'ltr',
//           marginTop: '14px',
//           textAlign: '-webkit-center',
//         }}
//       >
//         <Button variant='outlined' onClick={handleClickOpen}>
//           {addUserButtonText}
//         </Button>
//         <Dialog open={open} onClose={handleClose}>
//           {requestForEditing === 'edit' ? (
//             <DialogTitle style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr', marginTop: '10px' }}>
//               {language === 'Hebrew' ? 'משתמש עריכה' : 'Edit User'}
//             </DialogTitle>
//           ) : (
//             <DialogTitle style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr', marginTop: '10px' }}>
//               {language === 'Hebrew' ? 'משתמש חדש' : 'New User'}
//             </DialogTitle>
//           )}
//           <DialogContent>
//             <DialogContentText></DialogContentText>
//             <TextField
//               required
//               margin='dense'
//               id='email'
//               label={language === 'Hebrew' ? 'אימייל' : 'Email'}
//               type='email'
//               fullWidth
//               variant='standard'
//               defaultValue={
//                 openThreeDotsVertical !== -1
//                   ? users[openThreeDotsVertical].email
//                   : ''
//               }
//               inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
//             />
//             <TextField
//               required
//               margin='dense'
//               id='name'
//               label={language === 'Hebrew' ? 'שם מלא' : 'Full Name'}
//               type='name'
//               fullWidth
//               variant='standard'
//               defaultValue={
//                 openThreeDotsVertical !== -1
//                   ? users[openThreeDotsVertical].name
//                   : ''
//               }
//               inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
//             />
//             <TextField
//               required
//               margin='dense'
//               id='phone'
//               label={language === 'Hebrew' ? 'מספר פלאפון' : 'Phone Number'}
//               type='phone'
//               fullWidth
//               variant='standard'
//               defaultValue={
//                 openThreeDotsVertical !== -1
//                   ? users[openThreeDotsVertical].phone
//                   : ''
//               }
//               inputProps={{ style: { direction: language === 'Hebrew' ? 'rtl' : 'ltr' } }}
//             />
//             <div style={{ direction: language === 'Hebrew' ? 'rtl' : 'ltr', marginTop: '10px' }}>
//               {language === 'Hebrew' ? 'תמונה:' : 'Picture:'}
//             </div>
//             <div>
//               <h6>
//                 {language === 'English'
//                   ? 'Select where to save picture / voice'
//                   : ':בחר היכן לשמור תמונה/קול'}
//                 <FcMultipleInputs />
//               </h6>
//               <BasicSelect setFoldersite={setFoldersite} folderlist={folderNames} />
//               <InputFileUpload setPicture={setPicture} language={language === 'Hebrew' ? 'English' : 'Hebrew'} />
//               {/* <input
//                 label={language === 'Hebrew' ? 'שם מלא' : 'Full Name'}
//                 accept='image/*'
//                 id='image-input'
//                 type='file'
//                 onChange={(e) => setPicture(e.target.files[0])}
//               /> */}
//               {users[openThreeDotsVertical]?.picture_url ? (
//                 <div className='selectedFileContainer'>
//                   <div className='selectedFileTitle'>
//                     {language === 'Hebrew' ? ':תמונה שנבחרה' : 'Selected Picture:'}
//                   </div>
//                   <div style={{ marginBottom: '1rem' }}>
//                     {typeof users[openThreeDotsVertical]?.picture_url ===
//                       'string'
//                       ? extractFilenameFromURL(
//                         users[openThreeDotsVertical]?.picture_url
//                       )
//                       : users[openThreeDotsVertical]?.name}
//                   </div>
//                   <div className='thumbnail'>
//                     {typeof users[openThreeDotsVertical]?.picture_url ===
//                       'string' && (
//                         <img
//                           src={users[openThreeDotsVertical]?.picture_url}
//                           className='thumbnailImg'
//                           alt=''
//                         />
//                       )}
//                   </div>
//                 </div>
//               ) : (
//                 <div style={{ marginBottom: '1rem' }}>
//                   {language === 'Hebrew' ? 'תמונה שנבחרה: לא נמצא קובץ תמונה' : 'Selected Picture: No image file found'}
//                 </div>
//               )}
//             </div>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleClose}>{language === 'Hebrew' ? 'ביטול' : 'Cancel'}</Button>
//             <Button onClick={handleConfirm}>{language === 'Hebrew' ? 'שמירה' : 'Save'}</Button>
//           </DialogActions>
//         </Dialog>
//         {/* sure for Remove */}
//         <Dialog
//           open={openRemove}
//           onClose={handleCloseRemove}
//           aria-labelledby='alert-dialog-title'
//           aria-describedby='alert-dialog-description'
//         >
//           <DialogTitle id='alert-dialog-title'>
//             {language === 'Hebrew' ? 'מחיקת משתמש' : 'Delete User'}
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText id='alert-dialog-description'>
//               {language === 'Hebrew' ? 'האם אתה בטוח במחיקת המשתמש?' : 'Are you sure you want to delete the user?'}
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseRemove}>{language === 'Hebrew' ? 'ביטול' : 'Cancel'}</Button>
//             <Button onClick={handleCloseRemoveConfirm} autoFocus>
//               {language === 'Hebrew' ? 'מחיקה' : 'Delete'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//         {/* end cencel */}
//         <div className='user_cards_warpper'>
//           {users.map((user, index) => (
//             <div key={user.id} className='user_card'>
//               <div className='dropdownThreeDotsUsers'>
//                 <button
//                   className='threeDotsVerticalEng'
//                   onClick={() => clickOnhreeDotsVerticaIcont(index)}
//                 >
//                   <BsThreeDotsVertical />
//                 </button>

//                 {openThreeDotsVertical === index ? (
//                   <Modal_Dropdown
//                     setRequestForEditing={setRequestForEditing}
//                     setOpenThreeDotsVertical={setOpenThreeDotsVertical}
//                     editable={true}
//                     Reproducible={true}
//                     details={true}
//                     erasable={true}
//                   />
//                 ) : (
//                   <></>
//                 )}
//               </div>
//               <img
//                 src={user.picture_url || defualtSiteImg}
//                 alt='Avatar'
//                 style={{ width: '100%' }}
//               />
//               <div className='users_cards_container' key={user.id}>
//                 <h5>{user.name}</h5>
//                 <p>{user.email}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </CacheProvider>
//   );
// };

// export default Coaches;

import React, { useEffect, useState } from "react";
import { insertTask, updateRoute, updateTask, uploadFiles } from "../../api/api";
import { useNotification } from "../Notification/NotificationProvider";
import RoutesByStationList from "./RoutesByStationList";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Select, FormControl, InputLabel, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import CloseIcon from '@mui/icons-material/Close';
import Footer from "../SpreadsheetPopup/Footer";
import AudioGalleryModal from "../SpreadsheetPopup/AudioGalleryModal";
import ImageGalleryModal from "../SpreadsheetPopup/ImageGalleryModal";
import { Backdrop, CircularProgress } from "@material-ui/core";


function RouteTablePopUp({
    open,
    onClose,
    route,
    setSelectedRoute,
    stations,
    tasks,
    language,
    reload,
    selectedSite
}) {
    const [Data, setData] = useState([]);
    const [selectedStation, setSelectedStation] = useState(""); // State for selected station
    const [openAudioGallery, setOpenAudioGallery] = useState(false);
    const [selectedRowForAudio, setSelectedRowForAudio] = useState(null);
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedRowForImage, setSelectedRowForImage] = useState(null);
    const [routename, setRoutename] = useState(route.name);
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const { showNotification } = useNotification();

    const style2 = {
        position: 'absolute',
        top: '5%',
        left: '5%',
        width: '90%',
        height: '90%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
    };

    // Define a generic mapping for expected keys
    const headerMapping = {
        title: ["title", "כותרת"],
        stationIds: ["stationIds", "תחנה"],
        subtitle: ["subtitle", "כותרת משנה"],
        siteIds: ["siteIds", "אתר"],
        estimatedTimeSeconds: ["estimatedTimeSeconds", "שניות זמן משוערות"],
        help: ["help", "גלגל הצלה"], // Optional
    };

    const handleCloseAudioGallery = () => {
        setOpenAudioGallery(false);
        setSelectedRowForAudio(null);
    };

    const handleCloseImageGallery = () => {
        setOpenImageGallery(false);
        setSelectedRowForImage(null);
    };

    const handleRemoveAudio = (rowIdx) => {
        const updatedData = [...Data];
        updatedData[rowIdx].audio = null;
        setData(updatedData);
    };

    const handleOpenImageGallery = (rowIdx) => {
        setSelectedRowForImage(rowIdx);
        setOpenImageGallery(true);
    };

    const handleSelectAudioFromGallery = (audioUrl) => {
        if (selectedRowForAudio !== null) {
            setData((prevData) => {
                const newData = [...prevData];
                newData[selectedRowForAudio] = { ...newData[selectedRowForAudio], audio: audioUrl };
                return newData;
            });
            handleCloseAudioGallery();
        }
    };

    const handleSelectImageFromGallery = (imageUrl) => {
        if (selectedRowForImage !== null) {
            setData((prevData) => {
                const newData = [...prevData];
                newData[selectedRowForImage] = { ...newData[selectedRowForImage], image: imageUrl };
                return newData;
            });
            handleCloseImageGallery();
        }
    }

    const handleUploadAudio = (rowIdx, file) => {
        const updatedData = [...Data];
        updatedData[rowIdx].audio = file;
        setData(updatedData);
    };
    const handleUploadImage = (rowIdx, file) => {
        const updatedData = [...Data];
        updatedData[rowIdx].image = file;
        setData(updatedData);
    };

    const handleOpenAudioGallery = (rowIdx) => {
        setSelectedRowForAudio(rowIdx);
        setOpenAudioGallery(true);
    };

    useEffect(() => {
        let dataX = [];
        const addedTaskIds = new Set(); // Track added task IDs to avoid duplicates
        // Get tasks that match the task IDs in route.tasks
        const matchingTasks = route.tasks
            .map(routeTask => tasks.find(task => task.id === routeTask.taskId)) // Find matching task
            .filter(task => task !== undefined); // Filter out undefined values

        matchingTasks.forEach(foundTask => {
            if (!addedTaskIds.has(foundTask.id)) { // Check if task is already added
                dataX.push({
                    id: foundTask.id,
                    // Route: route.name,
                    Station: foundTask?.stations[0]?.title,
                    stationdata: foundTask?.stations[0],
                    Task: foundTask.title,
                    Subtitle: foundTask.subtitle,
                    "Estimated Time Seconds": foundTask.estimatedTimeSeconds,
                    Site: foundTask.sites[0]?.name,
                    // Image: foundTask.picture_url,
                    image: foundTask.picture_url,
                    audio: foundTask.audio_url
                });
                addedTaskIds.add(foundTask.id); // Mark task as added
            }
        });

        setData(dataX);
    }, []);

    // add new task or update existing task
    const handleSave = async () => {
        setLoading(true);
        try {
            let tasksids = [];
            const Foldersite = selectedSite.nameInEnglish; // Assuming site ID is used for folder
            for (const task of Data) {
                let picture_url = task.image;
                let audio_url = task.audio;
                // Upload image if it's a File object
                if (picture_url instanceof File) {
                    picture_url = await uploadFiles(picture_url, 'Task media/picture', Foldersite);
                }
                // Upload audio if it's a File object
                if (audio_url instanceof File) {
                    audio_url = await uploadFiles(audio_url, 'Task media/audio', Foldersite);
                }

                if (task.id) {
                    const updatedTask = {
                        "title": task.Task,
                        "subtitle": task.Subtitle,
                        "estimatedTimeSeconds": task["Estimated Time Seconds"],
                        "picture_url": picture_url,
                        "audio_url": audio_url
                    };
                    try {
                        await updateTask(task.id, updatedTask);
                        tasksids.push(task.id);
                        showNotification("success", "Task updated successfully");
                    } catch (error) {
                        showNotification("error", "Error updating task: " + error.message);
                    }
                } else {
                    try {
                        const newtask = await insertTask(
                            task.Task,
                            task.Subtitle,
                            [task.stationdata?.id],
                            picture_url,
                            audio_url,
                            route.sites[0]?.id,
                            parseInt(task["Estimated Time Seconds"]),
                            "{}",
                            null,
                            null,
                            null,
                            null,
                            null
                        );
                        tasksids.push(newtask.id);
                        showNotification("success", "Task added successfully");
                    } catch (error) {
                        showNotification("error", "Error adding task: " + error.message);
                    }
                }
            }
            console.log("selectedRoute", route);
            // After all tasks are processed, update the route
            const updatedRoute = await updateRoute(route.id, { taskIds: tasksids, name: routename, siteIds: route.sites.map(site => site.id), studentIds: route.students.map(student => student.id), OnlyOnce: route.OnlyOnce, parentRouteId: route.parentRouteId });
            setSelectedRoute(updatedRoute);
            showNotification("success", "Route updated successfully");
            setLoading(false);
            // Reload all data
            await reload();
            // Close the popup
            onClose();
        } catch (error) {
            showNotification("error", "Error saving tasks : " + error.message);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            style={{ direction: language !== 'English' ? 'ltr' : 'rtl' }} // Dynamically set direction
        >

            <DialogTitle
                sx={{
                    p: 2,
                    textAlign: language !== 'English' ? 'left' : 'right', // Align title based on direction
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: language !== 'English' ? 'space-between' : 'space-between',
                    }}
                >
                    <span>{language !== 'English' ? 'Route Table' : 'טבלת מסלולים'}</span>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                            marginLeft: language === 'English' ? 2 : 0,
                            marginRight: language === 'English' ? 0 : 2,
                        }}
                        size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <Box sx={{ padding: '0 16px 16px 16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label>
                    {language !== 'English' ? 'Route Name' : 'שם מסלול'}
                </label>
                <TextField
                    value={routename}
                    onChange={(e) => setRoutename(e.target.value)}
                    fullWidth
                />
            </Box>
            <DialogContent
                sx={{
                    direction: language === 'English' ? 'ltr' : 'rtl', // Set content direction
                }}
            >
                <RoutesByStationList
                    data={Data.map(({ id, ...rest }) => rest)}
                    setData={setData}
                    language={language}
                    headerMapping={headerMapping}
                    handleRemoveAudio={handleRemoveAudio}
                    handleUploadAudio={handleUploadAudio}
                    handleDragOver={null}
                    handleDrop={null}
                    handleAudioDrop={null}
                    draggedImage={null}
                    draggedAudio={null}
                    handleOpenAudioGallery={handleOpenAudioGallery}
                    handleOpenImageGallery={handleOpenImageGallery}
                />
            </DialogContent>
            <AudioGalleryModal
                openAudioGallery={openAudioGallery}
                handleCloseAudioGallery={handleCloseAudioGallery}
                handleSelectAudioFromGallery={handleSelectAudioFromGallery}
            />
            <ImageGalleryModal
                openImageGallery={openImageGallery}
                handleCloseImageGallery={handleCloseImageGallery}
                handleSelectImageFromGallery={handleSelectImageFromGallery}
            />
            {loading ?
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress size="5rem" color="info" />
                </div>

                : (
                    <>
                        <Footer
                            language={language}
                            processGroupedData={handleSave}
                            handleCloseopenUpload={onClose}
                        />
                    </>)
            }
        </Dialog >
    );
}

export default RouteTablePopUp;
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { getingData_Tasks, insertRoute, insertStation, insertTask, uploadFiles } from "../../api/api";
import { useNotification } from "../Notification/NotificationProvider";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import ImagesTable from "./components/ImagesTable";
import Footer from "./components/Footer";
import AudioGalleryModal from "./components/AudioGalleryModal";
import ImageGalleryModal from "./components/ImageGalleryModal";
import { useTranslation } from "react-i18next";

function SpreadsheetPopup(props) {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [images, setImages] = useState([]);
    const [audios, setAudios] = useState([]);
    const [draggedImage, setDraggedImage] = useState(null);
    const [draggedAudio, setDraggedAudio] = useState(null);
    const [loadingData, setLoadingData] = useState(false);

    // Add these new states for gallery modal
    const [openAudioGallery, setOpenAudioGallery] = useState(false);
    const [selectedRowForAudio, setSelectedRowForAudio] = useState(null);

    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedRowForImage, setSelectedRowForImage] = useState(null);

    const headerMapping = {
        Task: ["Task", "משימה"],
        Station: ["Station", "תחנה"],
        Subtitle: ["Subtitle", "תת משימה"],
        Site: ["Site", "אתר"],
        "Estimated Time Seconds": ["Estimated Time Seconds", "שניות זמן משוערות"],
        Help: ["Help", "גלגל הצלה"],
        Image: ["Image", "תמונה"],
        Route: ["Route", "מסלול"],
        Voices: ["Voices", "קולות", "Audio", "אודיו"], // Added audio alternatives
    };

    const { showNotification } = useNotification();

    const handleOnChange = (e) => {
        e.preventDefault();
        setLoadingData(true); // Start loading
        csvFileToArray(e);
    };

    const getMappedKey = (header) => {
        for (const [key, aliases] of Object.entries(headerMapping)) {
            if (aliases.includes(header)) return key;
        }
        return header; // fallback to original if no match
    };

    const handleAudioDrop = (rowIdx) => {
        if (draggedAudio) {
            const updatedData = [...data];
            updatedData[rowIdx].audio = draggedAudio.file;
            setData(updatedData);
            setDraggedAudio(null);
        }
    };

    const handleRemoveAudio = (rowIdx) => {
        const updatedData = [...data];
        updatedData[rowIdx].audio = null;
        setData(updatedData);
    };

    const handleUploadAudio = (rowIdx, file) => {
        const updatedData = [...data];
        updatedData[rowIdx].audio = file;
        setData(updatedData);
    };

    const csvFileToArray = async (e) => {
        const file = e.target.files[0];
        const buffer = await file.arrayBuffer();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        // Step 1: Read header row
        const headerRow = worksheet.getRow(1);
        const headers = [];
        headerRow.eachCell((cell, colNumber) => {
            // headers[colNumber] = cell.value;
            headers[colNumber] = getMappedKey(cell.value);
        });

        // Step 2: Read remaining rows and map to headers
        const json = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber];
                if (header) {
                    rowData[header] = cell.value;
                }
            });

            // Transform the data to match the desired structure

            // const transformedRow = transformRow(rowData);
            // debugger;
            // console.log("rowData:", rowData);
            // console.log("transformedRow:", transformedRow);
            json.push(rowData);
        });

        console.log('Media in workbook:', workbook.model.media);
        console.log('Media in workbook:', workbook);

        // Step 3: Extract images and map to row positions
        let imagesInSheet = [];

        const getMappedImages = worksheet.getImages?.() || [];
        const mediaImages = workbook.model.media?.filter(m => m.type === 'image') || [];

        if (getMappedImages.length > 0) {
            // Use mapped image ranges (reliable in Google Sheets exports)
            imagesInSheet = getMappedImages.map((imgObj, idx) => {
                const { imageId, range } = imgObj;
                const media = mediaImages.find(m => m.index === imageId || m.imageId === imageId);
                if (!media) return null;

                const base64 = arrayBufferToBase64(media.buffer);
                const dataUrl = `data:image/${media.extension};base64,${base64}`;
                const filename = `${props.selectedSite.nameInEnglish}_image_${idx}.${media.extension}`;
                const file = dataURLtoFile(dataUrl, filename);

                return {
                    row: range.tl.nativeRow + 1, // mapped to actual row
                    file,
                };
            }).filter(Boolean);
        } else {
            // Fallback: map by order to rows (index-based)
            console.warn('Fallback: Mapping images by order due to lack of position data');
            imagesInSheet = mediaImages.map((media, idx) => {
                const base64 = arrayBufferToBase64(media.buffer);
                const dataUrl = `data:image/${media.extension};base64,${base64}`;
                const filename = `${props.selectedSite.nameInEnglish}_image_${idx}.${media.extension}`;
                const file = dataURLtoFile(dataUrl, filename);

                return {
                    row: idx + 2, // assume header is row 1, map image 0 to row 2
                    file: file,
                };
            });
        }

        setImages(imagesInSheet);
        console.log('imagesInSheet:', imagesInSheet);

        // Step 4: Attach images to the correct rows
        const jsonWithImagesAndAudio = json.map((row, index) => {
            const matchedImage = imagesInSheet.find(img => img.row === index + 2);
            return {
                ...row,
                image: matchedImage?.file || null,
                audio: null, // Initialize audio as null since it's not from sheet
            };
        });

        setData(jsonWithImagesAndAudio);
        setLoadingData(false);
        console.log('jsonWithImagesAndAudio:', jsonWithImagesAndAudio);
    };

    // Convert ArrayBuffer to Base64
    const arrayBufferToBase64 = (buffer) => {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return window.btoa(binary);
    };

    // Convert Data URL to File
    const dataURLtoFile = (dataUrl, filename) => {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    };

    const groupBy = (array, key) => {
        return array.reduce((acc, obj) => {
            const property = obj[key];
            acc[property] = acc[property] || [];
            acc[property].push(obj);
            return acc;
        }, {});
    };

    const removeDuplicatesFromGroupedData = (groupedData) => {
        const groupedDataNoDuplication = {};

        Object.entries(groupedData).forEach(([group, items]) => {
            const seen = new Set();

            groupedDataNoDuplication[group] = items.filter((item) => {
                const key = `${item.Task}_${item.Subtitle}_${item.Station}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        });

        return groupedDataNoDuplication;
    };

    const processGroupedData = async () => {
        props.handleCloseopenUpload(); // Close the modal
        props.setLoading(true);
        try {
            const siteId = props.selectedSite; // { id: "Site1", name: "Site1" };
            const tasksIdsfromsheet = [];
            //groupBy Station--------------------------------------------------------------------------
            try {
                const groupedData = groupBy(data, "Station");
                const groupedDataNoDuplication = removeDuplicatesFromGroupedData(groupedData);

                for (const key of Object.keys(groupedDataNoDuplication)) {
                    let stationId = await insertStation(key, key, siteId, [], null, null);
                    for (const data of groupedDataNoDuplication[key]) {
                        let taskimage = null;
                        let taskaudio = null; // Add audio variable

                        if (data.image) {
                            taskimage = await uploadFiles(data.image, 'Task media/picture', siteId.nameInEnglish);
                        }

                        if (data.audio) {
                            // Handle both file objects and URLs
                            if (typeof data.audio === 'string') {
                                // If it's a URL from gallery, use it directly
                                taskaudio = data.audio;
                            } else {
                                // If it's a file object, upload it
                                taskaudio = await uploadFiles(data.audio, 'Task media/audio', siteId.nameInEnglish);
                            }
                        }

                        const response = await insertTask(
                            data.Task,
                            data.Subtitle,
                            [stationId.id],
                            taskimage,
                            taskaudio, // Pass audio to insertTask
                            siteId.id,
                            parseInt(data["Estimated Time Seconds"]),
                            "{}",
                            null,
                            null,
                            null,
                            null,
                            [{
                                help_text: data.Help,
                                UserID: "General"
                            }]
                        );
                        tasksIdsfromsheet.push(response.id);
                    }
                }
                showNotification('success', t('Stations_and_tasks_inserted_successfully'));
            } catch (error) {
                console.error("Error inserting stations or tasks:", error);
                // Handle the error
                showNotification('error', t('Error_uploading_data_in_stations_or_tasks'));
            }

            //groupBy RouteHeader--------------------------------------------------------------------------

            try {
                const normalize = (str) => (str || "").trim().replace(/[\r\n]/g, "");
                const RouteHeader = Object.keys(data[0])[0]; // Or use: headers.find(h => !!h)
                const groupedDataByRoutesHeader = groupBy(data, RouteHeader);
                const tasks = await getingData_Tasks();
                for (const Route of Object.keys(groupedDataByRoutesHeader)) {
                    const tasksIds = [];

                    groupedDataByRoutesHeader[Route].forEach((dataRow, idx) => {
                        tasks.forEach((task) => {
                            const match =
                                normalize(task?.title) === normalize(dataRow?.Task) &&
                                normalize(task?.stations?.[0]?.title) === normalize(dataRow?.Station) &&
                                normalize(task?.subtitle) === normalize(dataRow?.Subtitle) &&
                                (//normalize(task?.sites?.[0]?.name) === normalize(dataRow?.Site) ||
                                    normalize(task?.sites?.[0]?.name) === normalize(props?.selectedSite?.name));
                            if (match) {
                                tasksIds.push(task.id);
                                // console.log(`✅ Match [${idx}] - Task ID: ${task.id}`);
                            }
                        });
                    });

                    if (tasksIds.length === 0) {
                        console.warn(`⚠️ No tasks matched for route: ${Route}`);
                    }

                    const route = {
                        name: Route,
                        studentIds: [],
                        taskIds: tasksIds,
                        siteIds: [siteId.id],
                    };
                    console.log("📦 Inserting route:", route);
                    await insertRoute(route);
                }
                showNotification('success', t('Route_inserted_successfully'));
            } catch (error) {
                console.error("Error inserting route:", error);
                // Handle the error
                showNotification('error', t('Error_uploading_data_in_route'));
            }

            showNotification('success', t('Data_inserted_successfully'));
            await props.reloadData();
        } catch (error) {
            console.error("Error inserting route:", error);
            showNotification('error', t('Error_uploading_data'));
        } finally {
            props.setLoading(false);
            // props.setSelectedRoute(-1);
            props.handleCloseopenUpload(); // Close the modal
            props.handleDeselectRoute(); // Call handleDeselectRoute after processing
            window.location.reload(); // Refresh the page
        }
    };

    // Drag handlers
    const handleDragStart = (img) => {
        setDraggedImage(img);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (rowIdx) => {
        if (!draggedImage) return;
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], image: draggedImage.file };
            return newData;
        });
        setDraggedImage(null);
    };

    // Gallery modal handlers
    const handleOpenAudioGallery = (rowIdx) => {
        setSelectedRowForAudio(rowIdx);
        setOpenAudioGallery(true);
    };

    const handleCloseAudioGallery = () => {
        setOpenAudioGallery(false);
        setSelectedRowForAudio(null);
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

    const handleOpenImageGallery = (rowIdx) => {
        setSelectedRowForImage(rowIdx);
        setOpenImageGallery(true);
    };

    const handleCloseImageGallery = () => {
        setOpenImageGallery(false);
        setSelectedRowForImage(null);
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

    return (
        <div
            className=""
            style={{
                width: '100vw',
                height: '100vh',
                minHeight: '100vh',
                minWidth: '100vw',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                textAlign: t('Direction') === 'ltr' ? 'right' : 'left',
                direction: t('Direction'),
                background: '#f8f8f8',
                overflow: 'auto',
            }}
        >
            <Header language={props.language} selectedSite={props.selectedSite} />
            <div
                className={`bodyNewTask ${props.requestForEditing === 'details' ? 'disabledModal' : ''}`}
                style={{
                    flex: '1 1 auto',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 24,
                }}
            >
                <FileUpload language={props.language} handleOnChange={handleOnChange} />
                {loadingData && (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <span style={{ fontSize: 18, color: "#555" }}>{t('Loading')}</span>
                        <div className="loader" style={{
                            margin: "20px auto",
                            border: "6px solid #f3f3f3",
                            borderTop: "6px solid #3498db",
                            borderRadius: "50%",
                            width: 40,
                            height: 40,
                            animation: "spin 1s linear infinite"
                        }} />
                        <style>
                            {`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}
                        </style>
                    </div>
                )}
                {!loadingData && data.length > 0 && (
                    <>
                        <div
                            style={{
                                margin: '0 0 12px 0',
                                padding: '12px',
                                background: '#e6f7ff',
                                border: '1.5px dashed #256fa1',
                                borderRadius: 8,
                                color: '#256fa1',
                                fontWeight: 500,
                                fontSize: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                direction: t('Direction'),
                                textAlign: t('Direction') === 'ltr' ? 'right' : 'left'
                            }}
                        >
                            <span role="img" aria-label="drag">🖱️</span>
                            {t('SpreadsheetPopup.Drag_an_image_from_Images_In_Sheet_and_drop_it_into_the_Image_cell_of_the_relevant_row_below')} <br />
                            {t('SpreadsheetPopup.You_can_also_upload_audio_files_directly_to_each_task')}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 24,
                                width: '100%',
                                height: '100%',
                                margin: '20px 0',
                                direction: t('Direction'),
                            }}
                        >
                            {/* Data Table */}
                            <div style={{ flex: 2, overflow: 'auto', minWidth: 0 }}>
                                <DataTable
                                    data={data}
                                    setData={setData}
                                    language={props.language}
                                    headerMapping={headerMapping}
                                    handleRemoveAudio={handleRemoveAudio}
                                    handleUploadAudio={handleUploadAudio}
                                    handleDragOver={handleDragOver}
                                    handleDrop={handleDrop}
                                    handleAudioDrop={handleAudioDrop}
                                    draggedImage={draggedImage}
                                    draggedAudio={draggedAudio}
                                    handleOpenAudioGallery={handleOpenAudioGallery}
                                    handleOpenImageGallery={handleOpenImageGallery}
                                />
                            </div>
                            {/* Images In Sheet Table */}
                            {images.length > 0 && (
                                <ImagesTable
                                    images={images}
                                    language={props.language}
                                    handleDragStart={handleDragStart}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
            <Footer
                language={props.language}
                processGroupedData={processGroupedData}
                handleCloseopenUpload={props.handleCloseopenUpload}
            />
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
        </div>
    );
}
export default SpreadsheetPopup;

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { getingData_Tasks, insertRoute, insertStation, insertTask, uploadFiles } from "../../api/api";
import { useNotification } from "../Notification/NotificationProvider";
import { RiAsterisk } from 'react-icons/ri';

function Sheettodata(props) {
    const [data, setData] = useState([]);
    const [images, setImages] = useState([]);
    const [draggedImage, setDraggedImage] = useState(null);
    const [loadingData, setLoadingData] = useState(false); // NEW

    const headerMapping = {
        Task: ["Task", "משימה"],
        Station: ["Station", "תחנה"],
        Subtitle: ["Subtitle", "תת משימה"],
        Site: ["Site", "אתר"],
        "Estimated Time Seconds": ["Estimated Time Seconds", "שניות זמן משוערות"],
        Help: ["Help", "גלגל הצלה"],
        Image: ["Image", "תמונה"],
        Route: ["Route", "מסלול"],
        Vioces: ["Voices", "קולות"],
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
                    file,
                };
            });
        }

        setImages(imagesInSheet);
        console.log('imagesInSheet:', imagesInSheet);

        // Step 4: Attach images to the correct rows
        const jsonWithImages = json.map((row, index) => {
            const matchedImage = imagesInSheet.find((img) => img.row === index + 2);
            return {
                ...row,
                image: matchedImage?.file || null,
            };
        });

        setData(jsonWithImages);
        setLoadingData(false); // Stop loading
        console.log('jsonWithImages:', jsonWithImages);
    };

    // Helper function to transform a row into the desired structure
    const transformRow = (rowData) => {
        return {
            Route: rowData.Route || "Routes1",
            Station: rowData.Station || "Station1",
            Task: rowData.Task || "Task11",
            Subtitle: rowData.Subtitle || "Subtitle11",
            "Estimated Time Seconds": rowData["Estimated Time Seconds"] || 2,
            Help: rowData.Help || "Help text",
            Site: rowData.Site || "TAAL_QA",
        };
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

            //groupBy Station--------------------------------------------------------------------------
            try {
                const groupedData = groupBy(data, "Station");
                const groupedDataNoDuplication = removeDuplicatesFromGroupedData(groupedData);

                for (const key of Object.keys(groupedDataNoDuplication)) {
                    let stationId = await insertStation(key, key, siteId, [], null, null);
                    for (const data of groupedDataNoDuplication[key]) {
                        let taskimage = null;
                        if (data.image) {
                            taskimage = await uploadFiles(data.image, 'Task media/picture', siteId.nameInEnglish);
                        }
                        const response = await insertTask(data.Task, data.Subtitle, [stationId.id], taskimage, null, siteId.id, parseInt(data["Estimated Time Seconds"]), "{}", null, null, null, null,
                            [{
                                help_text: data.Help,
                                UserID: "General"
                            }]
                        );
                    }
                }
                showNotification('success', props.language === "English" ? 'התחנות והמשימות הוזנו בהצלחה' : 'Stations and tasks inserted successfully');
            } catch (error) {
                console.error("Error inserting stations or tasks:", error);
                // Handle the error
                showNotification('error', props.language === "English" ? 'שגיאה בהעלאת נתונים בתחנות או במשימות' : 'Error uploading data in stations or tasks');
            }

            //groupBy RouteHeader--------------------------------------------------------------------------

            try {
                const RouteHeader = Object.keys(data[0])[0]; // Or use: headers.find(h => !!h)
                const groupedDataByRoutesHeader = groupBy(data, RouteHeader);
                const tasks = await getingData_Tasks();
                for (const Route of Object.keys(groupedDataByRoutesHeader)) {
                    const tasksIds = [];
                    for (const data of groupedDataByRoutesHeader[Route]) {
                        tasks.find((task) => {
                            if (task?.title?.replace(/[\r\n]/g, "") === data?.Task?.replace(/[\r\n]/g, "") &&
                                task?.stations[0]?.title.replace(/[\r\n]/g, "") === data?.Station?.replace(/[\r\n]/g, "") &&
                                task?.subtitle?.replace(/[\r\n]/g, "") === data?.Subtitle?.replace(/[\r\n]/g, "") &&
                                task?.sites[0]?.name.replace(/[\r\n]/g, "") === data?.Site?.replace(/[\r\n]/g, "") &&
                                task?.sites[0]?.name.replace(/[\r\n]/g, "") === props?.selectedSite?.name.replace(/[\r\n]/g, "")
                            ) {
                                tasksIds.push(task.id);
                            }
                        });
                    }
                    let route = {
                        name: Route,
                        studentIds: [],
                        taskIds: tasksIds,
                        siteIds: [siteId.id],
                    };
                    await insertRoute(route);
                }
                showNotification('success', props.language === "English" ? 'המסלול הוזן בהצלחה' : 'Route inserted successfully');
            } catch (error) {
                console.error("Error inserting route:", error);
                // Handle the error
                showNotification('error', props.language === "English" ? 'שגיאה בהעלאת נתונים במסלול' : 'Error uploading data in route');
            }

            showNotification('success', props.language === "English" ? 'הנתונים הוזנו בהצלחה' : 'Data inserted successfully');
            await props.reloadData();
        } catch (error) {
            console.error("Error inserting route:", error);
            showNotification('error', props.language === "English" ? 'שגיאה בהעלאת הנתונים' : 'Error uploading data');
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

    // Add this function inside your component
    const handleRemoveImage = (rowIdx) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], image: null };
            return newData;
        });
    };

    const handleEditCell = (rowIdx, key, value) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], [key]: value };
            return newData;
        });
    };

    const handleUploadImage = (rowIdx, file) => {
        setData((prevData) => {
            const newData = [...prevData];
            newData[rowIdx] = { ...newData[rowIdx], image: file };
            return newData;
        });
    };

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
                textAlign: props.language === 'English' ? 'right' : 'left',
                direction: props.language !== 'English' ? 'rtl' : 'ltr',
                background: '#f8f8f8',
                overflow: 'auto',
            }}
        >
            <div className='headerNewTask' style={{ backgroundColor: 'green', flex: '0 0 auto' }}>
                <div className='NewTaskTitle'>
                    {props.language !== 'English'
                        ? `Selected Site : ${props.selectedSite.name}`
                        : `${props.selectedSite.name} : אתר נבחר`}
                </div>
            </div>
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
                <form id='IPU' className='w3-container' style={{ marginBottom: 24 }}>
                    <h6 style={{
                        fontWeight: 600,
                        fontSize: 18,
                        marginBottom: 8,
                        color: '#256fa1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                        textAlign: props.language === 'English' ? 'right' : 'left'
                    }}>
                        <span role="img" aria-label="upload" style={{ fontSize: 22 }}>📤</span>
                        {props.language !== 'English' ? 'Upload a xlsx file' : ' העלה קובץ xlsx '}
                        <RiAsterisk style={{ color: 'red' }} />
                    </h6>
                    <div
                        style={{
                            border: '2px dashed #256fa1',
                            borderRadius: 8,
                            background: '#f8faff',
                            padding: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            cursor: 'pointer',
                            transition: 'border 0.2s',
                            direction: props.language === 'English' ? 'rtl' : 'ltr',
                        }}
                        onClick={() => document.getElementById('xlsx-upload-input').click()}
                        tabIndex={0}
                        onKeyPress={e => { if (e.key === 'Enter') document.getElementById('xlsx-upload-input').click(); }}
                        title={props.language !== 'English'
                            ? 'Click or drag a file here'
                            : 'לחץ או גרור קובץ לכאן'}
                    >
                        <span role="img" aria-label="drag" style={{ fontSize: 32 }}>📂</span>
                        <span style={{
                            fontSize: 16,
                            color: '#256fa1',
                            fontWeight: 500
                        }}>
                            {props.language !== 'English'
                                ? 'Click or drag your Excel file here'
                                : 'לחץ או גרור את קובץ האקסל לכאן'}
                        </span>
                        <input
                            id="xlsx-upload-input"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleOnChange}
                            required={true}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div style={{
                        fontSize: 13,
                        color: '#888',
                        marginTop: 8,
                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                        textAlign: props.language === 'English' ? 'right' : 'left'
                    }}>
                        {props.language !== 'English'
                            ? 'Supported formats: .xlsx, .xls'
                            : 'פורמטים נתמכים: .xlsx, .xls'}
                    </div>
                </form>
                {loadingData && (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <span style={{ fontSize: 18, color: "#555" }}>{props.language !== 'English' ? 'Loading...' : '...טוען'}</span>
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
                                direction: props.language === 'English' ? 'rtl' : 'ltr',
                                textAlign: props.language === 'English' ? 'right' : 'left'
                            }}
                        >
                            <span role="img" aria-label="drag">🖱️</span>
                            {props.language === 'English'
                                ? <>
                                    גרור תמונה מתוך <b>תמונות בגיליון</b> ושחרר אותה בתא <b>תמונה</b> של השורה המתאימה למטה.
                                  </>
                                : <>
                                    Drag an image from <b>Images In Sheet</b> and drop it into the <b>Image</b> cell of the relevant row below.
                                  </>
                            }
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 24,
                                width: '100%',
                                height: '100%',
                                margin: '20px 0',
                                direction: props.language === 'English' ? 'rtl' : 'ltr'
                            }}
                        >
                            {/* Data Table */}
                            <div style={{ flex: 2, overflow: 'auto', minWidth: 0 }}>
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        minWidth: 800,
                                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                                        textAlign: props.language === 'English' ? 'right' : 'left'
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            {Object.keys(data[0])
                                                .filter(key => key !== "Image" && key !== "Site")
                                                .map((key) => (
                                                    <th
                                                        key={key}
                                                        style={{
                                                            border: '1px solid #ccc',
                                                            padding: 8,
                                                            background: '#f0f0f0',
                                                            fontWeight: 600,
                                                            direction: props.language === 'English' ? 'rtl' : 'ltr',
                                                            textAlign: props.language === 'English' ? 'right' : 'left'
                                                        }}
                                                    >
                                                        {key === 'image'
                                                            ? (props.language === 'English' ? 'תמונה' : 'Image')
                                                            : (props.language === 'English'
                                                                ? (headerMapping[key]?.[1] || key)
                                                                : key)
                                                        }
                                                    </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, idx) => (
                                            <tr key={idx} style={{ transition: 'background 0.2s', cursor: 'pointer' }}>
                                                {Object.keys(data[0])
                                                    .filter(key => key !== "Image" && key !== "Site")
                                                    .map((key) => (
                                                        <td
                                                            key={key}
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                padding: 8,
                                                                position: 'relative',
                                                                verticalAlign: 'middle',
                                                                background:
                                                                    key === 'image' && draggedImage
                                                                        ? '#e6f7ff'
                                                                        : undefined,
                                                                outline:
                                                                    key === 'image' && draggedImage
                                                                        ? '2px dashed #256fa1'
                                                                        : undefined,
                                                                transition: 'background 0.2s, outline 0.2s',
                                                                direction: props.language === 'English' ? 'rtl' : 'ltr',
                                                                textAlign: props.language === 'English' ? 'right' : 'left'
                                                            }}
                                                            {...(key === 'image'
                                                                ? {
                                                                    onDragOver: handleDragOver,
                                                                    onDrop: () => handleDrop(idx),
                                                                }
                                                                : {})}
                                                        >
                                                            {key === 'image' ? (
                                                                <div style={{
                                                                    position: 'relative',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 8,
                                                                    minHeight: 40,
                                                                    direction: props.language === 'English' ? 'rtl' : 'ltr'
                                                                }}>
                                                                    {row[key] && (
                                                                        <>
                                                                            <img
                                                                                src={URL.createObjectURL(row[key])}
                                                                                alt="preview"
                                                                                style={{
                                                                                    width: 150,
                                                                                    height: 150,
                                                                                    objectFit: 'contain',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid #ddd'
                                                                                }}
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveImage(idx)}
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: 2,
                                                                                    right: 2,
                                                                                    background: 'rgba(255,255,255,0.85)',
                                                                                    border: 'none',
                                                                                    borderRadius: '50%',
                                                                                    cursor: 'pointer',
                                                                                    width: 22,
                                                                                    height: 22,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontWeight: 'bold',
                                                                                    color: '#ca0a0a',
                                                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                                                                }}
                                                                                title={props.language === 'English' ? "הסר תמונה" : "Remove image"}
                                                                            >×</button>
                                                                        </>
                                                                    )}
                                                                    <label style={{
                                                                        display: 'inline-block',
                                                                        padding: '4px 10px',
                                                                        background: '#eee',
                                                                        borderRadius: 4,
                                                                        border: '1px solid #ccc',
                                                                        cursor: 'pointer',
                                                                        fontSize: 12,
                                                                        marginLeft: row[key] ? 8 : 0
                                                                    }}>
                                                                        {row[key]
                                                                            ? (props.language === 'English' ? 'החלף' : 'Replace')
                                                                            : (props.language === 'English' ? 'העלה' : 'Upload')}
                                                                        <input
                                                                            dir={props.language === 'English' ? 'rtl' : 'ltr'}
                                                                            type="file"
                                                                            accept="image/*"
                                                                            style={{ display: 'none', direction: props.language === 'English' ? 'rtl' : 'ltr', }}
                                                                            onChange={e => {
                                                                                if (e.target.files && e.target.files[0]) {
                                                                                    handleUploadImage(idx, e.target.files[0]);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </label>
                                                                    {!row[key] && (
                                                                        <span style={{
                                                                            color: '#aaa',
                                                                            fontSize: 13,
                                                                            marginLeft: 8
                                                                        }}>
                                                                            {props.language === 'English'
                                                                                ? 'גרור תמונה לכאן'
                                                                                : 'Drag image here'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={row[key] ?? ''}
                                                                    onChange={e => handleEditCell(idx, key, e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        border: '1px solid #ddd',
                                                                        borderRadius: 4,
                                                                        background: '#fafafa',
                                                                        padding: '4px 8px',
                                                                        fontSize: 14,
                                                                        direction: props.language === 'English' ? 'rtl' : 'ltr',
                                                                        textAlign: props.language === 'English' ? 'right' : 'left'
                                                                    }}
                                                                />
                                                            )}
                                                        </td>
                                                    ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Images In Sheet Table */}
                            {images.length > 0 && (
                                <div style={{ flex: 0, overflow: 'auto', minWidth: 220 }}>
                                    <h4 style={{
                                        textAlign: props.language === 'English' ? 'right' : 'center',
                                        direction: props.language === 'English' ? 'rtl' : 'ltr'
                                    }}>
                                        {props.language === 'English' ? 'תמונות בגיליון' : 'Images In Sheet'}
                                    </h4>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        direction: props.language === 'English' ? 'rtl' : 'ltr'
                                    }}>
                                        <thead>
                                            <tr>
                                                <th style={{
                                                    border: '1px solid #ccc',
                                                    padding: 4,
                                                    background: '#f0f0f0',
                                                    direction: props.language === 'English' ? 'rtl' : 'ltr'
                                                }}>
                                                    {props.language === 'English' ? 'תמונה' : 'Image'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {images.map((img, idx) => (
                                                <tr key={idx}>
                                                    <td style={{
                                                        border: '1px solid #ccc',
                                                        padding: 4,
                                                        direction: props.language === 'English' ? 'rtl' : 'ltr'
                                                    }}>
                                                        <img
                                                            src={URL.createObjectURL(img.file)}
                                                            alt={`img-${idx}`}
                                                            style={{
                                                                width: 150,
                                                                height: 150,
                                                                objectFit: 'contain',
                                                                borderRadius: 4,
                                                                cursor: 'grab',
                                                                border: '2px dashed #256fa1',
                                                                background: '#f8faff',
                                                                marginRight: 8
                                                            }}
                                                            draggable
                                                            onDragStart={() => handleDragStart(img)}
                                                        />
                                                        <span style={{
                                                            fontSize: 18,
                                                            color: '#256fa1',
                                                            marginLeft: 4
                                                        }}>⇨</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    height: '100px',
                    alignItems: 'center',
                    padding: '40px',
                    marginBottom: '20px',
                    flex: '0 0 auto',
                }}
                className='footerNewTasks'
            >
                <input
                    type='submit'
                    className='saveTaskButton'
                    // disabled={!file}
                    style={{ backgroundColor: '#ca0a0a' }}
                    value={
                        props.language !== 'English' ? 'Upload data' : ' העלה נתונים '
                    }
                    onClick={() => {
                        processGroupedData();
                    }}
                />
                <input
                    type='submit'
                    className='cancelTaskButton'
                    value={props.language !== 'English' ? 'Cancel' : 'ביטול'}
                    onClick={props.handleCloseopenUpload}
                />
            </div>
        </div>
    );
}
export default Sheettodata;

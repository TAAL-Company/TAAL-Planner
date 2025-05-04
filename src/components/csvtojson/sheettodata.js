import React, { useState } from "react";
import ExcelJS from "exceljs";
import { getingData_Tasks, insertRoute, insertStation, insertTask, uploadFiles } from "../../api/api";
import { useNotification } from "../Notification/NotificationProvider";
import { RiAsterisk } from 'react-icons/ri';

function Sheettodata(props) {
    const [data, setData] = useState([]);
    const [images, setImages] = useState([]);
    // const [file, setFile] = useState(null);
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
        // setFile(e);
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

        // Step 3: Extract images and map to row positions
        const imagesInSheet = [];
        if (workbook.model.media) {
            workbook.model.media.forEach((media, index) => {
                if (media.type === 'image') {
                    const base64 = arrayBufferToBase64(media.buffer);
                    const dataUrl = `data:image/${media.extension};base64,${base64}`;
                    const filename = `${props.selectedSite.nameInEnglish}_image_${index}.${media.extension}`;
                    const file = dataURLtoFile(dataUrl, filename);

                    imagesInSheet.push({
                        index,
                        file,
                    });
                }
            });
        }

        setImages(imagesInSheet);

        // Step 4: Attach images to the correct rows
        const jsonWithImages = json.map((row, index) => {
            const matchedImage = imagesInSheet.find((img) => img.index === index);
            return {
                ...row,
                image: matchedImage?.file || null,
                // file: matchedImage?.dataUrl || null,
            };
        });

        setData(jsonWithImages);
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
            // window.location.reload(); // Refresh the page
        }
    };

    return (
        <div className='modalContainerTasks'
            style={{
                textAlign: props.language === 'English' ? 'right' : 'left',
                direction: props.language !== 'English' ? 'rtl' : 'ltr',
            }}
        >
            <div className='headerNewTask' style={{ backgroundColor: 'green' }}>
                <div className='NewTaskTitle'>
                    {props.language !== 'English' ? `Selected Site : ${props.selectedSite.name}` : `${props.selectedSite.name} : אתר נבחר`}
                </div>
            </div>
            <div className={`bodyNewTask ${props.requestForEditing === 'details' ? 'disabledModal' : ''}`} >
                <form id='IPU' className='w3-container'>
                    <h6>
                        {props.language !== 'English' ? 'Upload a xlsx file' : ' העלה קובץ xlsx '}
                        <RiAsterisk style={{ color: 'red' }} />
                    </h6>
                    <p>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleOnChange}
                            required={true}
                            style={{
                                width: '100%',
                                height: '38px',
                                paddingRight: '20px',
                                direction: props.language === 'English' ? 'rtl' : 'ltr',
                            }}
                        />
                    </p>
                    {/* <input
                        type='submit'
                        className='cancelTaskButton'
                        value={props.language !== 'English' ? 'load csv' : 'טען קובץ'}
                        onClick={handleOnSubmit}
                    /> */}
                </form>

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
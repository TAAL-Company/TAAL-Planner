import React, { useState, useEffect } from 'react';
import { getingData_Tasks, updateRoute } from '../../api/api';
import csvtojson from "csvtojson";
import { RiAsterisk } from 'react-icons/ri';

import { useNotification } from "../Notification/NotificationProvider";

function CsvtojsonRouteAdd(props) {
    const [file, setFile] = useState(null);
    const [jsonData, setJsonData] = useState([]);
    const tasksids = [];

    const { showNotification } = useNotification();

    const handleOnChange = (e) => {
        setFile(e.target.files[0]);
        handleOnSubmit(e);
    };

    const csvFileToArray = async (text) => {
        const jsonArray = await csvtojson().fromString(text);
      
        // Log headers to verify
        const headers = Object.keys(jsonArray[0]);
        // console.log("Headers:", headers);
      
        // Define a generic mapping for expected keys
        const headerMapping = {
          title: ["title", "כותרת"],
          stationIds: ["stationIds", "תחנה"],
          subtitle: ["subtitle", "כותרת משנה"],
          siteIds: ["siteIds", "אתר"],
          estimatedTimeSeconds: ["estimatedTimeSeconds", "שניות זמן משוערות"],
          help: ["help", "גלגל הצלה"], // Optional
        };
      
        // Map the headers dynamically
        const mappedJsonArray = jsonArray.map((row) => {
          const mappedRow = {};
          for (const [key, possibleHeaders] of Object.entries(headerMapping)) {
            const matchedHeader = headers.find((header) =>
              possibleHeaders.some((possibleHeader) =>
                header.toLowerCase().includes(possibleHeader.toLowerCase())
              )
            );
            mappedRow[key] = matchedHeader ? row[matchedHeader] : undefined;
          }
          return mappedRow;
        });
      
        // console.log("Mapped JSON Array:", mappedJsonArray);
        setJsonData(mappedJsonArray);
      };

    const handleOnSubmit = (e) => {
        e.preventDefault();
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                await csvFileToArray(event.target.result);
            };
            reader.readAsText(file);
        }
    };

    const processGroupedData = async () => {
        props.handleCloseopenUpload(); // Close the modal
        props.setLoading(true);
        // console.log(jsonData);
        const tasks = await getingData_Tasks();

        jsonData.forEach((data) => {
            tasks.find((task) => {
                if (task.title.replace(/[\r\n]/g, "") === data.title.replace(/[\r\n]/g, "") && task.stations[0].title.replace(/[\r\n]/g, "") === data.stationIds.replace(/[\r\n]/g, "") && task.subtitle.replace(/[\r\n]/g, "") === data.subtitle.replace(/[\r\n]/g, "") && task.sites[0].name.replace(/[\r\n]/g, "") === data.siteIds.replace(/[\r\n]/g, "") && props.selectedSite.name.replace(/[\r\n]/g, "") === task.sites[0].name.replace(/[\r\n]/g, "")) {
                    // if (task.title === data.title && task.sites[0].name === data.siteIds) {
                    // console.log("stations ", task.stations[0].title === data.stationIds, " - station ", data.stationIds);
                    // console.log("task ", task.title, " - task ", data.title);

                    tasksids.push(task.id);
                }
            });
        });

        const siteId = props.selectedSite.id;

        // console.log("tasksids", tasksids);
        // console.log("siteId", siteId);
        // console.log("routeName", routeName);
        let route = {
            name: props.selectedRoute.name,
            studentIds: props.selectedRoute.students,
            taskIds: tasksids,
            siteIds: [siteId],
            OnlyOnce: props.selectedRoute.OnlyOnce,
        };
        // console.log("selectedRoute", props.selectedRoute);
        // console.log("route", route);
        // console.log("route", route.taskIds.length);
        try {
            
            await updateRoute(props.selectedRoute.id, route);
            // props.setLoading(false);
            showNotification('success', props.language === "English" ? 'המסלול עודכן בהצלחה' : 'Route updated successfully');
            await props.reloadData();
        } catch (error) {
            showNotification('error', props.language === "English" ? 'שגיאה בעדכון המסלול' : 'Error Updating Route');
        } finally {
            props.handleDeselectRoute(); // Call handleDeselectRoute after processing
            props.setSelectedRoute(-1);
        }

    };

    return (
        <div className='modalContainerTasks'
            style={{
                textAlign: props.language === 'English' ? 'right' : 'left',
                direction: props.language !== 'English' ? 'rtl' : 'ltr',
            }}
        >
            <div className='headerNewTask'>
                <div className='NewTaskTitle'>
                    {props.language !== 'English' ? `route : ${props.selectedRoute.name}` : `${props.selectedRoute.name} : מסלול `}
                </div>
            </div>
            <div className={`bodyNewTask ${props.requestForEditing === 'details' ? 'disabledModal' : ''}`} >
                <form id='IPU' className='w3-container'>
                    <h6>
                        {props.language !== 'English' ? 'Upload a CSV file' : ' העלה קובץ CSV '}
                        <RiAsterisk style={{ color: 'red' }} />
                    </h6>
                    <p>
                        <input
                            type="file"
                            accept=".csv"
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
                    <input
                        type='submit'
                        className='cancelTaskButton'
                        value={props.language !== 'English' ? 'load csv' : 'טען קובץ'}
                        onClick={handleOnSubmit}
                    />
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
                    disabled={!file}
                    style={{ backgroundColor: '#ca0a0a' }}
                    value={
                        props.language !== 'English' ? 'upload route' : 'העלה מסלול'
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

export default CsvtojsonRouteAdd;
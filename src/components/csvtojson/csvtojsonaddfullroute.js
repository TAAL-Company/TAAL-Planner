import React, { useState } from "react";
import csvtojson from "csvtojson";
import { insertTask, insertStation, insertRoute } from "../../api/api";
import { useNotification } from "../Notification/NotificationProvider";

function CsvtojsonAddFullRoute(props) {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState([]);
  const tasksIds = [];

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

  const groupBy = (array, key) => {
    return array.reduce((acc, obj) => {
      const property = obj[key];
      acc[property] = acc[property] || [];
      acc[property].push(obj);
      return acc;
    }, {});
  };

  const processGroupedData = async () => {
    props.handleCloseopenUpload(); // Close the modal
    props.setLoading(true);
    const groupedData = groupBy(jsonData, "stationIds");
    const siteId = props.selectedSite; // Replace with actual siteId if needed
    console.log("siteId", siteId);

    try {
      for (const key of Object.keys(groupedData)) {
        // console.log("key", key);
        let stationId = await insertStation(key, key, siteId, [], null, null);
        // console.log("stationId", stationId.id);

        for (const data of groupedData[key]) {
          // console.log("data", data);
          const response = await insertTask(data.title, data.subtitle, [stationId.id], null, null, siteId.id, parseInt(data.estimatedTimeSeconds));
          // console.log(response);
          tasksIds.push(response.id);
        }
      }
      const routeName = "Route"+Date.now();
      // console.log("tasksIds", tasksIds);
      // console.log("routeName", routeName);
      let route = {
        "name": routeName,
        "studentIds": [],
        "taskIds": tasksIds,
        "siteIds": [siteId.id]
      };
      // props.setLoading(false);
      await insertRoute(route);
      showNotification('success', props.language !== "English" ? 'Route added successfully' : 'מסלול נוסף בהצלחה');
      await props.reloadData();
    } catch (error) {
      showNotification('error', props.language !== "English" ? 'Error adding route' : 'שגיאה בהוספת מסלול');
    } finally {
      props.handleDeselectRoute(); // Call handleDeselectRoute after processing
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
            {props.language !== 'English' ? 'Upload a CSV file' : ' העלה קובץ CSV '}
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

export default CsvtojsonAddFullRoute;
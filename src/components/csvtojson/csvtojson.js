import React, { useState } from "react";
import csvtojson from "csvtojson";
import { insertStation, insertTask } from "../../api/api";
import { RiAsterisk } from 'react-icons/ri';
import { useNotification } from "../Notification/NotificationProvider";

function App(props) {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState([]);

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
        console.log("stationId", stationId.id);

        for (const data of groupedData[key]) {
          // console.log("data", data.title);
          const response = await insertTask(data.title, data.subtitle, [stationId.id], null, null, siteId.id, parseInt(data.estimatedTimeSeconds),"{}", null,null, null,null,
           [{
            help_text:data.help,
            UserID: "General"
           }]
          );
          console.log(response);
        }
      }
      // props.setLoading(false);
      showNotification('success', props.language === "English" ? 'מסלול נוסף בהצלחה' : 'Add sheet successfully');
      await props.reloadData();
    } catch (error) {
      showNotification('error', props.language === "English" ? ' שגיאה בעדכונה מסלול' : 'Error updating sheet');
    } finally {
      props.handleDeselectRoute(); // Call handleDeselectRoute after processing
      props.setLoading(false); // Ensure loading is set to false after processing
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

export default App;
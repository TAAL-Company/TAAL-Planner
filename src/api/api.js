import axios from 'axios';
import { baseUrl } from '../config';
import { Buffer } from 'buffer';
import { BlobServiceClient } from '@azure/storage-blob';
import React, { useState } from 'react';

const connectionString =
'https://taalmedia.blob.core.windows.net/images?sp=racwdl&st=2024-02-13T18:56:06Z&se=2025-02-14T02:56:06Z&sv=2022-11-02&sr=c&sig=dftkQiefHvDJ5EPyZzd9l%2B1i6TVPvT2JZif%2F3T5BFOs%3D'
  //'https://taalmedia.blob.core.windows.net/images?sp=r&st=2024-02-08T14:16:23Z&se=2024-02-08T22:16:23Z&spr=https&sv=2022-11-02&sr=c&sig=m1QxYYWMfkEFGr7%2BRMDdNiMELCDQ7WBIJT0rt2aaXBw%3D';
  //'https://taalmedia.blob.core.windows.net/images?sp=racwd&st=2023-08-10T08:40:14Z&se=2024-10-08T16:40:14Z&spr=https&sv=2022-11-02&sr=c&sig=uIxq4iCGXN%2FwOy3vcLS38S8tE8YF60kMgbLX5QY1dPM%3D';
const blobServiceClient = new BlobServiceClient(connectionString);

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  GENERAL  ~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const uploadFiles = async (selectedFile, folder) => {
  console.log('enter', selectedFile);
  console.log('enter folder', folder);

  const containerName = 'images/' + folder; // The name of the container in Azure Blob Storage
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = selectedFile.name;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const options = { blobHTTPHeaders: { blobContentType: selectedFile.type } };

  await blockBlobClient.uploadData(selectedFile, options);
  console.log('Image uploaded successfully.');

  const imageUrl = blockBlobClient.url;
  return imageUrl;
};
export const get = async (url, header) => {
  try {
    const res = await axios.get(url, header);
    if (res) {
      return res;
    }
  } catch (e) {
    console.log(e);
  }
};
export const post = async (url, body, header) => {
  try {
    const res = await axios.post(url, body, header); //body and header shuld be an object
    if (res) {
      return res;
      // console.log("succses");
    }
  } catch (e) {
    console.log(e);
  }
};
export const patch = async (url, body, headers) => {
  try {
    const res = await axios.patch(url, body, { headers });
    if (res) {
      console.log('success');
      return res;
    }
  } catch (e) {
    if (e.response && e.response.status === 404) {
      throw e;
    }
    console.log(e);
  }
};
export const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name);
  formData.append('description', `${type} uploaded from React`);

  try {
    const response = await fetch('https://taal.tech/wp-json/wp/v2/media', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer' + sessionStorage.jwt,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error uploading ${type}: ${response}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  USERS  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const getingData_Users = async () => {
  let all_Users;

  await get(baseUrl + '/students').then((res) => {
    all_Users = res.data;

    const sortedArray = all_Users.sort(
      (a, b) =>
        a.name.localeCompare(b.name, 'he', { sensitivity: 'base' }) ||
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
    );

    console.log(sortedArray);
  });
  console.log('res all_Users: ', all_Users);

  return all_Users;
};
export const getingDataUsers = async () => {
  const userNameApi = 'admin';
  const passwordApi = 'BnDN q25U yKnr exYX xcCS qWeK';
  const base64encodedData = Buffer.from(
    `${userNameApi}:${passwordApi}`
  ).toString('base64');

  let allUsers;

  await get(`https://taal.tech/wp-json/wp/v2/Users/`, {
    params: {
      per_page: 100,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Authorization: `basic ${base64encodedData}`,
    },
  }).then((res) => {
    let max_pages = res.headers['x-wp-totalpages'];

    allUsers = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`https://taal.tech/wp-json/wp/v2/Users/`, {
          params: {
            per_page: 100,
            page: i,
            'Cache-Control': 'no-cache',
            Authorization: `basic ${base64encodedData}`,
          },
        }).then((res) => {
          Array.prototype.push.apply(allUsers, res.data);
        });
      }
    }
  });

  console.log('allUsers', allUsers);

  return allUsers;
};
export const insertUser = async (user) => {
  try {
    const response = await fetch(baseUrl + '/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        user_name: user.user_name,
        coachId: user.coachId || null,
        picture_url: user.picture_url || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error inserting user: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
export const deleteUser = async (user_id) => {
  let confirm;

  await fetch(baseUrl + '/students/' + user_id, { method: 'DELETE' }).then(
    (res) => {
      confirm = res;
    }
  );
  console.log('res deleteUser: ', confirm);

  return confirm;
};
export const updateUser = async (userId, user) => {
  const url = baseUrl + '/students/' + userId;
  const body = {
    email: user.email,
    name: user.name,
    user_name: user.user_name,
    coachId: user.coachId || null,
    picture_url: user.picture_url || null,
  };
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  return await patch(url, body, headers);
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  ROUTES  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const getingData_Routes = async () => {
  let allRoutes;

  await get(`${baseUrl}/routes`).then((res) => {
    allRoutes = res.data;
  });
  console.log('res allRoutes: ', allRoutes);

  return allRoutes;
};
export const getingDataRoutes = async () => {
  let allRoutes;

  await get(`https://taal.tech/wp-json/wp/v2/routes/`, {
    params: {
      per_page: 100,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    let max_pages = res.headers['x-wp-totalpages'];

    allRoutes = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`https://taal.tech/wp-json/wp/v2/routes/`, {
          params: {
            per_page: 100,
            page: i,
            'Cache-Control': 'no-cache',
          },
        }).then((res) => {
          Array.prototype.push.apply(allRoutes, res.data);
        });
      }
    }
  });
  // await flushCache();

  return allRoutes;
};
export const insertRoute = async (routeData, callback) => {
  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
    // Authorization: "Bearer" + sessionStorage.jwt,
  };

  return await post(`${baseUrl}/routes/`, routeData, {
    headers: headers,
  })
    .then(async (response) => {
      console.log('response route: ', response.data);

      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};
export const updateRoute = async (routeUUID, routeData, callback) => {
  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
    // Authorization: "Bearer" + sessionStorage.jwt,
  };

  // const data = {
  //   ...routeData
  // };

  return await patch(`${baseUrl}/routes/` + routeUUID, routeData, {
    headers: headers,
  })
    .then(async (response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};
export const deleteRoute = async (route_id) => {
  let confirm;

  await fetch(baseUrl + '/routes/' + route_id, { method: 'DELETE' }).then(
    (res) => {
      confirm = res;
    }
  );
  console.log('res deleteUser: ', confirm);

  return confirm;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  Places/Site  ~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const getingDataPlaces = async () => {
  let allPlaces;

  await get(`https://taal.tech/wp-json/wp/v2/places/`, {
    params: {
      per_page: 100,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    let max_pages = res.headers['x-wp-totalpages'];

    allPlaces = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`https://taal.tech/wp-json/wp/v2/places/`, {
          params: {
            per_page: 100,
            page: i,
            'Cache-Control': 'no-cache',
          },
        }).then((res) => {
          Array.prototype.push.apply(allPlaces, res.data);
        });
      }
    }
  });

  return allPlaces;
};
export const getingData_Places = async () => {
  let allPlaces;

  await get(`${baseUrl}/sites`, {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    allPlaces = res.data;
  });

  console.log('res places: ', allPlaces);

  return allPlaces;
};
export const insertSite = async (site) => {
  try {
    const response = await fetch(baseUrl + '/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        name: site.name,
        description: site.description,
        picture_url: site.picture_url || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error inserting user: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
export const updateSite = async (id, siteObj) => {
  const url = baseUrl + '/sites/' + id;
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  return await patch(url, siteObj, headers);
};
export const deleteSites = async (sites_id) => {
  let confirm;

  await fetch(baseUrl + '/sites/' + sites_id, { method: 'DELETE' }).then(
    (res) => {
      confirm = res;
    }
  );
  console.log('res deletesites: ', confirm);

  return confirm;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  coaches  ~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
export const getingData_coaches = async () => {
  let all_Users;

  await get(baseUrl + '/coaches').then((res) => {
    all_Users = res.data;

    const sortedArray = all_Users.sort(
      (a, b) =>
        a.name.localeCompare(b.name, 'he', { sensitivity: 'base' }) ||
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
    );

    console.log(sortedArray);
  });
  console.log('res all_Users: ', all_Users);

  return all_Users;
};
export const insertCoach = async (user) => {
  try {
    const response = await fetch(baseUrl + '/coaches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        // user_name: user.user_name,
        phone: user.phone,
        picture_url: user.picture_url,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error inserting user: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
export const deleteCoach = async (user_id) => {
  let confirm;

  await fetch(baseUrl + '/coaches/' + user_id, { method: 'DELETE' }).then(
    (res) => {
      confirm = res;
    }
  );
  console.log('res deletecoaches: ', confirm);

  return confirm;
};
export const updateCoach = async (userId, user) => {
  const url = baseUrl + '/coaches/' + userId;
  const body = {
    email: user.email,
    name: user.name,
    user_name: user.user_name,
    phone: user.phone || null,
    picture_url: user.picture_url,
  };
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  return await patch(url, body, headers);
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  Cognitive Profile  ~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const postDataCognitiveProfile = async (
  workerId,
  cognitiveProfileValues
) => {
  // const url = baseUrl + "/cognitive-profiles/" + workerId;
  // const body = {
  //   value: cognitiveProfileValues,
  // };
  // const headers = {
  //   "Content-Type": "application/json",
  //   Accept: "*/*",
  // };

  // try {
  //   await patch(url, body, headers);
  // } catch (e) {
  //   if (e.response && e.response.status === 400) {
  const postUrl = baseUrl + '/cognitive-profiles';
  const postData = {
    studentId: workerId,
    value: cognitiveProfileValues,
  };
  try {
    const res = await axios.post(postUrl, postData);
    console.log('success');
    return res;
  } catch (e) {
    console.log(e);
  }
  // } else {
  //   console.log(e);
  // }
  // }
};
export const getCognitiveProfile = async (user_id) => {
  let CognitiveProfile;

  await get(baseUrl + '/cognitive-profiles/' + user_id).then((res) => {
    CognitiveProfile = res.data.value;
  });
  console.log('res CognitiveProfile: ', CognitiveProfile);

  return CognitiveProfile;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  Cognitive Requirements  ~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const deletetaskcognitiveRequirements = async (id) => {
  let confirm;

  await fetch(baseUrl + '/task-cognitive-requirements/' + id, {
    method: 'DELETE',
  }).then((res) => {
    confirm = res;
  });
  console.log('res deletesites: ', confirm);

  return confirm;
};
export const gettaskCognitiveRequirements = async (task_id) => {
  let cognitiveRequirements;

  await get(baseUrl + '/task-cognitive-requirements/' + task_id).then((res) => {
    cognitiveRequirements = res.data;
  });
  console.log('res task-cognitive-requirements: ', cognitiveRequirements);

  return cognitiveRequirements;
};
export function postTaskCognitiveRequirements(data) {
  const url = baseUrl + '/task-cognitive-requirements/';
  const body = JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  // Make a POST request to the server
  fetch(url, {
    method: 'POST',
    body: body,
    headers,
  })
    .then((response) => {
      // Handle the response
      return response;
    })
    .catch((error) => {
      // Handle errors
    });
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  cognitive abillities  ~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const post_cognitive_abillities = async (cognitive) => {
  const url = baseUrl + '/cognitive-abillities';

  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  await post(url, cognitive, headers);
};
export const delete_cognitive_abillities = async (id) => {
  const url = baseUrl + '/cognitive-abillities/' + id;

  const options = {
    method: 'DELETE',
    headers: {
      Accept: '*/*',
    },
  };

  try {
    const response = await fetch(url, options); // add return statement here
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('There was a problem with the DELETE request:', error);
  }
};
export const getCognitiveAbillities = async () => {
  let CognitiveAbillities;

  await get(baseUrl + '/cognitive-abillities').then((res) => {
    CognitiveAbillities = res.data;
  });
  console.log('res CognitiveAbillities: ', CognitiveAbillities);

  return CognitiveAbillities;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  TASKS  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const getingData_Tasks = async () => {
  let allTasks;
  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };

  await get(baseUrl + '/tasks', {
    headers: headers,
  }).then((res) => {
    allTasks = res.data;
  });

  return allTasks;
};
export const insertTask = async (
  get_title,
  subtitle,
  myPlacesChoice,
  picture_url,
  audio_url,
  siteIds,
  estimatedTimeSeconds = 20
) => {
  try {
    const response = await fetch(baseUrl + '/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        title: get_title,
        siteIds: [siteIds],
        stationIds: myPlacesChoice,
        estimatedTimeSeconds,
        subtitle: subtitle,
        picture_url,
        audio_url,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error inserting task: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
export const updateTask = async (id, newTask) => {
  const url = baseUrl + '/tasks/' + id;
  // const body = {
  //   title: get_title,
  //   siteIds: [siteIds],
  //   stationIds: stationIds,
  //   estimatedTimeSeconds: 20,
  //   subtitle: subtitle,
  // };
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  return await patch(url, newTask, headers);
};
export const getingDataTasks = async () => {
  let allTasks;

  await get(`https://taal.tech/wp-json/wp/v2/tasks/`, {
    params: {
      per_page: 100,
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    let max_pages = res.headers['x-wp-totalpages'];

    allTasks = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`https://taal.tech/wp-json/wp/v2/tasks/`, {
          params: {
            per_page: 100,
            page: i,
            'Cache-Control': 'no-cache',
          },
        }).then((res) => {
          Array.prototype.push.apply(allTasks, res.data);
        });
      }
    }
  });
  // await flushCache();

  return allTasks;
};
export const deleteTask = async (taskUUID) => {
  const url = baseUrl + '/tasks/' + taskUUID;
  const options = {
    method: 'DELETE',
    headers: {
      Accept: '*/*',
    },
  };

  try {
    const response = await fetch(url, options); // add return statement here
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('There was a problem with the DELETE request:', error);
  }
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  STATIONS  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const insertStation = async (
  get_title,
  getDescription,
  site,
  imageData,
  audioData
) => {
  try {
    const response = await fetch(baseUrl + '/stations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        // Authorization: "Bearer" + sessionStorage.jwt,
      },
      body: JSON.stringify({
        title: get_title,
        parentSiteId: site.id,
        subtitle: getDescription,
        // fields: {
        //   image: imageData,
        //   audio: audioData.id,
        // },
      }),
    });

    if (!response.ok) {
      console.log('res: ' + JSON.stringify(response));
      throw new Error(`Error inserting statin: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);

    throw error;
  }
};
export async function deleteStation(stationUUID) {
  const url = baseUrl + '/stations/' + stationUUID;
  const options = {
    method: 'DELETE',
    headers: {
      Accept: '*/*',
    },
  };

  try {
    const response = await fetch(url, options); // add return statement here
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = response;
    console.log('data', data);
    return data;
  } catch (error) {
    console.error('There was a problem with the DELETE request:', error);
  }
}
export const getingDataStation = async () => {
  let allStations;

  await get(baseUrl + '/stations', {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    allStations = res.data;
  });

  return allStations;
};
export const updateStation = async (id, title, subtitle, parentSiteId) => {
  const url = baseUrl + '/stations/' + id;
  const body = {
    title: title,
    subtitle: subtitle,
    parentSiteId: parentSiteId,
  };
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  return await patch(url, body, headers);
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  evaluation-events = flags  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const getingDataFlags = async () => {
  let allEvaluation;

  await get(baseUrl + '/evaluation-events', {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    allEvaluation = res.data;
  });

  return allEvaluation;
};
export const postEvaluationEvents = async (
  studentId,
  taskId,
  flag,
  alternativeTaskId = null,
  intervention = '',
  explanation = ''
) => {
  try {
    const response = await fetch(baseUrl + '/evaluation-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        studentId: studentId,
        taskId: taskId,
        flag: flag,
        alternativeTaskId: alternativeTaskId,
        intervention: intervention,
        explanation: explanation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error inserting task: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
export const postEvaluation = async (studentIds, taskIds) => {
  try {
    const response = await fetch(baseUrl + '/evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        taskIds: taskIds,
        studentIds: studentIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error inserting task: ${response.statusText}`);
    }
    console.log('response b:', response);

    const data = await response.json();
    console.log('data b:', data);

    const objectArray = data.response.map((jsonString) => JSON.parse(jsonString));

    objectArray.map(async (flag) => {
      await postEvaluationEvents(flag.userId, flag.taskId, flag.evaluation);
    });

    return objectArray;
  } catch (error) {
    throw error;
  }
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  task-performance  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const postTask_Performance = async (
  taskId,
  studentId,
  routeId,
  siteId,
  startTime,
  endTime,
  whenAssisted
) => {
  try {
    const response = await fetch(baseUrl + '/tasks-performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        taskId,
        studentId,
        routeId,
        siteId,
        startTime,
        endTime,
        whenAssisted,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error inserting task: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

export const getingTask_Performance = async (
  dateFilter,
  studentId,
  taskId,
  routeId,
  siteId
) => {
  let taskssperformance;

  await get(
    baseUrl +
      '/tasks-performance/' +
      dateFilter +
      studentId +
      taskId +
      routeId +
      siteId
  ).then((res) => {
    taskssperformance = res.data;
  });
  return taskssperformance;
};

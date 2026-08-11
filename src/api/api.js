import axios from 'axios';
import { baseUrl } from '../config';
import { Buffer } from 'buffer';
import { BlobServiceClient } from '@azure/storage-blob';
import React, { useState } from 'react';

// ── Auth helpers ────────────────────────────────────────────────────────────
// All requests to the TAAL backend (baseUrl) automatically carry the JWT.

/** Returns the Authorization header object when a token is stored, or {}. */
const getJwtHeaders = () => {
  const token = sessionStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Attach the JWT access token to every outgoing axios request
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Monkey-patch global fetch so that every fetch() call to the TAAL backend
// automatically includes the Authorization header — no need to touch each
// individual call site.
const _originalFetch = window.fetch.bind(window);
window.fetch = (url, options = {}) => {
  if (typeof url === 'string' && baseUrl && url.startsWith(baseUrl)) {
    const headers = { ...getJwtHeaders(), ...(options.headers || {}) };
    return _originalFetch(url, { ...options, headers });
  }
  return _originalFetch(url, options);
};

// const connectionString =
//         'https://taalmedia.blob.core.windows.net/images?sp=rwdlacupiytfx&se=2035-02-16T01:12:10Z&st=2025-02-15T17:12:10Z&spr=https,http&sig=cp2HYd4HFqlP0NWK7cYQhR8HP3ul6VjgkxiFReIfal4%3D'
//     //  'https://taalmedia.blob.core.windows.net/images?sp=rwdlacupiytfx&se=2025-02-15T20:23:20Z&st=2025-02-15T12:23:20Z&spr=https&sig=28wRRGVf0rhm%2BUGFcn1GxuWSCr2QiatRCR6PoExPRdU%3D'
//   // 'https://taalmedia.blob.core.windows.net/images?sp=racwdl&st=2024-02-13T18:56:06Z&se=2025-02-14T02:56:06Z&sv=2022-11-02&sr=c&sig=dftkQiefHvDJ5EPyZzd9l%2B1i6TVPvT2JZif%2F3T5BFOs%3D'

// const blobServiceClient = new BlobServiceClient(connectionString);
const accountName = "taalmedia";
const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2035-02-16T01:12:10Z&st=2025-02-15T17:12:10Z&spr=https,http&sig=cp2HYd4HFqlP0NWK7cYQhR8HP3ul6VjgkxiFReIfal4%3D";
const accountURL = `https://${accountName}.blob.core.windows.net/images?${sasToken}`;
const blobServiceClient = new BlobServiceClient(accountURL);
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  GENERAL  ~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const uploadFiles = async (selectedFile, folder, site) => {
  console.log('enter', decodeURIComponent(selectedFile));
  console.log('enter folder', decodeURIComponent(folder)); //folder);
  console.log('enter site', decodeURIComponent(site)); //site);

  const containerName = site + '/' + folder; // The name of the container in Azure Blob Storage
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobName = selectedFile.name;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const options = { blobHTTPHeaders: { blobContentType: selectedFile.type } };

  await blockBlobClient.uploadData(selectedFile, options);
  console.log('Image uploaded successfully.');

  const imageUrl = blockBlobClient.url;
  return imageUrl;
};

export const transferFile = async (fileUrl, targetFolder) => {

  const parsedUrl = new URL(fileUrl);

  const array = parsedUrl.pathname.split('/');
  const lastElement = array[array.length - 1];

  // Remove the first element if it's an empty string
  if (array[0] === '') {
    array.shift();
  }

  // Combine all elements except the last one
  const combined = array.slice(1, -1).join('/');

  const sourceContainerName = decodeURIComponent(combined);
  const targetContainerName = targetFolder;

  // const sourceContainerName = 'images/' + decodeURIComponent(secondLastElement);
  const fileName = lastElement;

  const sourceBlobClient = blobServiceClient.getContainerClient(sourceContainerName).getBlobClient(fileName);
  const targetBlobClient = blobServiceClient.getContainerClient(targetContainerName).getBlobClient(fileName);

  // Check if the source blob exists
  const exists = await sourceBlobClient.exists();
  if (!exists) {
    console.error('Source blob does not exist:', sourceBlobClient.url);
    throw new Error('Source blob does not exist');
  }

  // Copy the file to the target container
  await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);

  // Delete the file from the source container
  await sourceBlobClient.delete();
};

export const deleteFileByUrl = async (imageUrl) => {
  console.log('Deleting file:', imageUrl);

  const parsedUrl = new URL(imageUrl);

  const array = parsedUrl.pathname.split('/');
  const lastElement = array[array.length - 1];

  // Remove the first element if it's an empty string
  if (array[0] === '') {
    array.shift();
  }

  // Combine all elements except the last one
  const combined = array.slice(1, -1).join('/');

  const containerName = decodeURIComponent(combined);

  // const containerName = 'images/' + decodeURIComponent(secondLastElement);
  const blobName = lastElement;

  console.log(parsedUrl.pathname);
  console.log(containerName);
  console.log(blobName);

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.delete();

  console.log('File deleted successfully.');
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

export const getingData_UsersbyIds = async (ids) => {
  let users;

  await post(`${baseUrl}/students/ids`, ids, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  }).then((res) => {
    users = res.data;
  });

  console.log('res users by ids: ', users);
  return users;
};
export const getingDataUsers = async () => {
  // This function fetches from the legacy WordPress API.
  // The WordPress application password must be set in the REACT_APP_WP_AUTH_TOKEN env var.
  const wpAuthToken = process.env.REACT_APP_WP_AUTH_TOKEN;
  if (!wpAuthToken) {
    console.warn('REACT_APP_WP_AUTH_TOKEN not set; skipping legacy WordPress user fetch.');
    return [];
  }

  let allUsers;

  await get(`https://taal.tech/wp-json/wp/v2/Users/`, {
    params: {
      per_page: 100,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Authorization: `basic ${wpAuthToken}`,
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
            Authorization: `basic ${wpAuthToken}`,
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
        phone: user.phone,
        user_name: user.user_name,
        coachId: user.coachId || null,
        picture_url: user.picture_url || null,
        password: user.password,
        siteIds: user.sites?.map((site) => site.id) || [],
        routeIds: user.routeIds || [],
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
    phone: user.phone,
    password: user.password,
    user_name: user.user_name,
    coachId: user.coachId,
    picture_url: user.picture_url,
    cognitiveProfileId: user.cognitiveProfileId,
    siteIds: user.sites?.map((site) => site.id),
    routeIds: user.routes?.map((route) => route.id),
    taskIds: user.tasks?.map((task) => task.id),
  };
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };
  console.log('body', body);
  return await patch(url, body, headers);
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  ROUTES  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const getingData_Routes = async () => {
  let allRoutes;

  await get(`${baseUrl}/routes`).then((res) => {
    allRoutes = res.data.map((route) => {
      // console.log(route.tasks);
      route.tasks.sort((a, b) => a.position - b.position);
      return route
    })
    // allRoutes = res.data;
  });
  console.log('res allRoutes: ', allRoutes);

  return allRoutes;
};

export const getingData_RoutesbyIds = async (ids) => {
  let allRoutes;

  await post(`${baseUrl}/routes/ids`, ids).then((res) => {
    allRoutes = res.data.map((route) => {
      // console.log(route.tasks);
      route.tasks.sort((a, b) => a.position - b.position);
      return route
    })
    // allRoutes = res.data;
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
        nameInEnglish: site.nameInEnglish,
        studentIds: site.studentIds,
        editorIds: site.editorIds,
        taskIds: site.taskIds,
        routeIds: site.routeIds,
        stationIds: site.stationIds,
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
/*~~~~~~~~~~~~~~~~~  Editors  ~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
export const getingData_Editors = async () => {
  let all_Users;

  await get(baseUrl + '/editor').then((res) => {
    all_Users = res.data;

    const sortedArray = all_Users.sort(
      (a, b) =>
        a.name.localeCompare(b.name, 'he', { sensitivity: 'base' }) ||
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
    );

    console.log(sortedArray);
  });
  console.log('res all_Editors: ', all_Users);

  return all_Users;
};

export const getingData_EditorsbyIds = async (ids) => {
  let editors;

  await post(`${baseUrl}/editor/ids`, ids, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  }).then((res) => {
    editors = res.data;
  });

  console.log('res editors by ids: ', editors);
  return editors;
};
export const insertEditor = async (user) => {
  try {
    const response = await fetch(baseUrl + '/editor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        siteIds: user.siteIds,
        role: user.role,
        phone: user.phone,
        picture_url: user.picture_url,
        password: user.password,
        userid: user.userid,
        defaultdashboard: user.defaultdashboard,
        canUseAI: user.canUseAI ?? false,
        aiUsageLimit: user.aiUsageLimit ?? 10,
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
export const deleteEditor = async (user_id) => {
  let confirm;

  await fetch(baseUrl + '/editor/' + user_id, { method: 'DELETE' }).then(
    (res) => {
      confirm = res;
    }
  );
  console.log('res deleteEditor: ', confirm);

  return confirm;
};
export const updateEditor = async (userId, user) => {
  const url = baseUrl + '/editor/' + userId;
  const body = {
    googleID: user.googleID,
    siteIds: user.siteIds,
    role: user.role,
    email: user.email,
    name: user.name,
    phone: user.phone,
    picture_url: user.picture_url,
    password: user.password,
    userid: user.userid,
    defaultdashboard: user.defaultdashboard,
    canUseAI: user.canUseAI,
    aiUsageLimit: user.aiUsageLimit,
  };
  const headers = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };

  return await patch(url, body, headers);
};

export const resetEditorAiUsage = async (editorId) => {
  const response = await fetch(`${baseUrl}/editor/${editorId}/reset-ai-usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Error resetting AI usage: ${response.statusText}`);
  }
  return response.json();
};

export const loginEditor = async (name, password) => {
  // const url = baseUrl + '/editor/login';

  // const headers = {
  //   'Content-Type': 'application/json',
  //   accept: 'application/json',
  // };

  // const body = JSON.stringify({
  //   name: name,
  //   password: password,
  // });

  // return await post(url, body, headers);
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
    CognitiveProfile = res.data;
  });
  console.log('res CognitiveProfile: ', CognitiveProfile);

  return CognitiveProfile;
};

export const updateDataCognitiveProfile = async (
  cognitiveProfileValues,
  workerId
) => {
  const postUrl = baseUrl + '/cognitive-profiles/' + workerId;
  const postData = {
    remark: null,
    studentId: workerId,
    value: cognitiveProfileValues,
  };
  try {
    const res = await axios.patch(postUrl, postData);
    console.log('success');
    return res;
  } catch (e) {
    console.log(e);
  }

};

export const getAllCognitiveProfiles = async () => {
  let cognitiveProfiles;

  await get(
    "https://prod-web-app0da5905.azurewebsites.net/cognitive-profiles"
  ).then((res) => {
    cognitiveProfiles = res.data;
  });
  console.log("res getAllCognitiveProfiles: ", cognitiveProfiles);

  return cognitiveProfiles;
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

export const getAllTaskCognitiveRequirements = async () => {
  let allTaskRequirements;

  await get(
    "https://prod-web-app0da5905.azurewebsites.net/task-cognitive-requirements"
  ).then((res) => {
    allTaskRequirements = res.data;
  });
  console.log(
    "res getAllTaskCognitiveRequirements: ",
    allTaskRequirements
  );

  return allTaskRequirements;
};

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

  console.log('res allTasks: ', allTasks);
  return allTasks;
};

export const getingData_TasksbyIds = async (ids) => {
  let tasks;

  await post(`${baseUrl}/tasks/ids`, ids, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  }).then((res) => {
    tasks = res.data;
  });

  console.log('res tasks by ids: ', tasks);
  return tasks;
};
export const insertTask = async (
  get_title,
  subtitle,
  myPlacesChoice,
  picture_url,
  audio_url,
  siteIds,
  estimatedTimeSeconds = 0,
  multi_language_description,
  dataEntryLabel,
  dataEntryValidation,
  dataEntryType,
  taskType,
  additonalHelp
) => {
  try {
    const response = await fetch(baseUrl + '/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        multi_language_description,
        title: get_title,
        siteIds: [siteIds],
        stationIds: myPlacesChoice,
        estimatedTimeSeconds,
        subtitle: subtitle,
        picture_url,
        audio_url,
        dataEntryLabel,
        dataEntryValidation,
        dataEntryType,
        taskType,
        additonalHelp,
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
  tasksIds,
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
        taskIds: tasksIds
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
  console.log("allStations", allStations);
  return allStations;
};

export const getingDataStationsbyIds = async (ids) => {
  let stations;

  await post(`${baseUrl}/stations/ids`, ids, {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  }).then((res) => {
    stations = res.data;
  });

  console.log('res stations by ids: ', stations);
  return stations;
};
export const getingDataStationbyId = async (stationUUID) => {
  let allStations;

  await get(baseUrl + '/stations/' + stationUUID, {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    allStations = res.data;
  });
  console.log("allStations", allStations);
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
// export const postEvaluationEvents = async (
//   studentId,
//   taskId,
//   flag,
//   alternativeTaskId = null,
//   intervention = '',
//   explanation = ''
// ) => {
//   try {
//     const response = await fetch(baseUrl + '/evaluation-events', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: '*/*',
//         // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
//       },
//       body: JSON.stringify({
//         studentId: studentId,
//         taskId: taskId,
//         flag: flag,
//         alternativeTaskId: alternativeTaskId,
//         intervention: intervention,
//         explanation: explanation,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Error inserting task: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

export const postEvaluationEvents = async (
  studentId,
  taskId,
  flag,
  alternativeTaskId = null,
  intervention = "",
  explanation = ""
) => {
  try {
    const response = await axios.post(baseUrl + '/evaluation-events',
      {
        studentId: studentId,
        taskId: taskId,
        flag: flag,
        alternativeTaskId: alternativeTaskId,
        intervention: intervention,
        explanation: explanation,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

    if (response.status !== 201) {
      console.error(`Error posting evaluation event: ${response.status} ${response.statusText}`);
      // console.error(response.data);
      throw new Error(`Error posting evaluation event: ${response.status} ${response.statusText}`);
    }

    // console.log(response.status);
    const data = response.data;
    return data;
  } catch (error) {
    console.error(`Error posting evaluation event: ${error.message}`);
    // console.error(error);
    throw error.status;
  }
};
// export const postEvaluation = async (studentIds, taskIds) => {
//   try {
//     const response = await fetch(baseUrl + '/evaluation', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
//       },
//       body: JSON.stringify({
//         taskIds: taskIds,
//         studentIds: studentIds,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Error inserting task: ${response.statusText}`);
//     }
//     console.log('response b:', response);

//     const data = await response.json();
//     console.log('data b:', data);

//     const objectArray = data.response.map((jsonString) => JSON.parse(jsonString));

//     objectArray.map(async (flag) => {
//       console.log("flag:", flag.userId, flag.taskId, flag.evaluation);
//       await postEvaluationEvents(flag.userId, flag.taskId, flag.evaluation);
//     });

//     return objectArray;
//   } catch (error) {
//     alert("ERROR: " + "does not have a cognitive requirement , does not have a cognitive Profile");
//     throw error;
//   }
// };

export const postEvaluation = async (studentIds, taskIds) => {
  try {
    console.log('Starting postEvaluation');
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

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', data);

    const objectArray = data.response.map((jsonString) => JSON.parse(jsonString));

    console.log('Processing flags:', objectArray.length);

    for (const flag of objectArray) {
      console.log("Processing flag:", flag.userId, flag.taskId, flag.evaluation);
      try {
        await postEvaluationEvents(flag.userId, flag.taskId, flag.evaluation);
      } catch (postError) {
        console.error('Error processing flag:', postError);
      }
    }

    return objectArray;
  } catch (error) {
    console.error('Error in postEvaluation:', error);
    alert("ERROR: " + error.message || "An unknown error occurred");
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
    '/task-performance/' +
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
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  additonalHelp  ~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const postAdditonalHelp = async (additonalHelp) => {
  try {
    const response = await post(baseUrl + '/additonal-help', additonalHelp, {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
    }).then((res) => {
      return res;
    });
  } catch (error) {
    throw error;
  }
};

export const getAdditonalHelp = async () => {
  try {
    const response = await get(baseUrl + '/additonal-help');
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateAdditonalHelp = async (id, additonalHelp) => {
  try {
    const body = {
      help_text: additonalHelp.help_text,
      picture_url: additonalHelp.picture_url,
      audio_url: additonalHelp.audio_url,
      video_url: additonalHelp.video_url,
      UserID: additonalHelp.UserID
    };
    const response = await patch(baseUrl + '/additonal-help/' + id, body, {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
    }).then((res) => {
      return res;
    });
  } catch (error) {
    throw error;
  }
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  Packs  ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// Get all packs
export const getingData_Packs = async () => {
  let allPacks;
  await get(`${baseUrl}/packs`, {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    allPacks = res.data;
  });
  console.log('allPacks', allPacks);
  return allPacks;
};

// Get pack by ID
export const getPackById = async (packId) => {
  let pack;
  await get(`${baseUrl}/packs/${packId}`, {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    pack = res.data;
  });
  return pack;
};

// Get packs by IDs (array)
export const getPacksByIds = async (ids) => {
  let packs;
  await post(`${baseUrl}/packs/ids`, ids, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    packs = res.data;
  });
  return packs;
};

// Insert a new pack
export const insertPack = async (packData) => {
  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };
  return await post(`${baseUrl}/packs`, packData, {
    headers: headers,
  }).then((response) => response.data);
};

// Update a pack
export const updatePack = async (packId, packData) => {
  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };
  return await patch(`${baseUrl}/packs/${packId}`, packData, headers)
    .then((response) => response.data);
};

// Delete a pack
export const deletePack = async (packId) => {
  let confirm;
  await fetch(`${baseUrl}/packs/${packId}`, { method: 'DELETE' }).then(
    (res) => {
      confirm = res;
    }
  );
  return confirm;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  LOOPS  ~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const updateLoop = async (loopId, loopData) => {
  const url = baseUrl + '/loops/' + loopId;
    const body = {
    routeId: loopData?.routeId,
    stationId: loopData?.stationId,
    taskIds: loopData?.taskIds,
    startingTaskIndex: loopData?.startingTaskIndex,
    endingTaskIndex: loopData?.endingTaskIndex,
    loopIteration: loopData?.loopIteration,
    loopUntil: loopData?.loopUntil,
    loopDuration: loopData?.loopDuration,
  };
  return await patch(url, body, {
    'Content-Type': 'application/json',
    Accept: '*/*',
  });
};

export const insertLoop = async (loopData) => {
  const url = baseUrl + '/loops';
      const body = {
    routeId: loopData?.routeId,
    stationId: loopData?.stationId,
    taskIds: loopData?.taskIds,
    startingTaskIndex: loopData?.startingTaskIndex,
    endingTaskIndex: loopData?.endingTaskIndex,
    loopIteration: loopData?.loopIteration,
    loopUntil: loopData?.loopUntil,
    loopDuration: loopData?.loopDuration,
  };
  return await post(url, body, {
    'Content-Type': 'application/json',
    Accept: '*/*',
  });
};

export const getingData_Loops = async () => {
  let allLoops;
  await get(`${baseUrl}/loops`, {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    allLoops = res.data;
  });
  console.log('allLoops', allLoops);
  return allLoops;
};

export const getLoopById = async (loopId) => {
  let loop;
  await get(`${baseUrl}/loops/${loopId}`, {
    params: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then((res) => {
    loop = res.data;
  });
  return loop;
};

export const deleteLoop = async (loopId) => {
  let confirm;
  await fetch(`${baseUrl}/loops/${loopId}`, { method: 'DELETE' }).then(
    (res) => {
      confirm = res;
    }
  );
  return confirm;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  Azure AI  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const sendAzureChatMessage = async (messages) => {
  const response = await axios.post(`${baseUrl}/api/azure-chat`, {
    messages,
  });

  return response.data;
};



// ─── Auth guard (shared) ──────────────────────────────────────────────────────
const getEditorId = () => {
  try {
    const jwt = sessionStorage.getItem('jwt');
    if (jwt && typeof jwt === 'string' && jwt.startsWith('{')) {
      return JSON.parse(jwt).id || null;
    }
    if (jwt && typeof jwt === 'object' && jwt.id) {
      return jwt.id;
    }
  } catch (e) {}
  return null;
};

const assertAdmin = () => {
  let role = null;
  try {
    const jwt = sessionStorage.getItem('jwt');
    if (jwt) {
      if (typeof jwt === 'string' && jwt.startsWith('{')) {
        role = JSON.parse(jwt).role;
      } else if (typeof jwt === 'object' && jwt.role) {
        role = jwt.role;
      }
    }
  } catch (e) {}
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    throw new Error('Access denied: Only admins and editors can use this feature.');
  }
};

// ─── Scale helper ─────────────────────────────────────────────────────────────
/**
 * Draws a blob / URL onto a canvas scaled to 952×648 and returns a blob URL.
 */
const scaleImageTo952x648BlobUrl = (source) =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 952;
      canvas.height = 648;
      canvas.getContext('2d').drawImage(img, 0, 0, 952, 648);
      canvas.toBlob((blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
        else reject(new Error('Failed to create blob from canvas'));
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = typeof source === 'string' ? source : URL.createObjectURL(source);
  });

// ─── Parse response ───────────────────────────────────────────────────────────
/**
 * Handles both b64_json and url response formats.
 * Returns a blob URL or a remote URL string.
 */
const extractImageFromResponse = async (data) => {
  const item = data?.data?.[0];
  if (!item) throw new Error('Azure OpenAI image response missing data');

  if (item.b64_json) {
    const byteString = atob(item.b64_json);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }

  if (item.url) return item.url;

  throw new Error('Azure OpenAI image response missing URL or b64_json');
};

// ─── Chat completion ──────────────────────────────────────────────────────────
export const createChatCompletion = async (messages, options = {}) => {
  assertAdmin();

  const response = await fetch(`${baseUrl}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editorId: getEditorId(), messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Azure OpenAI error: ${response.status} ${text}`);
  }

  return response.json();
};

// ─── Image generation ─────────────────────────────────────────────────────────
/**
 * Generates a brand-new image from a text prompt.
 */
export const generateAzureImage = async (
  prompt,
  { size = '1024x1024', quality = 'standard', style = 'vivid', n = 1 } = {}
) => {
  assertAdmin();

  const response = await fetch(`${baseUrl}/ai/images/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editorId: getEditorId(), prompt, size, quality, style, n }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Azure OpenAI image error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rawUrl = await extractImageFromResponse(data);

  return size !== '952x648' ? await scaleImageTo952x648BlobUrl(rawUrl) : rawUrl;
};

// ─── Image editing ────────────────────────────────────────────────────────────
/**
 * Edits / re-images an existing image using a text prompt.
 *
 * @param {string}            prompt   - Editing instruction
 * @param {File|Blob}         imageFile - The source image (File or Blob)
 * @param {object}            options
 * @param {string}            options.size
 * @param {number}            options.n
 */
export const editAzureImage = async (
  prompt,
  imageFile,
  { size = '1024x1024', n = 1 } = {}
) => {
  assertAdmin();

  const formData = new FormData();
  formData.append('editorId', getEditorId());
  formData.append('prompt', prompt);
  formData.append('n', String(n));
  formData.append('size', size);

  const file =
    imageFile instanceof File
      ? imageFile
      : new File([imageFile], 'image.png', { type: 'image/png' });
  formData.append('image', file, file.name);

  // No Content-Type header — browser sets it with the boundary automatically
  const response = await fetch(`${baseUrl}/ai/images/edit`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Azure OpenAI image edit error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rawUrl = await extractImageFromResponse(data);

  return size !== '952x648' ? await scaleImageTo952x648BlobUrl(rawUrl) : rawUrl;
};

// ─── Unified helper ───────────────────────────────────────────────────────────
/**
 * Convenience wrapper used by TaskImage.
 * If `imageFile` is provided it calls editAzureImage, otherwise generateAzureImage.
 *
 * @param {string}          prompt
 * @param {File|Blob|null}  imageFile   - Optional source image for editing
 * @param {object}          options     - Forwarded to generate / edit
 */
export const generateOrEditAzureImage = async (prompt, imageFile = null, options = {}) => {
  if (imageFile) {
    return editAzureImage(prompt, imageFile, options);
  }
  return generateAzureImage(prompt, options);
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  NOTIFICATIONS  ~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const sendNotification = async (notification) => {
  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };

  return await post(`${baseUrl}/notifications/send`, notification, { headers });
};

export const scheduleNotification = async (notification) => {
  const headers = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };

  return await post(`${baseUrl}/notifications/schedule`, notification, { headers });
};

export const getScheduledNotifications = async () => {
  let notifications;

  await get(`${baseUrl}/notifications/scheduled`).then((res) => {
    notifications = res.data;
  });

  return notifications;
};

export const deleteScheduledNotification = async (id) => {
  let confirm;

  await fetch(`${baseUrl}/notifications/${id}`, { method: 'DELETE' }).then((res) => {
    confirm = res;
  });

  return confirm;
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  SHIFTS  ~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

const SHIFTS_STORAGE_KEY = 'taal_shifts';

const generateShiftId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getShifts = () => {
  try {
    const data = localStorage.getItem(SHIFTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveShifts = (shifts) => {
  localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(shifts));
};

export const insertShift = (shift) => {
  const shifts = getShifts();
  const newShift = {
    ...shift,
    id: generateShiftId(),
    createdAt: new Date().toISOString(),
    assignments: shift.assignments || [],
  };
  shifts.push(newShift);
  saveShifts(shifts);
  return newShift;
};

export const updateShift = (shiftId, updatedShift) => {
  const shifts = getShifts();
  const index = shifts.findIndex((s) => s.id === shiftId);
  if (index !== -1) {
    shifts[index] = { ...shifts[index], ...updatedShift, id: shiftId };
    saveShifts(shifts);
    return shifts[index];
  }
  return null;
};

export const deleteShift = (shiftId) => {
  const shifts = getShifts().filter((s) => s.id !== shiftId);
  saveShifts(shifts);
};

export const updateShiftAssignments = (shiftId, assignments) => {
  const shifts = getShifts();
  const index = shifts.findIndex((s) => s.id === shiftId);
  if (index !== -1) {
    shifts[index].assignments = assignments;
    saveShifts(shifts);
    return shifts[index];
  }
  return null;
};
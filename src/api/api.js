import axios from "axios";
import { baseUrl } from "../config";
import { Buffer } from "buffer";

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
      console.log("success");
      return res;
    }
  } catch (e) {
    if (e.response && e.response.status === 404) {
      throw e;
    }
    console.log(e);
  }
};

export const getingData_Users = async () => {
  let all_Users;

  await get("https://prod-web-app0da5905.azurewebsites.net/students").then(
    (res) => {
      all_Users = res.data;
    }
  );
  console.log("res all_Users: ", all_Users);

  return all_Users;
};
export const getingData_Routes = async () => {
  let allRoutes;

  await get("https://prod-web-app0da5905.azurewebsites.net/routes").then(
    (res) => {
      allRoutes = res.data;
    }
  );
  console.log("res allRoutes: ", allRoutes);

  return allRoutes;
};
export const getingDataRoutes = async () => {
  let allRoutes;

  await get(`${baseUrl}/wp-json/wp/v2/routes/`, {
    params: {
      per_page: 100,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  }).then((res) => {
    let max_pages = res.headers["x-wp-totalpages"];

    allRoutes = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`${baseUrl}/wp-json/wp/v2/routes/`, {
          params: {
            per_page: 100,
            page: i,
            "Cache-Control": "no-cache",
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
export const getingData_Places = async () => {
  let allPlaces;

  await get("https://prod-web-app0da5905.azurewebsites.net/sites", {
    params: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  }).then((res) => {
    allPlaces = res.data;
  });

  console.log("res places: ", allPlaces);

  return allPlaces;
};

export const getingDataPlaces = async () => {
  let allPlaces;

  await get(`${baseUrl}/wp-json/wp/v2/places/`, {
    params: {
      per_page: 100,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  }).then((res) => {
    let max_pages = res.headers["x-wp-totalpages"];

    allPlaces = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`${baseUrl}/wp-json/wp/v2/places/`, {
          params: {
            per_page: 100,
            page: i,
            "Cache-Control": "no-cache",
          },
        }).then((res) => {
          Array.prototype.push.apply(allPlaces, res.data);
        });
      }
    }
  });

  return allPlaces;
};
export const getingDataUsers = async () => {
  const userNameApi = "admin";
  const passwordApi = "BnDN q25U yKnr exYX xcCS qWeK";
  const base64encodedData = Buffer.from(
    `${userNameApi}:${passwordApi}`
  ).toString("base64");

  let allUsers;

  await get(`${baseUrl}/wp-json/wp/v2/Users/`, {
    params: {
      per_page: 100,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: `basic ${base64encodedData}`,
    },
  }).then((res) => {
    let max_pages = res.headers["x-wp-totalpages"];

    allUsers = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`${baseUrl}/wp-json/wp/v2/Users/`, {
          params: {
            per_page: 100,
            page: i,
            "Cache-Control": "no-cache",
            Authorization: `basic ${base64encodedData}`,
          },
        }).then((res) => {
          Array.prototype.push.apply(allUsers, res.data);
        });
      }
    }
  });

  console.log("allUsers", allUsers);

  return allUsers;
};

export const insertRoute = async (routeData, callback) => {
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    // Authorization: "Bearer" + sessionStorage.jwt,
  };

  // const data = {
  //   ...routeData
  // };

  return await post(
    "https://prod-web-app0da5905.azurewebsites.net/routes/",
    routeData,
    {
      headers: headers,
    }
  )
    .then(async (response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};
export const updateRoute = async (routeUUID, routeData, callback) => {
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    // Authorization: "Bearer" + sessionStorage.jwt,
  };

  // const data = {
  //   ...routeData
  // };

  return await patch(
    "https://prod-web-app0da5905.azurewebsites.net/routes/" + routeUUID,
    routeData,
    {
      headers: headers,
    }
  )
    .then(async (response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", file.name);
  formData.append("description", `${type} uploaded from React`);

  try {
    const response = await fetch("https://taal.tech/wp-json/wp/v2/media", {
      method: "POST",
      headers: {
        Authorization: "Bearer" + sessionStorage.jwt,
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

export const insertUser = async (user) => {
  try {
    const response = await fetch(
      "https://prod-web-app0da5905.azurewebsites.net/students",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          user_name: user.user_name,
          coachId: user.coachId ? user.coachId : null,
          pictureId: user.picture_url ? user.picture_url : null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error inserting user: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
export const insertSite = async (site) => {
  try {
    const response = await fetch(
      "https://prod-web-app0da5905.azurewebsites.net/sites",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          name: site.name,
          description: site.description,
          // pictureId: site.picture_url ? site.picture_url : null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error inserting user: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
export const postDataCognitiveProfile = async (
  workerId,
  cognitiveProfileValues
) => {
  const url =
    "https://prod-web-app0da5905.azurewebsites.net/cognitive-profiles/" +
    workerId;
  const body = {
    value: cognitiveProfileValues,
  };
  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  try {
    await patch(url, body, headers);
  } catch (e) {
    if (e.response && e.response.status === 404) {
      const postUrl =
        "https://prod-web-app0da5905.azurewebsites.net/cognitive-profiles";
      const postData = {
        studentId: workerId,
        ...body,
      };
      try {
        const res = await axios.post(postUrl, postData, { headers });
        console.log("success");
        return res;
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log(e);
    }
  }
};
export const getCognitiveProfile = async (user_id) => {
  let CognitiveProfile;

  await get(
    "https://prod-web-app0da5905.azurewebsites.net/cognitive-profiles/" +
      user_id
  ).then((res) => {
    CognitiveProfile = res.data.value;
  });
  console.log("res CognitiveProfile: ", CognitiveProfile);

  return CognitiveProfile;
};
export const deleteUser = async (user_id) => {
  let confirm;

  await fetch(
    "https://prod-web-app0da5905.azurewebsites.net/students/" + user_id,
    { method: "DELETE" }
  ).then((res) => {
    confirm = res;
  });
  console.log("res deleteUser: ", confirm);

  return confirm;
};
export const patchForUser = async (userId, user) => {
  const url =
    "https://prod-web-app0da5905.azurewebsites.net/students/" + userId;
  const body = {
    email: user.email,
    name: user.name,
    user_name: user.user_name,
    coachId: user.coachId ? user.coachId : null,
    pictureId: user.picture_url ? user.picture_url : null,
  };
  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  return await patch(url, body, headers);
};

export const post_cognitive_abillities = async (cognitive) => {
  const url =
    "https://prod-web-app0da5905.azurewebsites.net/cognitive-abillities";

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  await post(url, cognitive, headers);
};
export const deleteRoute = async (route_id) => {
  let confirm;

  await fetch(
    "https://prod-web-app0da5905.azurewebsites.net/routes/" + route_id,
    { method: "DELETE" }
  ).then((res) => {
    confirm = res;
  });
  console.log("res deleteUser: ", confirm);

  return confirm;
};
export const getCognitiveAbillities = async () => {
  let CognitiveAbillities;

  await get(
    "https://prod-web-app0da5905.azurewebsites.net/cognitive-abillities"
  ).then((res) => {
    CognitiveAbillities = res.data;
  });
  console.log("res CognitiveAbillities: ", CognitiveAbillities);

  return CognitiveAbillities;
};
export const gettaskCognitiveRequirements = async (task_id) => {
  let cognitiveRequirements;

  await get(
    "https://prod-web-app0da5905.azurewebsites.net/task-cognitive-requirements/" +
      task_id
  ).then((res) => {
    cognitiveRequirements = res.data;
  });
  console.log("res task-cognitive-requirements: ", cognitiveRequirements);

  return cognitiveRequirements;
};
export function postTaskCognitiveRequirements(data) {
  const url =
    "https://prod-web-app0da5905.azurewebsites.net/task-cognitive-requirements/";
  const body = JSON.stringify(data);
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
  };

  // Make a PATCH request to the server
  fetch(url + data.taskId, {
    method: "PATCH",
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 404) {
        // If the resource is not found, make a POST request instead
        return fetch(url, {
          method: "POST",
          body: body,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        return response;
      }
    })
    .then((response) => {
      return response;
      // Handle the response
    })
    .catch((error) => {
      // Handle errors
    });
}
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~  TASKS  ~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
export const getingData_Tasks = async () => {
  let allTasks;
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
  };

  await get("https://prod-web-app0da5905.azurewebsites.net/tasks", {
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
  imageData,
  audioData,
  siteIds
) => {
  try {
    const response = await fetch(
      "https://prod-web-app0da5905.azurewebsites.net/tasks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          title: get_title,
          siteIds: [siteIds],
          stationIds: myPlacesChoice,
          estimatedTimeSeconds: 0,
          subtitle: subtitle,
        }),
      }
    );

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
  const url = "https://prod-web-app0da5905.azurewebsites.net/tasks/" + id;
  // const body = {
  //   title: get_title,
  //   siteIds: [siteIds],
  //   stationIds: stationIds,
  //   estimatedTimeSeconds: 0,
  //   subtitle: subtitle,
  // };
  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  return await patch(url, newTask, headers);
};
export const getingDataTasks = async () => {
  let allTasks;

  await get(`${baseUrl}/wp-json/wp/v2/tasks/`, {
    params: {
      per_page: 100,
      "Cache-Control": "no-cache",
    },
  }).then((res) => {
    let max_pages = res.headers["x-wp-totalpages"];

    allTasks = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        get(`${baseUrl}/wp-json/wp/v2/tasks/`, {
          params: {
            per_page: 100,
            page: i,
            "Cache-Control": "no-cache",
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
  const url = "https://prod-web-app0da5905.azurewebsites.net/tasks/" + taskUUID;
  const options = {
    method: "DELETE",
    headers: {
      Accept: "*/*",
    },
  };

  try {
    const response = await fetch(url, options); // add return statement here
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("There was a problem with the DELETE request:", error);
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
    const response = await fetch(
      "https://prod-web-app0da5905.azurewebsites.net/stations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
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
      }
    );

    if (!response.ok) {
      console.log("res: " + JSON.stringify(response));
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
  const url =
    "https://prod-web-app0da5905.azurewebsites.net/stations/" + stationUUID;
  const options = {
    method: "DELETE",
    headers: {
      Accept: "*/*",
    },
  };

  try {
    const response = await fetch(url, options); // add return statement here
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = response;
    console.log("data", data);
    return data;
  } catch (error) {
    console.error("There was a problem with the DELETE request:", error);
  }
}

export const getingDataStation = async () => {
  let allStations;

  await get("https://prod-web-app0da5905.azurewebsites.net/stations", {
    params: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  }).then((res) => {
    allStations = res.data;
  });

  return allStations;
};

export const updateStation = async (id, title, subtitle, parentSiteId) => {
  const url = "https://prod-web-app0da5905.azurewebsites.net/stations/" + id;
  const body = {
    title: title,
    subtitle: subtitle,
    parentSiteId: parentSiteId,
  };
  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  return await patch(url, body, headers);
};

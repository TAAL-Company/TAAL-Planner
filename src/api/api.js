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

export const insertRoute = (routeData, callback) => {
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    // Authorization: "Bearer" + sessionStorage.jwt,
  };

  // const data = {
  //   ...routeData
  // };

  return axios
    .post("https://prod-web-app0da5905.azurewebsites.net/routes", routeData, {
      headers: headers,
    })
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

export const insertTask = async (
  get_title,
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
          // subtitle
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

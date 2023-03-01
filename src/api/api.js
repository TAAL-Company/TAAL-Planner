import axios from "axios";
import { baseUrl } from "../config";

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

  console.log("yarden alltasks", allTasks);
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

export const getingData_Routes = async () => {
  let allRoutes;

  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
  };

  await get("https://prod-web-app0da5905.azurewebsites.net/routes", {
    headers: headers,
  }).then((res) => {
    allRoutes = res.data;
  });

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
    Authorization: "Bearer" + sessionStorage.jwt,
  };

  const data = {
    ...routeData,
    status: "publish",
  };

  return axios
    .post("https://taal.tech/wp-json/wp/v2/routes/", data, { headers: headers })
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
  console.log("get_title YARDEN", get_title);
  console.log("site.id YARDEN", site.id);
  console.log("imageData YARDEN", imageData);
  console.log("audioData YARDEN", audioData);

  try {
    const response = await fetch("https://taal.tech/wp-json/wp/v2/places", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: "Bearer" + sessionStorage.jwt,
      },
      body: JSON.stringify({
        name: get_title,
        parent: site.id,
        description: getDescription,
        fields: {
          image: imageData,
          audio: audioData.id,
        },
      }),
    });

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
  audioData
) => {
  try {
    const response = await fetch("https://taal.tech/wp-json/wp/v2/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        status: "publish",
        title: get_title,
        places: myPlacesChoice,
        fields: {
          image: {
            ID: imageData.id,
          },
          audio: {
            ID: audioData.id,
          },
        },
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

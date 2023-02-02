import axios from "axios";
import { baseUrl } from "../config";
// import  apiFetch  from '@wordpress/api-fetch';

// const flushCache = async () => {
//   try {
//     await apiFetch({ path:  `${baseUrl}/wp-json/wp/v2/routes?force=true`});
//     console.log('Cache flushed');
//   } catch (error) {
//     console.error(error);
//   }
// };

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
      console.log("succses");
    }
  } catch (e) {
    console.log(e);
  }
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
    console.log("res headers:", res.headers);
    allTasks = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        console.log("max_pages: ", max_pages);
        get(`${baseUrl}/wp-json/wp/v2/tasks/`, {
          params: {
            per_page: 100,
            page: i,
            "Cache-Control": "no-cache",
          },
        }).then((res) => {
          console.log("res:", res);
          // allTasks = res.data;
          Array.prototype.push.apply(allTasks, res.data);
          console.log("allTasks:", allTasks);
        });
      }
    }
  });
  // await flushCache();

  return allTasks;
};

export const getingDataRoutes = async () => {

  let allRoutes;

  await get(`${baseUrl}/wp-json/wp/v2/routes/`, {
    params: {
      per_page: 100,
      "Content-Type": "application/json",
    },
  }).then((res) => {
    let max_pages = res.headers["x-wp-totalpages"];

    allRoutes = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        console.log("max_pages: ", max_pages);
        get(`${baseUrl}/wp-json/wp/v2/routes/`, {
          params: {
            per_page: 100,
            page: i,
            "Cache-Control": "no-cache",
          },
        }).then((res) => {
          console.log("res:", res);

          Array.prototype.push.apply(allRoutes, res.data);
          console.log("allRoutes:", allRoutes);
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
    },
  }).then((res) => {
    let max_pages = res.headers["x-wp-totalpages"];

    allPlaces = res.data;
    if (max_pages > 1) {
      for (let i = 2; i <= max_pages; i++) {
        console.log("max_pages: ", max_pages);
        get(`${baseUrl}/wp-json/wp/v2/places/`, {
          params: {
            per_page: 100,
            page: i,
            "Cache-Control": "no-cache",
          },
        }).then((res) => {
          console.log("res:", res);

          Array.prototype.push.apply(allPlaces, res.data);
          console.log("allPlaces: ", allPlaces);
        });
      }
    }
  });
  // await flushCache();

  return allPlaces;
};

export const insertRoute = (routeData, callback) => {
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    Authorization: "Bearer" + sessionStorage.jwt,
  };

  const data = {
    ...routeData,
    status: 'publish'
  }

  return axios.post('https://taal.tech/wp-json/wp/v2/routes/', data, { headers: headers })
    .then(async response => {
      console.log(response.data);

      // await flushCache();

      return response.data;
    })
    .catch(error => {
      console.log(error);
    });


}

export const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name);
  formData.append('description', `${type} uploaded from React`);

  try {
    const response = await fetch('https://taal.tech/wp-json/wp/v2/media', {
      method: 'POST',
      headers: {
        'Authorization': "Bearer" + sessionStorage.jwt,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error uploading ${type}: ${response.statusText}`);
    }

    const data = await response.json();

    // await flushCache();

    return data;
  } catch (error) {
    throw error;
  }
};
export const insertTask = async (get_title, myPlacesChoice, imageData, audioData) => {
  try {
    const response = await fetch('https://taal.tech/wp-json/wp/v2/tasks', {
      method: 'POST',
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
          audio:{
            ID: audioData.id
          }
        },
      }),
    });
  
    if (!response.ok) {
      throw new Error(`Error inserting task: ${response.statusText}`);
    }
  
    const data = await response.json();
    // await flushCache();

    return data;
  } catch (error) {
    throw error;
  }
};
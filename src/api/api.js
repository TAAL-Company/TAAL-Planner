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
    .then(response => {
      console.log(response.data);

      return response.data;
    })
    .catch(error => {
      console.log(error);
    });
}
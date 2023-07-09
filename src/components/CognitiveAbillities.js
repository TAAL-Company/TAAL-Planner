import React, { useEffect, useState } from "react";
// import cognitiveList from "./Form/cognitive.json";
import cognitiveProfiles from "./Form/cognitiveProfiles.json";
import taskAbility from "./Form/taskAbility.json";
import { getCognitiveAbillities } from "../api/api";

const CognitiveAbillities = () => {
  // Transform the data of cognitive Profiles
  const transformedData = cognitiveProfiles.map((item) => {
    const value = [];
    for (let i = 0; i <= 340; i++) {
      console.log("item: ", item[i.toString()]);
      if (item[i.toString()] != undefined) {
        value.push(item[i.toString()]);
      }
    }
    return {
      name: item.name,
      worker_id: item.worker_id,
      mail: item.mail,
      value: value,
    };
  });
  const [cognitiveList, setCognitiveList] = useState([]);

  useEffect(async () => {
    const get = await getCognitiveAbillities();
    setCognitiveList(get);
  }, []);

  const transData = taskAbility.map((item) => {
    const value = [];
    const weights = [];

    for (let i = 0; i <= 340; i++) {
      console.log("item: ", item[i.toString()]);
      if (item[i.toString()] != undefined) {
        const [letter, number] = item[i.toString()]
          .match(/([A-Z]+)(\d+)/)
          .slice(1);
        value[i] = parseInt(number);
        weights[i] = letter;
      }
    }

    return {
      route: item.route,
      station: item.station,
      task: item.task,
      value: value,
      weights: weights,
    };
  });

  // Convert the transformed data to JSON
  const transformedJson = JSON.stringify(transformedData, null, 2);

  // Print the transformed JSON data
  console.log(transformedJson);

  const handleDelete = (id) => {
    console.log("id:", id);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>NO</th>
          <th>Trait</th>
          <th>Required Field</th>
          <th>Category</th>
          <th>Score</th>
          <th>ML</th>
        </tr>
      </thead>
      <tbody>
        {cognitiveList.length > 0 &&
          cognitiveList?.map((item) => (
            <tr key={item.id}>
              <td>{item.index}</td>
              <td>{item.trait}</td>
              <td>{item.requiredField ? "Yes" : "No"}</td>
              <td>{item.category}</td>
              <td>{item.score}</td>
              <td>{item.ML ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleDelete(item.id)}>מחיקה</button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default CognitiveAbillities;

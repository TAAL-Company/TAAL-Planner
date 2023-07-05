import React from "react";
import cognitiveList from "./Form/cognitive.json";

const CognitiveAbillities = () => {
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
        {cognitiveList.map((item) => (
          <tr key={item.NO}>
            <td>{item.NO}</td>
            <td>{item.trait}</td>
            <td>{item.requiredField ? "Yes" : "No"}</td>
            <td>{item.category}</td>
            <td>{item.score}</td>
            <td>{item.ML ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CognitiveAbillities;

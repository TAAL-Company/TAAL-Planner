import React from 'react';

const TaskPerformanceRows = ({ cognitiveAbilities, cognitiveProfileValues }) => {
  // Function to generate rows from cognitive abilities
  const generateRows = () => {
    if (!cognitiveAbilities || cognitiveAbilities.length === 0) {
      return [];
    }

    return cognitiveAbilities.map((cognitive, index) => {
      let cogValue = 1;
      if (cognitiveProfileValues !== undefined && cognitiveProfileValues[index] !== undefined) {
        cogValue = cognitiveProfileValues[index];
      }

      return {
        id: index,
        fieldHE: cognitive.trait,
        mustField: cognitive.requiredField,
        grade: cogValue,
        classificationHE: cognitive.category,
        MLFactor: cognitive.ML,
      };
    });
  };

  return { generateRows };
};

export default TaskPerformanceRows;

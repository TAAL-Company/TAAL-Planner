import React from 'react';

const TaskAbilityRows = ({ tasks, route, cognitiveRequirements }) => {
  // Function to generate rows from tasks
  const generateRows = () => {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    return tasks.map((task) => {
      const cogReq = cognitiveRequirements.find((req) => req.taskId === task.id);
      let cognitiveRequirementsValues = [];

      if (cogReq && cogReq.value) {
        for (let index = 0; index < cogReq.value.length; index++) {
          const value = cogReq.value[index];
          const weight = cogReq.weights[index];

          let charCode = weight + 64;
          let char = String.fromCharCode(charCode);

          let valueAndWeight = char + value;
          cognitiveRequirementsValues[index] = valueAndWeight;
        }
      }

      return {
        id: task.position,
        taskTaskabilityHE: task.title,
        routeTaskabilityHE: route.name,
        uuid: task.id,
        cognitiveRequirements: cogReq,
        ...cognitiveRequirementsValues.reduce((acc, value, index) => {
          acc[index] = value;
          return acc;
        }, {}),
      };
    });
  };

  return { generateRows };
};

export default TaskAbilityRows;

import React from 'react';

const GeneralPerformanceRows = ({ cognitiveList }) => {
  // Function to generate rows from cognitive list
  const generateRows = () => {
    if (!cognitiveList || cognitiveList.length === 0) {
      return [];
    }

    return cognitiveList.map((item, index) => ({
      id: index,
      index: item.index,
      trait: item.trait,
      requiredField: item.requiredField,
      category: item.category,
      score: item.score,
      ML: item.ML,
    }));
  };

  return { generateRows };
};

export default GeneralPerformanceRows;

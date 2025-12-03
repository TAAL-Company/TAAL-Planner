import React from 'react';

const FlagsRows = ({ flags, expandedRows }) => {
  // Function to generate rows with additional details if needed
  const getRowsWithDetails = () => {
    const rows = [];
    flags.forEach((flag) => {
      rows.push(flag); // Push the main flag row
      if (expandedRows[flag.id]) {
        // Add additional details as rows for expanded flag
        rows.push({
          id: `${flag.id}-details`,
          image: flag.image,
          task: flag.task,
          classification: flag.classification,
          intervention: flag.intervention,
          Alternatives: flag.Alternatives,
          explaination: flag.explaination,
          TaskAbilitylist: flag.TaskAbilitylist,
          isDetail: true, // Mark this row as a detail row
        });
      }
    });
    return rows;
  };

  return { getRowsWithDetails };
};

export default FlagsRows;

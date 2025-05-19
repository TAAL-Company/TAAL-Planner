import React from 'react';

const Rows = ({ coaches, expandedRows }) => {
  // Function to generate rows with additional details if needed
  const getRowsWithDetails = () => {
    const rows = [];
    coaches.forEach((coach) => {
      rows.push(coach); // Push the main coach row
      if (expandedRows[coach.id]) {
        // Add additional details as rows for expanded coach
        rows.push({
          id: `${coach.id}-details`, // Unique ID for the detail row
          email: coach.email,
          name: coach.name,
          phone: coach.phone,
          picture_url: coach.picture_url,
          isDetail: true, // Mark this row as a detail row
        });
      }
    });
    return rows;
  };

  return { getRowsWithDetails };
};

export default Rows;
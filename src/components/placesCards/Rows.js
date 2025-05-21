import React from 'react';

const Rows = ({ sites, expandedRows }) => {
  const getRowsWithDetails = () => {
    const rows = [];
    sites.forEach((site) => {
      rows.push(site);      
    });
    return rows;
  };

  return { getRowsWithDetails };
};

export default Rows;
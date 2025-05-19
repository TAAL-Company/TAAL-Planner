import React from 'react';

const Rows = ({ sites, expandedRows }) => {
  const getRowsWithDetails = () => {
    const rows = [];
    sites.forEach((site) => {
      rows.push(site);
      if (expandedRows[site.id]) {
        rows.push({
          id: `${site.id}-details`,
          name: site.name,
          description: site.description,
          picture_url: site.picture_url,
          nameInEnglish: site.nameInEnglish,
          isDetail: true,
        });
      }
    });
    return rows;
  };

  return { getRowsWithDetails };
};

export default Rows;